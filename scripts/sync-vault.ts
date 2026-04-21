#!/usr/bin/env npx ts-node
/**
 * PickleNickAI Vault Sync Script
 *
 * Reads from the local vault directory and generates the data/ JSON files
 * that the Next.js app reads at runtime.
 *
 * Usage: npx ts-node scripts/sync-vault.ts
 * Or:    node scripts/sync-vault.ts (if compiled)
 *
 * The agent runs this after building new units, then commits the changes to GitHub.
 * Vercel reads from data/ at runtime via API routes.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, cpSync } from "fs";
import { join, basename } from "path";

const VAULT_BASE = "/home/dusk/.openclaw/vault/dawn-vault/shared/PROJECTS/pickle-nick-ai";
const DATA_BASE = join(__dirname, "..", "data");

// ─── Helpers ────────────────────────────────────────────────────────

function readJson<T>(path: string): T | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

// ─── Units ─────────────────────────────────────────────────────────

function buildUnitsIndex(): void {
  const unitsDir = join(VAULT_BASE, "units");
  if (!existsSync(unitsDir)) {
    console.warn("Vault units directory not found:", unitsDir);
    return;
  }

  const entries = readdirSync(unitsDir, { withFileTypes: true });
  const units: Record<string, unknown>[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const unitDir = join(unitsDir, entry.name);
      const contentPath = join(unitDir, "content.md");
      const indexPath = join(unitDir, "index.json");

      // Try to read existing index metadata
      const meta = readJson<{
        id?: string;
        title?: string;
        subject?: string;
        yearLevel?: string;
        topic?: string;
        framework?: string;
        status?: string;
        ac9Codes?: string[];
        mentorText?: string;
        description?: string;
        tags?: string[];
      }>(indexPath);

      if (meta) {
        units.push({
          id: meta.id ?? entry.name,
          slug: entry.name,
          title: meta.title ?? entry.name,
          subject: meta.subject ?? "General",
          yearLevel: meta.yearLevel ?? "Year 3",
          topic: meta.topic ?? "",
          framework: meta.framework ?? "WIEP",
          status: meta.status ?? "draft",
          ac9Codes: meta.ac9Codes ?? [],
          mentorText: meta.mentorText,
          description: meta.description ?? "",
          tags: meta.tags ?? [],
          createdAt: new Date().toISOString().split("T")[0],
        });
      }
    } else if (entry.name.endsWith(".md") && !entry.name.includes("POLISHED")) {
      // Root .md files — single-file units
      const slug = entry.name.replace(".md", "");
      const content = readFileSync(join(unitsDir, entry.name), "utf-8").slice(0, 500);
      units.push({
        id: slug,
        slug,
        title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        subject: "General",
        yearLevel: "Year 3",
        topic: "",
        framework: "WIEP",
        status: "draft",
        ac9Codes: [],
        description: content.slice(0, 200),
        tags: [],
        createdAt: new Date().toISOString().split("T")[0],
      });
    }
  }

  const output: Record<string, unknown> = {
    units,
    meta: {
      totalUnits: units.length,
      lastUpdated: new Date().toISOString(),
      version: "1.0.0",
    },
  };

  ensureDir(join(DATA_BASE, "units"));
  writeFileSync(
    join(DATA_BASE, "units", "index.json"),
    JSON.stringify(output, null, 2),
    "utf-8"
  );
  console.log(`Synced ${units.length} units to data/units/index.json`);
}

// ─── Curriculum ───────────────────────────────────────────────────

function buildCurriculumIndex(): void {
  const curriculumDir = join(VAULT_BASE, "curriculum");
  if (!existsSync(curriculumDir)) {
    console.warn("Vault curriculum directory not found:", curriculumDir);
    return;
  }

  const entries = readdirSync(curriculumDir);
  const subjects: Record<string, unknown>[] = [];

  for (const entry of entries) {
    if (entry.endsWith(".md")) {
      const slug = entry.replace(".md", "");
      const content = readFileSync(join(curriculumDir, entry), "utf-8");
      subjects.push({
        id: slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        content: content.slice(0, 1000),
        file: entry,
      });
    }
  }

  const output = {
    subjects,
    meta: {
      totalSubjects: subjects.length,
      lastUpdated: new Date().toISOString(),
    },
  };

  ensureDir(join(DATA_BASE, "curriculum"));
  writeFileSync(
    join(DATA_BASE, "curriculum", "index.json"),
    JSON.stringify(output, null, 2),
    "utf-8"
  );
  console.log(`Synced ${subjects.length} curriculum files to data/curriculum/index.json`);
}

// ─── Frameworks ───────────────────────────────────────────────────

function buildFrameworksIndex(): void {
  const frameworksDir = join(VAULT_BASE, "frameworks");
  if (!existsSync(frameworksDir)) {
    console.warn("Vault frameworks directory not found:", frameworksDir);
    return;
  }

  const entries = readdirSync(frameworksDir);
  const frameworks: Record<string, unknown>[] = [];

  for (const entry of entries) {
    if (entry.endsWith(".md")) {
      const slug = entry.replace(".md", "");
      const content = readFileSync(join(frameworksDir, entry), "utf-8");
      frameworks.push({
        id: slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        content: content.slice(0, 1000),
        file: entry,
      });
    }
  }

  const output = {
    frameworks,
    meta: {
      totalFrameworks: frameworks.length,
      lastUpdated: new Date().toISOString(),
    },
  };

  ensureDir(join(DATA_BASE, "frameworks"));
  writeFileSync(
    join(DATA_BASE, "frameworks", "index.json"),
    JSON.stringify(output, null, 2),
    "utf-8"
  );
  console.log(`Synced ${frameworks.length} framework files to data/frameworks/index.json`);
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log("Starting PickleNickAI vault sync...");
  console.log("Vault:", VAULT_BASE);
  console.log("Output:", DATA_BASE);

  ensureDir(DATA_BASE);
  ensureDir(join(DATA_BASE, "units"));
  ensureDir(join(DATA_BASE, "curriculum"));
  ensureDir(join(DATA_BASE, "frameworks"));

  buildUnitsIndex();
  buildCurriculumIndex();
  buildFrameworksIndex();

  // Write meta.json
  writeFileSync(
    join(DATA_BASE, "meta.json"),
    JSON.stringify({
      syncedAt: new Date().toISOString(),
      vaultBase: VAULT_BASE,
    }, null, 2),
    "utf-8"
  );

  console.log("Vault sync complete.");
}

main().catch(console.error);
