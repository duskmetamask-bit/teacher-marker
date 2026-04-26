import { NextRequest, NextResponse } from "next/server";
import { getPrisma, DEMO_TEACHER_ID } from "@/lib/auth";

export async function GET() {
  try {
    const prisma = getPrisma();
    const teacher = await prisma.teacher.findUnique({
      where: { id: DEMO_TEACHER_ID },
    });
    if (!teacher || !teacher.onboarded) {
      return NextResponse.json({ profile: null });
    }
    return NextResponse.json({
      profile: {
        name: teacher.name,
        yearLevels: teacher.yearLevels,
        subjects: teacher.subjects,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, yearLevels, subjects, schoolType } = await req.json();

    if (!yearLevels || !Array.isArray(yearLevels) || yearLevels.length === 0) {
      return NextResponse.json({ error: "At least one year level is required" }, { status: 400 });
    }
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ error: "At least one subject is required" }, { status: 400 });
    }

    const prisma = getPrisma();
    const teacher = await prisma.teacher.upsert({
      where: { id: DEMO_TEACHER_ID },
      create: {
        id: DEMO_TEACHER_ID,
        email: "demo@picklenick.ai",
        name: name ?? "",
        yearLevels,
        subjects,
        schoolId: schoolType ?? null,
        onboarded: true,
      },
      update: {
        name: name ?? "",
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
