import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface Unit {
  id: string;
  slug: string;
  title: string;
  subject: string;
  yearLevel: string;
  topic: string;
  framework: string;
  duration: string;
  lessons: number;
  ac9Codes: string[];
  status: "draft" | "polished" | "deployed";
  mentorText?: string;
  deployedUrl?: string;
  description: string;
  tags: string[];
  createdAt: string;
}

interface UnitsData {
  units: Unit[];
  meta: { totalUnits: number; lastUpdated: string; version: string };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const yearLevel = searchParams.get("yearLevel");
    const framework = searchParams.get("framework");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const dataPath = join(process.cwd(), "data", "units", "index.json");
    if (!existsSync(dataPath)) {
      return NextResponse.json({ units: [], meta: { totalUnits: 0 } }, { status: 200 });
    }

    const raw = readFileSync(dataPath, "utf-8");
    const data: UnitsData = JSON.parse(raw);

    let filtered = data.units;

    if (subject && subject !== "All") {
      filtered = filtered.filter(
        (u) => u.subject.toLowerCase() === subject.toLowerCase()
      );
    }

    if (yearLevel && yearLevel !== "All") {
      filtered = filtered.filter((u) =>
        u.yearLevel.toLowerCase().includes(yearLevel.toLowerCase())
      );
    }

    if (framework && framework !== "All") {
      filtered = filtered.filter(
        (u) => u.framework.toLowerCase() === framework.toLowerCase()
      );
    }

    if (status && status !== "All") {
      filtered = filtered.filter((u) => u.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.title.toLowerCase().includes(q) ||
          u.topic.toLowerCase().includes(q) ||
          u.subject.toLowerCase().includes(q) ||
          u.tags.some((t) => t.toLowerCase().includes(q)) ||
          u.ac9Codes.some((c) => c.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      units: paginated,
      meta: {
        ...data.meta,
        totalUnits: total,
        returned: paginated.length,
        offset,
        limit,
      },
    });
  } catch (err) {
    console.error("Units API error:", err);
    return NextResponse.json({ error: "Failed to load units" }, { status: 500 });
  }
}
