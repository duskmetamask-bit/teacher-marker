import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { classifyMessage, CORE_SKILLS } from "@/lib/skills/registry";
import { SkillLoader } from "@/lib/skills/loader";
import { buildSystemPrompt, TeacherContext } from "@/lib/skills/builder";
import { validateFromText } from "@/lib/curriculum/validator";
import { prisma } from "@/lib/auth";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";

interface StreamEvent {
  stage: "classifying" | "loading_skills" | "thinking" | "validating" | "done";
  content: string;
  ac9_codes?: string[];
}

function sse(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherId = session.user.id;

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

          // ─── Stage 3: Thinking (GPT-4o Mini) ─────────────────────────
          controller.enqueue(encoder.encode(sse({ stage: "thinking", content: "Building your response..." })));

          // Load teacher profile from database
          const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            select: { name: true, yearLevels: true, subjects: true },
          });

          const teacherContext: TeacherContext = {
            name: teacher?.name ?? undefined,
            yearLevels: teacher?.yearLevels ?? [],
            subjects: teacher?.subjects ?? [],
          };

          const systemPrompt = buildSystemPrompt({
            teacherContext,
            skillContents: skillContents.filter(c => c.length > 0),
          });

          // Collect the full response for AC9 validation
          let fullContent = "";

          const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: OPENAI_MODEL,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
              ],
              stream: true,
            }),
          });

          if (!gptResponse.ok) {
            controller.enqueue(encoder.encode(sse({ stage: "done", content: "Error: GPT API returned " + gptResponse.status })));
            controller.close();
            return;
          }

          if (!gptResponse.body) {
            controller.enqueue(encoder.encode(sse({ stage: "done", content: "Error: Empty response from GPT" })));
            controller.close();
            return;
          }

          const reader = gptResponse.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              if (data === "") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  controller.enqueue(encoder.encode(sse({ stage: "thinking", content })));
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }

          // ─── Stage 4: Validating AC9 codes ───────────────────────────
          controller.enqueue(encoder.encode(sse({ stage: "validating", content: "Validating curriculum codes..." })));

          const { valid, invalid } = validateFromText(fullContent);

          // Log generation to database
          await prisma.generation.create({
            data: {
              teacherId,
              type: "chat",
              prompt: message,
              ac9Codes: valid,
            },
          }).catch(() => {
            // Non-fatal — don't break the stream
          });

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
