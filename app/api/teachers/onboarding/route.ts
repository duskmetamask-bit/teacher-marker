import { NextRequest, NextResponse } from "next/server";
import { prisma, DEMO_TEACHER_ID } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { yearLevels, subjects, schoolType } = await req.json();

    if (!yearLevels || !Array.isArray(yearLevels) || yearLevels.length === 0) {
      return NextResponse.json({ error: "At least one year level is required" }, { status: 400 });
    }
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ error: "At least one subject is required" }, { status: 400 });
    }

    const teacher = await prisma.teacher.update({
      where: { id: DEMO_TEACHER_ID },
      data: {
        yearLevels,
        subjects,
        schoolId: schoolType ?? null,
        onboarded: true,
      },
    });

    return NextResponse.json({ success: true, teacher });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Onboarding failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
