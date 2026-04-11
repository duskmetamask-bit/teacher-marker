import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }
  const client = new OpenAI({ apiKey });

  const { text, image, rubric, subject, yearLevel } = await req.json();

  if (!rubric?.trim()) {
    return NextResponse.json({ error: "Rubric is required" }, { status: 400 });
  }
  if (!subject || !yearLevel) {
    return NextResponse.json({ error: "Subject and year level are required" }, { status: 400 });
  }
  if (!text?.trim() && !image) {
    return NextResponse.json({ error: "Please provide student work text or upload an image" }, { status: 400 });
  }

  const studentWork = text?.trim()
    ? `STUDENT WORK (text submitted):\n${text}`
    : "STUDENT WORK: Image file uploaded by student";

  const prompt = `You are an expert ${subject} teacher for Australian Year ${yearLevel} students.

GRADE the student work below against the rubric provided. Be specific, constructive, and fair.

${studentWork}

RUBRIC:
${rubric}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "score": "X/10",
  "summary": "2-3 sentence overall summary of student performance",
  "breakdown": [
    { "criterion": "Criterion Name", "marks": "X/Y", "feedback": "Specific feedback for this criterion" }
  ],
  "areasToImprove": ["Point 1", "Point 2"],
  "nextSteps": "What the teacher should focus on next — 2-3 sentences"
}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content as string);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Grading failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}