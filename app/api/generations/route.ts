import { NextRequest, NextResponse } from "next/server";
import { prisma, DEMO_TEACHER_ID } from "@/lib/auth";

export async function GET() {
  try {
    const generations = await prisma.generation.findMany({
      where: { teacherId: DEMO_TEACHER_ID },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        type: true,
        prompt: true,
        output: true,
        ac9Codes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ generations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load generations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, prompt, output, ac9Codes } = await req.json();

    if (!type || !prompt) {
      return NextResponse.json({ error: "type and prompt are required" }, { status: 400 });
    }

    const generation = await prisma.generation.create({
      data: {
        teacherId: DEMO_TEACHER_ID,
        type,
        prompt,
        output: output ?? null,
        ac9Codes: ac9Codes ?? [],
      },
    });

    return NextResponse.json({ generation }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create generation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
