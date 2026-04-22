import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const units = await prisma.unit.findMany({
      where: { teacherId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        yearLevel: true,
        subject: true,
        ac9Codes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ units });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load units";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, yearLevel, subject, ac9Codes, content } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const unit = await prisma.unit.create({
      data: {
        teacherId: session.user.id,
        title: title.trim(),
        yearLevel: yearLevel ?? null,
        subject: subject ?? null,
        ac9Codes: ac9Codes ?? [],
        content: content ?? {},
      },
    });

    return NextResponse.json({ unit }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create unit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
