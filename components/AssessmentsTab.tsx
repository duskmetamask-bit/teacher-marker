"use client";

import { useState } from "react";
import { C, shadows, radius, SUBJECT_COLORS } from "@/lib/design";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & PE", "Humanities"];
const YEAR_LEVELS = ["Foundation", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const ASSESSMENT_TYPES = ["Summative", "Formative", "Diagnostic", "Peer Assessment"];

interface Rubric {
  id: string;
  subject: string;
  yearLevel: string;
  type: string;
  task: string;
  criteria: { level: string; descriptor: string }[];
  createdAt: string;
}

export default function AssessmentsTab() {
  const [subject, setSubject] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [assessmentType, setAssessmentType] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [error, setError] = useState("");

  // Load saved rubrics from localStorage
  const [savedRubrics, setSavedRubrics] = useState<Rubric[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("picklenickai-rubrics");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  async function buildRubric() {
    if (!subject || !yearLevel || !taskDescription) {
      setError("Please fill in subject, year level, and task description.");
      return;
    }
    setError("");
    setGenerating(true);

    try {
      const res = await fetch("/api/rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, taskDescription, criteria: 4 }),
      });

      if (!res.ok) throw new Error("Failed to generate rubric");

      const data = await res.json();
      const newRubric: Rubric = {
        id: crypto.randomUUID(),
        subject,
        yearLevel,
        type: assessmentType || "Summative",
        task: taskDescription,
        criteria: parseRubricText(data.rubric),
        createdAt: new Date().toISOString(),
      };
      setRubric(newRubric);
    } catch (err) {
      setError("Failed to generate rubric. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function parseRubricText(text: string): { level: string; descriptor: string }[] {
    // Parse markdown rubric into structured criteria
    const lines = text.split("\n");
    const criteria: { level: string; descriptor: string }[] = [];
    let currentLevel = "";

    for (const line of lines) {
      const levelMatch = line.match(/^\s*\*\*(A|B|C|D|E)\*\*/);
      if (levelMatch) {
        currentLevel = levelMatch[1];
      } else if (currentLevel && line.trim().startsWith("-") || line.trim().startsWith("•")) {
        const descriptor = line.replace(/^\s*[-•]\s*/, "").replace(/\*\*/g, "").trim();
        if (descriptor) {
          const levelMap: Record<string, string> = { A: "A - Excellent", B: "B - Good", C: "C - Satisfactory", D: "D - Needs Improvement", E: "E - Limited" };
          criteria.push({ level: levelMap[currentLevel] || currentLevel, descriptor });
        }
      }
    }

    // Fallback if parsing didn't work — return simple structured rubric
    if (criteria.length === 0) {
      const levelMap: Record<string, string> = { A: "A - Excellent", B: "B - Good", C: "C - Satisfactory", D: "D - Needs Improvement", E: "E - Limited" };
      const levels = ["A", "B", "C", "D", "E"];
      for (const l of levels) {
        criteria.push({
          level: levelMap[l],
          descriptor: `Demonstrates ${l === "A" ? "outstanding" : l === "B" ? "solid" : l === "C" ? "adequate" : l === "D" ? "partial" : "minimal"} understanding of ${taskDescription}.`,
        });
      }
    }

    return criteria;
  }

  function saveRubric() {
    if (!rubric) return;
    const updated = [rubric, ...savedRubrics].slice(0, 20);
    setSavedRubrics(updated);
    localStorage.setItem("picklenickai-rubrics", JSON.stringify(updated));
  }

  function loadRubric(r: Rubric) {
    setRubric(r);
    setSubject(r.subject);
    setYearLevel(r.yearLevel);
    setTaskDescription(r.task);
  }

  function deleteRubric(id: string) {
    const updated = savedRubrics.filter((r) => r.id !== id);
    setSavedRubrics(updated);
    localStorage.setItem("picklenickai-rubrics", JSON.stringify(updated));
  }

  function copyRubric() {
    if (!rubric) return;
    const text = `## Assessment Rubric: ${rubric.task}\n${rubric.subject} · ${rubric.yearLevel} · ${rubric.type}\n\n` +
      rubric.criteria.map((c) => `**${c.level}**: ${c.descriptor}`).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  const sc = subject ? (SUBJECT_COLORS[subject] ?? { bg: C.surface2, text: C.text2, border: C.border }) : null;

  return (
    <div style={{ background: C.bg, minHeight: "100dvh" }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(180deg, #1a1f3d 0%, ${C.surface} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "32px 24px 24px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 900, margin: 0, marginBottom: 6, letterSpacing: "-0.02em" }}>
            AI Rubric Builder
          </h1>
          <p style={{ color: C.text2, fontSize: 14, margin: 0 }}>
            Generate A-E rubrics for any assessment task. Select subject, year level, and describe the task.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Builder form */}
          <div>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: radius.lg,
                padding: "24px",
                marginBottom: 20,
              }}
            >
              <h2 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: "0 0 20px" }}>Build a Rubric</h2>

              {/* Subject */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Subject</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SUBJECTS.map((s) => {
                    const isActive = subject === s;
                    const scc = SUBJECT_COLORS[s] ?? { bg: C.surface2, text: C.text2, border: C.border };
                    return (
                      <button
                        key={s}
                        onClick={() => setSubject(s)}
                        style={{
                          background: isActive ? scc.bg : C.surface2,
                          color: isActive ? scc.text : C.text2,
                          border: `1px solid ${isActive ? scc.border : C.border}`,
                          borderRadius: radius.full,
                          padding: "5px 12px",
                          fontSize: 12,
                          fontWeight: isActive ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Year level */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Year Level</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {YEAR_LEVELS.map((yl) => {
                    const isActive = yearLevel === yl;
                    return (
                      <button
                        key={yl}
                        onClick={() => setYearLevel(yl)}
                        style={{
                          background: isActive ? `${C.primary}20` : C.surface2,
                          color: isActive ? C.primary : C.text2,
                          border: `1px solid ${isActive ? C.primary + "50" : C.border}`,
                          borderRadius: radius.full,
                          padding: "5px 12px",
                          fontSize: 12,
                          fontWeight: isActive ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {yl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assessment type */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Assessment Type</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ASSESSMENT_TYPES.map((t) => {
                    const isActive = assessmentType === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setAssessmentType(isActive ? "" : t)}
                        style={{
                          background: isActive ? `${C.accent}15` : C.surface2,
                          color: isActive ? C.accent : C.text2,
                          border: `1px solid ${isActive ? C.accent + "40" : C.border}`,
                          borderRadius: radius.full,
                          padding: "5px 12px",
                          fontSize: 12,
                          fontWeight: isActive ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Task description */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Task Description</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="e.g. Students write a 500-word persuasive essay on why schools should ban homework..."
                  style={{
                    width: "100%",
                    background: C.surface2,
                    color: C.text,
                    border: `1px solid ${C.border}`,
                    borderRadius: radius.md,
                    padding: "10px 12px",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                    minHeight: 80,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}20`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>

              {error && (
                <p style={{ color: C.danger, fontSize: 12, marginBottom: 12 }}>{error}</p>
              )}

              <Button
                onClick={buildRubric}
                disabled={generating}
                style={{ width: "100%" }}
              >
                {generating ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Building rubric...
                  </span>
                ) : "Generate A-E Rubric"}
              </Button>
            </div>
          </div>

          {/* Rubric preview */}
          <div>
            {rubric ? (
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.lg,
                  padding: "24px",
                  marginBottom: 20,
                  boxShadow: shadows.glow,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      {sc && (
                        <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: radius.sm, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                          {rubric.subject}
                        </span>
                      )}
                      <span style={{ background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}40`, borderRadius: radius.sm, padding: "3px 10px", fontSize: 11 }}>
                        {rubric.yearLevel}
                      </span>
                      <span style={{ background: `${C.primary}15`, color: C.primary, border: `1px solid ${C.primary}40`, borderRadius: radius.sm, padding: "3px 10px", fontSize: 11 }}>
                        {rubric.type}
                      </span>
                    </div>
                    <h3 style={{ color: C.text, fontSize: 14, fontWeight: 700, margin: 0 }}>{rubric.task}</h3>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {rubric.criteria.map((c, i) => {
                    const isA = c.level.startsWith("A");
                    const isB = c.level.startsWith("B");
                    const isC = c.level.startsWith("C");
                    const isD = c.level.startsWith("D");
                    const isE = c.level.startsWith("E");
                    const levelColor = isA ? C.success : isB ? "#34d399" : isC ? C.warning : isD ? "#fb923c" : C.danger;

                    return (
                      <div
                        key={i}
                        style={{
                          background: C.surface2,
                          border: `1px solid ${C.border}`,
                          borderRadius: radius.md,
                          padding: "12px 14px",
                          borderLeft: `3px solid ${levelColor}`,
                        }}
                      >
                        <span style={{ color: levelColor, fontSize: 11, fontWeight: 800, fontFamily: "monospace", display: "block", marginBottom: 4 }}>
                          {c.level}
                        </span>
                        <p style={{ color: C.text2, fontSize: 12, margin: 0, lineHeight: 1.6 }}>{c.descriptor}</p>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Button size="sm" variant="secondary" onClick={saveRubric}>Save Rubric</Button>
                  <Button size="sm" variant="ghost" onClick={copyRubric}>Copy Text</Button>
                  <Button size="sm" variant="ghost" onClick={() => setRubric(null)}>Clear</Button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.lg,
                  padding: "40px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>📋</div>
                <p style={{ color: C.text3, fontSize: 13, margin: 0 }}>
                  Select a subject, year level, and describe your task to generate an A-E rubric.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Saved rubrics */}
        {savedRubrics.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Saved Rubrics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {savedRubrics.map((r) => {
                const scc = SUBJECT_COLORS[r.subject] ?? { bg: C.surface2, text: C.text2, border: C.border };
                return (
                  <div
                    key={r.id}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: radius.lg,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: scc.bg, color: scc.text, border: `1px solid ${scc.border}`, borderRadius: radius.sm, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                          {r.subject}
                        </span>
                        <span style={{ color: C.text3, fontSize: 11 }}>{r.yearLevel}</span>
                      </div>
                      <p style={{ color: C.text2, fontSize: 13, margin: 0, fontWeight: 500 }}>{r.task}</p>
                      <p style={{ color: C.text3, fontSize: 11, margin: "4px 0 0" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" variant="secondary" onClick={() => loadRubric(r)}>Load</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteRubric(r.id)}>Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}