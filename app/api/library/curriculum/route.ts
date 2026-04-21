import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface Subject {
  id: string;
  name: string;
  shortName: string;
  strands: string[];
  yearLevels: string[];
  description: string;
  crossCurriculum: string[];
}

interface CurriculumData {
  subjects: Subject[];
  meta: { totalSubjects: number; lastUpdated: string };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const dataPath = join(process.cwd(), "data", "curriculum", "index.json");
    if (!existsSync(dataPath)) {
      return NextResponse.json({ subjects: [], meta: { totalSubjects: 0 } }, { status: 200 });
    }

    const raw = readFileSync(dataPath, "utf-8");
    const data: CurriculumData = JSON.parse(raw);

    if (id) {
      const subject = data.subjects.find((s) => s.id === id);
      if (!subject) {
        return NextResponse.json({ error: "Subject not found" }, { status: 404 });
      }
      return NextResponse.json({ subject, meta: data.meta });
    }

    return NextResponse.json({ subjects: data.subjects, meta: data.meta });
  } catch (err) {
    console.error("Curriculum API error:", err);
    return NextResponse.json({ error: "Failed to load curriculum" }, { status: 500 });
  }
}
