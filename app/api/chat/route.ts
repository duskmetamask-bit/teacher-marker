import { NextRequest, NextResponse } from "next/server";
import { prisma, DEMO_TEACHER_ID } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, profile, action } = body;

    const teacherId = DEMO_TEACHER_ID;

    // Handle profile check — return from Prisma
    if (action === "checkProfile") {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { name: true, yearLevels: true, subjects: true, onboarded: true },
      });
      return NextResponse.json({ profile: teacher });
    }

    // Handle profile save — write to Prisma
    if (action === "saveProfile" && profile) {
      const saved = await prisma.teacher.upsert({
        where: { id: teacherId },
        create: {
          id: teacherId,
          email: "demo@picklenick.ai",
          name: profile.name,
          yearLevels: profile.yearLevels ?? [],
          subjects: profile.subjects ?? [],
          onboarded: true,
        },
        update: {
          name: profile.name,
          yearLevels: profile.yearLevels ?? [],
          subjects: profile.subjects ?? [],
          onboarded: true,
        },
      });
      return NextResponse.json({ success: true, profile: saved });
    }

    // Legacy: return onboarding status
    if (action === "checkOnboarding") {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { onboarded: true },
      });
      return NextResponse.json({ onboarded: teacher?.onboarded ?? false });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat route failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
