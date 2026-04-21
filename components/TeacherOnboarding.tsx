"use client";

import { useState } from "react";

const YEAR_LEVELS = [
  "Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6",
  "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12",
];

const SUBJECTS = [
  "Mathematics", "English", "Science", "HASS",
  "Technologies", "The Arts", "HPE", "Languages",
];

interface TeacherOnboardingProps {
  onComplete: (profile: { name: string; yearLevels: string[]; subjects: string[] }) => void;
}

export default function TeacherOnboarding({ onComplete }: TeacherOnboardingProps) {
  const [name, setName] = useState("");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [error, setError] = useState("");

  function toggleYear(level: string) {
    setSelectedYears((prev) =>
      prev.includes(level) ? prev.filter((y) => y !== level) : [...prev, level]
    );
  }

  function toggleSubject(subject: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (selectedYears.length === 0) { setError("Please select at least one year level."); return; }
    if (selectedSubjects.length === 0) { setError("Please select at least one subject."); return; }
    onComplete({ name: name.trim(), yearLevels: selectedYears, subjects: selectedSubjects });
  }

  const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm transition-all";
  const labelCls = "block text-xs font-semibold uppercase tracking-wider mb-2";
  const sectionTitleCls = "text-sm font-bold uppercase tracking-wider mb-3";

  return (
    <div style={{ background: "var(--bg)" }} className="min-h-screen flex items-center justify-center p-6">
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-lg)",
      }} className="w-full max-w-lg rounded-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div style={{
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            width: 56,
            height: 56,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            margin: "0 auto 16px",
          }}>
            AI
          </div>
          <h1 style={{ color: "var(--text)" }} className="text-xl font-black mb-2">Welcome to PickleNickAI!</h1>
          <p style={{ color: "var(--text2)" }} className="text-sm">Before we start, tell me a bit about yourself.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className={labelCls} style={{ color: "var(--text2)" }}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 12,
              }}
              className={`${inputCls} border`}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Year Levels */}
          <div>
            <label className={labelCls} style={{ color: "var(--text2)" }}>Year Levels You Teach</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {YEAR_LEVELS.map((level) => {
                const selected = selectedYears.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleYear(level)}
                    style={{
                      background: selected ? "rgba(37,99,235,0.10)" : "var(--surface)",
                      color: selected ? "var(--primary)" : "var(--text2)",
                      border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 10,
                      padding: "6px 4px",
                      fontSize: 12,
                      fontWeight: selected ? 600 : 400,
                      cursor: "pointer",
                      transition: "all var(--transition)",
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className={labelCls} style={{ color: "var(--text2)" }}>Subjects You Teach</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SUBJECTS.map((subject) => {
                const selected = selectedSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    style={{
                      background: selected ? "rgba(37,99,235,0.10)" : "var(--surface)",
                      color: selected ? "var(--primary)" : "var(--text2)",
                      border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 10,
                      padding: "8px 12px",
                      fontSize: 13,
                      fontWeight: selected ? 600 : 400,
                      cursor: "pointer",
                      transition: "all var(--transition)",
                    }}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.30)",
              color: "#ef4444",
              borderRadius: 10,
              padding: "0.75rem 1rem",
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            style={{
              background: "var(--primary)",
              boxShadow: "var(--shadow)",
            }}
            className="w-full text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all hover:opacity-90"
          >
            Let&apos;s get started!
          </button>
        </form>
      </div>
    </div>
  );
}
