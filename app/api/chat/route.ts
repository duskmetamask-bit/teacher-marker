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

      // Mock teaching response with AC9 and AITSL — varied based on query keywords
      const lowerMessage = userMessage.toLowerCase();
      let mockResponse = "";
      let ac9Codes: string[] = [];
      let aitslStandards: string[] = [];

      if (lowerMessage.includes("math") || lowerMessage.includes("fraction") || lowerMessage.includes("number") || lowerMessage.includes("geometry") || lowerMessage.includes("algebra")) {
        mockResponse = "Here's a complete 8-week unit plan on Fractions for Year 4 Mathematics. This unit covers AC9E4MA01 and AC9E4MA02, aligned with AITSL 3.2 and AITSL 5.1. Students will develop deep understanding of part-whole relationships through concrete materials, visual models, and real-world contexts. The unit includes: 24 detailed lesson plans using WIEP framework, cold/hot tasks for formative assessment, A-E rubric with four criteria (understanding, fluency, problem-solving, reasoning), and differentiation tasks for EAL and gifted learners. By the end, students will confidently identify, model, and compare fractions, meeting AC9E4MA01 and AC9E4MA02 outcomes.";
        ac9Codes = ["AC9E4MA01", "AC9E4MA02"];
        aitslStandards = ["AITSL 3.2", "AITSL 5.1"];
      } else if (lowerMessage.includes("writing") || lowerMessage.includes("narrative") || lowerMessage.includes("english") || lowerMessage.includes("reading") || lowerMessage.includes("literature")) {
        mockResponse = "Here's a complete 8-week English unit on Narrative Writing for Year 3-4. This unit aligns with AC9E3LR01 and AC9E4LR01, covering AITSL focus areas 2.1 and 3.2. Students will explore mentor texts from established Australian children's authors, analyzing structure, character development, and language features. The unit includes: detailed lesson plans using the 5E model, a cold task and hot task for assessment, complete A-E rubric evaluating plot structure, character, language, and conventions. I've included differentiation tasks for EAL students (scaffolding frames and visual supports) and extension prompts for gifted writers. By unit end, students will independently compose a multi-paragraph narrative demonstrating the taught structures and features.";
        ac9Codes = ["AC9E3LR01", "AC9E4LR01"];
        aitslStandards = ["AITSL 2.1", "AITSL 3.2"];
      } else if (lowerMessage.includes("rubric") || lowerMessage.includes("assessment") || lowerMessage.includes("criteria") || lowerMessage.includes("evaluate") || lowerMessage.includes("grade")) {
        const rubricType = (lowerMessage.includes("writing") || lowerMessage.includes("essay") || lowerMessage.includes("text")) ? "Informative Writing" : "General Assessment";
        mockResponse = `Here's a comprehensive A-E Rubric for ${rubricType} aligned with AC9 curriculum standards and AITSL focus areas 5.1 and 5.2. The rubric has four criteria: Knowledge and Understanding, Skills and Application, Communication, and Reflection. Each criterion has descriptors for A (Exceeding), B (Achieving), C (Developing), D (Beginning), and E (Additional Support needed). I've also included a separate section for EAL adjustments — students can demonstrate understanding through drawings, oral explanations, or translated texts. This rubric supports both formative feedback during the unit and summative reporting at unit's end.`;
        ac9Codes = ["AC9E4LR01", "AC9E4MA01"];
        aitslStandards = ["AITSL 5.1", "AITSL 5.2"];
      } else if (lowerMessage.includes("differentiat") || lowerMessage.includes("eal") || lowerMessage.includes("gifted") || lowerMessage.includes("adjustment") || lowerMessage.includes("sen")) {
        mockResponse = "Here's a comprehensive differentiation guide for mixed-ability Year 5 classrooms, aligned with AITSL focus areas 1.5, 3.2, and 4.2. For EAL students: use visual scaffolds (sentence stems, word walls, graphic organizers), allow home language demonstrations of understanding, provide bilingual glossaries for key vocabulary, and modify assessment through drawings or oral responses. For gifted learners: open-ended extension tasks requiring higher-order thinking (create, evaluate, synthesize), independent research projects aligned with AC9H3-04, compacting so they skip mastered content and move to advanced challenges. For students with adjustments (NCCD): consult their IEP/ILP, provide modified success criteria aligned to AC9E4LR01, use assistive technology for demonstration of learning, and pre-teach vocabulary in multiple modalities. The key is: same quality standard, different pathways to demonstrate mastery.";
        ac9Codes = ["AC9E4LR01", "AC9H3-04"];
        aitslStandards = ["AITSL 1.5", "AITSL 3.2", "AITSL 4.2"];
      } else if (lowerMessage.includes("inquiry") || lowerMessage.includes("hass") || lowerMessage.includes("science") || lowerMessage.includes("history") || lowerMessage.includes("geography")) {
        mockResponse = "Here's a complete 6-week Inquiry Unit on Australian Ecosystems for Year 5 HASS/Science, aligned with AC9HS4X01 and AC9S5U01, covering AITSL focus areas 2.1, 3.2, and 5.1. This inquiry follows the Guided Inquiry model: Open (activate prior knowledge through a nature walk and KWL chart), Explore (research local Australian ecosystems using DE resources and citizen science data), Gather (structured research on biotic/abiotic factors, food webs, human impacts), Organize (collaborative concept mapping of ecosystem relationships), Create (students develop an ecosystem action plan addressing local environmental issue), and Evaluate (peer review and reflection using success criteria). The unit includes a pre/post assessment task measuring understanding of ecosystem interconnections, rubrics for inquiry skills and content knowledge, and cross-curricular links to English (information reports) and Mathematics (data representation from ecosystem data).";
        ac9Codes = ["AC9HS4X01", "AC9S5U01"];
        aitslStandards = ["AITSL 2.1", "AITSL 3.2", "AITSL 5.1"];
      } else if (lowerMessage.includes("lesson") || lowerMessage.includes("direct instruction") || lowerMessage.includes("wiep") || lowerMessage.includes("5e")) {
        mockResponse = `Here's a detailed WIEP-format lesson plan for Year 4 Mathematics on Equivalent Fractions (AC9E4MA03), aligned with AITSL focus area 3.2. The Warm-up (8 min): Fluency game with fraction tiles — students race to show equivalent pairs. I do (12 min): Explicit teaching using projector to demonstrate with Cuisenaire rods — model finding equivalent fractions, think-aloud the process, highlight that multiplication/division by 1 preserves value. We do (15 min): Guided practice — students work in pairs with sentence frames. You do (15 min): Independent practice with tiered worksheet (mild/medium/spicy — choose their challenge). The plenary uses exit ticket. This lesson includes: differentiation for EAL students (visual fraction tiles, sentence stems), ADHD-friendly movement breaks, and extension for early finishers (challenge card: find 3 equivalent fractions). The rubric criterion for this lesson is: Understand equivalence, Apply to new situations.`;
        ac9Codes = ["AC9E4MA03"];
        aitslStandards = ["AITSL 3.2"];
      } else if (lowerMessage.includes("behaviour") || lowerMessage.includes("classroom management") || lowerMessage.includes("conflict") || lowerMessage.includes("engagement")) {
        mockResponse = `Here's an evidence-based classroom management strategy aligned with AITSL focus area 4.2 and the Positive Relationships framework. The approach has three layers: Prevention (proactive setup): Visual timetable, first-then boards, desk arrangements supporting transitions, pre-taught routine for transitions. Intervention (de-escalation): Cool off corner with sensory tools, 90-second connect-and-relate before correction, use of low-arousal voice, and focus on the next right step. Post-incident: 24hr cooling off, then collaborative conversation to process and plan. Key principle: relationship before curriculum. The students who need the most connection will test it the most — and that's not a bug, it's the brain seeking safety. I've also included a visual emotion regulation chart you can print for individual students who need it, and a parent communication template for follow-up after significant incidents.`;
        ac9Codes = [];
        aitslStandards = ["AITSL 4.2"];
      } else {
        // Default: general teaching assistant
        mockResponse = "As your expert teaching assistant, I'm here to help with any aspect of your teaching practice. Whether you need unit plans aligned to AC9 curriculum codes, detailed lesson plans using frameworks like WIEP, 5E, or Direct Instruction, assessment rubrics with A-E criteria, differentiation strategies for EAL/gifted/SEN students, or advice on classroom management and pedagogical approaches — I've got you covered. I know the Australian Curriculum v9 inside-out, WA context and mandatory reporting requirements, AITSL professional standards, and evidence-based teaching methodologies. What specific topic or unit are you working on right now? Give me a year level, subject area, and I'll deliver something ready to use in your classroom today.";
        ac9Codes = [];
        aitslStandards = [];
      }

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
