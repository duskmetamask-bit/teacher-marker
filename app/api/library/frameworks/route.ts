import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface Phase {
  phase: string;
  duration: string;
  description: string;
}

interface Framework {
  id: string;
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  whenToUse: string;
  structure: Phase[];
  ac9Aligned: boolean;
  aitslStandard: string;
  tags: string[];
}

interface FrameworksData {
  frameworks: Framework[];
  meta: { totalFrameworks: number; lastUpdated: string };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const dataPath = join(process.cwd(), "data", "frameworks", "index.json");
    if (!existsSync(dataPath)) {
      return NextResponse.json({ frameworks: [], meta: { totalFrameworks: 0 } }, { status: 200 });
    }

    const raw = readFileSync(dataPath, "utf-8");
    const data: FrameworksData = JSON.parse(raw);

    if (id) {
      const framework = data.frameworks.find((f) => f.id === id);
      if (!framework) {
        return NextResponse.json({ error: "Framework not found" }, { status: 404 });
      }
      return NextResponse.json({ framework, meta: data.meta });
    }

    return NextResponse.json({ frameworks: data.frameworks, meta: data.meta });
  } catch (err) {
    console.error("Frameworks API error:", err);
    return NextResponse.json({ error: "Failed to load frameworks" }, { status: 500 });
  }
}
