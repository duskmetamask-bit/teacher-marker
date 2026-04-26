import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { classifyMessage, CORE_SKILLS } from "@/lib/skills/registry";
import { SkillLoader } from "@/lib/skills/loader";
import { buildSystemPrompt, TeacherContext } from "@/lib/skills/builder";
import { validateFromText } from "@/lib/curriculum/validator";
import { prisma, getPrisma, DEMO_TEACHER_ID } from "@/lib/auth";

const NIM_API_KEY = process.env.NIM_API_KEY;
const NIM_MODEL = process.env.LLM_MODEL || "nvidia/nemotron-mini-4b-instruct";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.NIM_API_KEY;
    if (!apiKey) throw new Error('NIM_API_KEY not set');
    _client = new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });
  }
  return _client;
}

interface StreamEvent {
  stage: "classifying" | "loading_skills" | "thinking" | "validating" | "done";
  content: string;
  ac9_codes?: string[];
}

function sse(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  if (!NIM_API_KEY) {
    return NextResponse.json({ error: "NIM_API_KEY not configured" }, { status: 500 });
  }

  const teacherId = DEMO_TEACHER_ID;

  try {
    const body = await req.json();
    const { message } = body as { message: string };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // ─── Stage 1: Classifying ───────────────────────────────────
          controller.enqueue(encoder.encode(sse({ stage: "classifying", content: "Understanding your question..." })));

          const domainSkills = classifyMessage(message);
          const allSkills = [...CORE_SKILLS, ...domainSkills];

          controller.enqueue(encoder.encode(sse({
            stage: "classifying",
            content: `Identified ${domainSkills.length > 0 ? `${domainSkills.length} domain skill${domainSkills.length > 1 ? "s" : ""}` : "core knowledge"}`,
          })));

          // ─── Stage 2: Loading Skills ─────────────────────────────────
          controller.enqueue(encoder.encode(sse({ stage: "loading_skills", content: "Loading teaching knowledge..." })));

          const skillContents = await SkillLoader.load(allSkills);
          const loadedCount = skillContents.filter(c => c.length > 0).length;
          controller.enqueue(encoder.encode(sse({
            stage: "loading_skills",
            content: `Loaded ${loadedCount} skill${loadedCount !== 1 ? "s" : ""}`,
          })));

          // ─── Stage 3: Thinking (NIM model) ─────────────────────────
          controller.enqueue(encoder.encode(sse({ stage: "thinking", content: "Building your response..." })));

          // Load teacher profile from database (optional — fails gracefully)
          let teacherName: string | undefined;
          let teacherYearLevels: string[] = [];
          let teacherSubjects: string[] = [];

          try {
            const teacher = await prisma.teacher.findUnique({
              where: { id: teacherId },
              select: { name: true, yearLevels: true, subjects: true },
            });
            teacherName = teacher?.name ?? undefined;
            teacherYearLevels = teacher?.yearLevels ?? [];
            teacherSubjects = teacher?.subjects ?? [];
          } catch {
            // DB unavailable — continue without teacher context
          }

          const teacherContext: TeacherContext = {
            name: teacherName,
            yearLevels: teacherYearLevels,
            subjects: teacherSubjects,
          };

          const systemPrompt = buildSystemPrompt({
            teacherContext,
            skillContents: skillContents.filter(c => c.length > 0),
          });

          // Collect the full response for AC9 validation
          let fullContent = "";

          const gptResponse = await getClient().chat.completions.create({
            model: NIM_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            stream: true,
          });

          if (!gptResponse) {
            controller.enqueue(encoder.encode(sse({ stage: "done", content: "Error: Empty response from AI" })));
            controller.close();
            return;
          }

          // NIM returns an async iterable with .iterator, not .body.getReader()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const asyncIter = gptResponse as any;

          try {
            for await (const chunk of asyncIter) {
              const content = chunk.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                controller.enqueue(encoder.encode(sse({ stage: "thinking", content })));
              }
            }
          } catch (err) {
            controller.enqueue(encoder.encode(sse({ stage: "done", content: "Error: Stream failed" })));
            controller.close();
            return;
          }

          // ─── Stage 4: Validating AC9 codes ───────────────────────────
          controller.enqueue(encoder.encode(sse({ stage: "validating", content: "Validating curriculum codes..." })));

          const { valid, invalid } = validateFromText(fullContent);

          // Log generation to database (optional — fails gracefully)
          try {
            await getPrisma().generation.create({
              data: {
                teacherId,
                type: "chat",
                prompt: message,
                ac9Codes: valid,
              },
            });
          } catch {
            // Non-fatal — don't break the stream
          }

          // Send AC9 codes result
          controller.enqueue(encoder.encode(sse({
            stage: "done",
            content: "",
            ac9_codes: valid,
          })));

          // If there were invalid codes, send a warning
          if (invalid.length > 0) {
            controller.enqueue(encoder.encode(sse({
              stage: "done",
              content: "[VERIFY] The following codes could not be confirmed: " + invalid.join(", "),
            })));
          }

          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream failed";
          controller.enqueue(encoder.encode(sse({ stage: "done", content: "Error: " + msg })));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
