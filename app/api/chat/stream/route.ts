import { NextRequest, NextResponse } from "next/server";
import { chatWithAgentStream } from "@/lib/agent";
import { validateFromText } from "@/lib/curriculum/validator";
import { prisma, DEMO_TEACHER_ID } from "@/lib/auth";
import { TeacherContext } from "@/lib/skills/builder";

interface StreamEvent {
  stage: "classifying" | "loading_skills" | "thinking" | "validating" | "done";
  content: string;
  ac9_codes?: string[];
}

function sse(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL;
  const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

  if (!OPENCLAW_GATEWAY_URL || !OPENCLAW_GATEWAY_TOKEN) {
    return NextResponse.json(
      { error: "OpenClaw gateway not configured. Set OPENCLAW_GATEWAY_URL and OPENCLAW_GATEWAY_TOKEN." },
      { status: 500 }
    );
  }

  const teacherId = DEMO_TEACHER_ID;

  try {
    const body = await req.json();
    const { message } = body as { message: string };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // Load teacher profile for context injection
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { name: true, yearLevels: true, subjects: true },
    });

    const teacherContext: TeacherContext = {
      name: teacher?.name ?? undefined,
      yearLevels: teacher?.yearLevels ?? [],
      subjects: teacher?.subjects ?? [],
    };

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(sse({ stage: "thinking", content: "Connecting to PickleNickAI..." })));

          const messages = [
            { role: "user" as const, content: message },
          ];

          let fullContent = "";

          for await (const chunk of chatWithAgentStream(messages, teacherContext)) {
            fullContent += chunk;
            controller.enqueue(encoder.encode(sse({ stage: "thinking", content: chunk })));
          }

          // Stage 2: Validating AC9 codes
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
