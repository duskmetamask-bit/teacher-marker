import { NextRequest, NextResponse } from "next/server";
import { chatWithAgent, chatWithAgentStream } from "@/lib/agent";
import { getTeacherProfile, saveTeacherProfile } from "@/lib/supabase";

// Simple SSE formatter — handles both strings and JSON objects
function sse(data: unknown, event?: string): string {
  return `${event ? `event: ${event}\n` : ""}data: ${typeof data === "string" ? data : JSON.stringify(data)}\n\n`;
}

// ─── Badge utilities (inlined for Vercel compatibility) ─────────────────────────────────
function extractAC9Codes(text: string): string[] {
  const matches = text.match(/AC9[A-Z]\d{1,2}[A-Z]{2}\d{2}/gi);
  return matches ? [...new Set(matches.map(c => c.toUpperCase()))] : [];
}

function extractAITSLStandards(text: string): string[] {
  const matches = text.match(/AITSL\s+(focus\s+area\s+)?(\d+\.?\d*)/gi);
  if (!matches) return [];
  return [...new Set(matches.map(m => {
    const num = m.match(/\d+\.?\d*/)?.[0];
    return num ? `AITSL ${num}` : m;
  }))];
}

const OFF_TOPIC_KEYWORDS = ['recipe','cook','food','weather','sports','movie','music','politics','medical','legal advice','symptoms','diagnosis','restaurant','gaming','fashion','celebrity','stocks','crypto'];
const TEACHING_KEYWORDS = ['lesson','unit','plan','rubric','assessment','curriculum','AC9','AITSL','year level','student','classroom','teaching','school','education','teach','worksheet','activity','instruction','differentiation','pedagogy','scaffolding','rubrics','task','outcome','standard','syllabus','WA','Australia'];

function isOffTopic(text: string): boolean {
  const lower = text.toLowerCase();
  const hasOffTopic = OFF_TOPIC_KEYWORDS.some(k => lower.includes(k));
  const hasTeaching = TEACHING_KEYWORDS.some(k => lower.includes(k));
  return hasOffTopic && !hasTeaching;
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

    // ─── MOCK MODE — Phase 1 demo without real OpenAI API ─────────────────────────────────
    if (body.mock === true) {
      const encoder = new TextEncoder();
      const userMessage = messages?.[messages.length - 1]?.content || "";
      const offTopic = isOffTopic(userMessage);

      if (offTopic) {
        const stream = new ReadableStream({
          start(controller) {
            const text = "I'm a teaching assistant, not a chef. I can help with lesson plans, assessment rubrics, AC9 curriculum alignment, and classroom strategies. What teaching topic are you working on?";
            const tokens = text.split("");
            let i = 0;
            const interval = setInterval(() => {
              if (i < tokens.length) {
                controller.enqueue(encoder.encode(sse({ type: "token", content: tokens[i] })));
                i++;
              } else {
                controller.enqueue(encoder.encode(sse({ type: "guardrail", message: "teaching" })));
                controller.enqueue(encoder.encode(sse({ type: "done" })));
                controller.close();
                clearInterval(interval);
              }
            }, 20);
          }
        });
        return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" } });
      }

      // Mock teaching response with AC9 and AITSL
      const mockResponse = "Here's a 3-week unit on fractions for Year 4 Mathematics. This unit covers AC9E4MA01 and AC9E4MA02, aligned with AITSL 3.2 and AITSL 5.1. Students will develop understanding of part-whole relationships through concrete materials and visual models.";
      const ac9Codes = extractAC9Codes(mockResponse);
      const aitslStandards = extractAITSLStandards(mockResponse);

      const stream = new ReadableStream({
        start(controller) {
          const tokens = mockResponse.split("");
          let i = 0;
          const interval = setInterval(() => {
            if (i < tokens.length) {
              controller.enqueue(encoder.encode(sse({ type: "token", content: tokens[i] })));
              i++;
            } else {
              controller.enqueue(encoder.encode(sse({ type: "ac9", codes: ac9Codes })));
              controller.enqueue(encoder.encode(sse({ type: "aitsl", standards: aitslStandards })));
              controller.enqueue(encoder.encode(sse({ type: "done" })));
              controller.close();
              clearInterval(interval);
            }
          }, 25);
        }
      });
      return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" } });
    }

    // ─── REAL STREAMING MODE ─────────────────────────────────────────────────────────────────

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
