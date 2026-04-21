import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }
  const client = new OpenAI({ apiKey });

  const { subject, yearLevel, taskDescription, criteria } = await req.json();

  if (!subject || !yearLevel || !taskDescription?.trim()) {
    return NextResponse.json(
      { error: "Subject, year level, and task description are required" },
      { status: 400 }
    );
  }

  const prompt = `You are an expert Australian primary school teacher creating a detailed assessment rubric.

Create an A-E analytic rubric for:
SUBJECT: ${subject}
YEAR LEVEL: ${yearLevel}
TASK: ${taskDescription}
${criteria ? `CRITERIA TO INCLUDE: ${criteria}` : ""}

Format your response exactly as a markdown rubric with:
1. Criterion name
2. A-E descriptors (A = Excellent, B = Good, C = Satisfactory, D = Developing, E = Beginning)
3. Max marks per criterion
4. AC9 curriculum codes relevant to this task

Make descriptors specific, observable, and tied to the task. Include both process and product criteria where relevant.

Use this format:

## [Criterion Name] (/X marks)

| Grade | Descriptor |
|-------|-----------|
| A | (8-X marks) Specific, observable behaviour at mastery level |
| B | (X-2 marks) Strong performance with minor gaps |
| C | (X-3 marks) Satisfactory, meets most standards |
| D | (X-4 marks) Developing, significant gaps |
| E | (0-1 marks) Beginning, minimal evidence |

---

## [Next Criterion Name]...`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert Australian primary school teacher specialising in assessment and rubrics. You create clear, specific, observable A-E descriptors aligned to the Australian Curriculum v9.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const rubric = response.choices[0].message.content ?? "";
    return NextResponse.json({ rubric, subject, yearLevel, taskDescription });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rubric generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
