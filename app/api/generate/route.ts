import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }
  const client = new OpenAI({ apiKey });

  const { subject, yearLevel, topic, duration, objectives, focusArea, lessonType, resources, differentiation, activities } = await req.json();

  if (!topic?.trim()) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }
  if (!objectives?.trim()) {
    return NextResponse.json({ error: "Learning objectives are required" }, { status: 400 });
  }

  const activitiesText = activities?.trim() || "Not specified";

  const prompt = `You are an expert Western Australian primary school teacher creating a detailed lesson plan.

Create a complete, professional lesson plan:

SUBJECT: ${subject}
YEAR LEVEL: ${yearLevel}
FOCUS AREA / STRAND: ${focusArea}
TOPIC: ${topic}
DURATION: ${duration} minutes
LESSON TYPE: ${lessonType}
LEARNING OBJECTIVES:
${objectives}
RESOURCES: ${resources}
DIFFERENTIATION APPROACH: ${differentiation}
ACTIVITIES:
${activitiesText}

Format your response exactly like this:

═══════════════════════════════════════════════
LESSON PLAN
═══════════════════════════════════════════════
SUBJECT: ${subject} — ${focusArea}
YEAR LEVEL: ${yearLevel}
TOPIC: ${topic}
DURATION: ${duration} minutes
LESSON TYPE: ${lessonType}

───────────────────────────────────────────────
LEARNING OBJECTIVES
───────────────────────────────────────────────
[Bullet-point learning objectives expanded with specific success criteria]

───────────────────────────────────────────────
SUCCESS CRITERIA
───────────────────────────────────────────────
[3-5 concrete measurable outcomes]

───────────────────────────────────────────────
LESSON SEQUENCE (with timings)
───────────────────────────────────────────────
[Detailed breakdown — hook, explicit teaching, modelled examples, guided practice, independent task, closure — totalling ${duration} minutes. Show time for each phase.]

───────────────────────────────────────────────
RESOURCES REQUIRED
───────────────────────────────────────────────
[Specific materials and tools needed]

───────────────────────────────────────────────
DIFFERENTIATION NOTES
───────────────────────────────────────────────
[Support for lower-level AND extension for high achievers, aligned to ${differentiation} approach]

───────────────────────────────────────────────
ASSESSMENT FOR LEARNING
───────────────────────────────────────────────
[2-3 checking-for-understanding strategies]

───────────────────────────────────────────────
WA CURRICULUM ALIGNMENT
───────────────────────────────────────────────
[Relevant WA Syllabus / Australian Curriculum codes — e.g. AC9M3N06]

═══════════════════════════════════════════════`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert WA primary school teacher creating detailed, actionable lesson plans.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const plan = response.choices[0].message.content;
    return NextResponse.json({ plan });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
