import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.NIM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "NIM_API_KEY not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const markingGuideImage = formData.get("markingGuideImage") as string | null;
  const studentWorkImage = formData.get("studentWorkImage") as string | null;

  if (!markingGuideImage && !studentWorkImage) {
    return NextResponse.json({ error: "Both marking guide and student work images are required" }, { status: 400 });
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  // Step 1: Vision — extract text from both images using Nemotron VL
  const visionMessages = [
    {
      role: "user" as const,
      content: [
        {
          type: "text" as const,
          text: `You are an expert Australian primary school teacher. Your job is to carefully read ALL text visible in the provided images and transcribe it exactly.

For the MARKING GUIDE IMAGE: Extract the full rubric or marking criteria — all criteria names, weightings, and all grade level descriptors (A, B, C, D, E or 1-5 or whatever scale is used).

For the STUDENT WORK IMAGE: Extract the full student response — everything the student has written or created.

Return your transcription in this exact format:
---
MARKING GUIDE:
[full rubric text here]

STUDENT WORK:
[full student response here]
---`,
        },
        {
          type: "image_url" as const,
          image_url: {
            url: markingGuideImage || studentWorkImage!,
            detail: "high" as const,
          },
        },
      ],
    },
  ];

  let markingGuideText = "";
  let studentWorkText = "";

  try {
    const visionResponse = await client.chat.completions.create({
      model: "nvidia/nemotron-nano-12b-v2-vl",
      messages: visionMessages,
      max_tokens: 4096,
      temperature: 0.3,
    });

    const visionContent = visionResponse.choices[0]?.message?.content || "";

    // Parse out the two sections
    const guideMatch = visionContent.match(/MARKING GUIDE:([\s\S]*?)STUDENT WORK:/);
    const workMatch = visionContent.match(/STUDENT WORK:([\s\S]*?)(?:---|$)/);

    markingGuideText = guideMatch?.[1]?.trim() || "";
    studentWorkText = workMatch?.[1]?.trim() || "";

    if (!markingGuideText && !studentWorkText) {
      // Fallback: use entire response as combined
      markingGuideText = visionContent;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vision extraction failed";
    return NextResponse.json({ error: `Vision error: ${message}` }, { status: 500 });
  }

  // Step 2: Grading — use DeepSeek V3.2 to grade student work against rubric
  const gradingPrompt = `You are an expert Australian primary school teacher. Grade the student work below against the marking guide/rubric provided.

MARKING GUIDE / RUBRIC:
${markingGuideText || "No marking guide provided."}

STUDENT WORK:
${studentWorkText || "No student work provided."}

Grade the student work against each criterion in the rubric. Be specific, constructive, and fair. Consider the year level context (Australian F-6 primary school).

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
    const gradingResponse = await client.chat.completions.create({
      model: "deepseek-ai/deepseek-v3.2",
      messages: [{ role: "user", content: gradingPrompt }],
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const resultContent = gradingResponse.choices[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(resultContent);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        score: "Error",
        summary: "Failed to parse grading result",
        breakdown: [],
        areasToImprove: [],
        nextSteps: "",
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Grading failed";
    return NextResponse.json({ error: `Grading error: ${message}` }, { status: 500 });
  }
}
