import { NextRequest, NextResponse } from "next/server";
import { prisma, DEMO_TEACHER_ID } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const unit = await prisma.unit.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        yearLevel: true,
        subject: true,
        ac9Codes: true,
        content: true,
        createdAt: true,
        teacherId: true,
      },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (unit.teacherId !== DEMO_TEACHER_ID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ unit });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load unit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const unit = await prisma.unit.findUnique({
      where: { id },
      select: { teacherId: true },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (unit.teacherId !== DEMO_TEACHER_ID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.unit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete unit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
