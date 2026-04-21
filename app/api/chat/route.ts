import { NextRequest, NextResponse } from "next/server";
import { chatWithAgent, chatWithAgentStream } from "@/lib/agent";
import { getTeacherProfile, saveTeacherProfile } from "@/lib/supabase";

// Simple SSE formatter
function sse(message: string, event?: string): string {
  return `${event ? `event: ${event}\n` : ""}data: ${JSON.stringify(message)}\n\n`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, profile, action, stream } = body;

    // Handle profile check
    if (body.checkProfile && sessionId) {
      const teacherProfile = await getTeacherProfile(sessionId);
      return NextResponse.json({ profile: teacherProfile });
    }

    // Handle profile save
    if (action === "saveProfile" && sessionId && profile) {
      const saved = await saveTeacherProfile(sessionId, profile);
      if (saved) {
        return NextResponse.json({ success: true, profile: saved });
      }
      return NextResponse.json({ success: false, error: "Failed to save profile" }, { status: 500 });
    }

    // Handle chat
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Fetch teacher profile
    const teacherProfile = await getTeacherProfile(sessionId);

    // Onboarding check
    const userMessages = messages.filter((m: { role: string }) => m.role === "user");
    const needsOnboarding = userMessages.length < 2 && !teacherProfile?.name;
    if (needsOnboarding) {
      return NextResponse.json({ needsOnboarding: true });
    }

    // Streaming mode
    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of chatWithAgentStream(messages, teacherProfile)) {
              controller.enqueue(encoder.encode(sse(chunk)));
            }
            controller.enqueue(encoder.encode(sse("[DONE]", "done")));
          } catch (err) {
            controller.enqueue(encoder.encode(sse(`Error: ${err instanceof Error ? err.message : "stream failed"}`)));
          } finally {
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
    }

    // Non-streaming mode
    const reply = await chatWithAgent(messages, teacherProfile);
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}