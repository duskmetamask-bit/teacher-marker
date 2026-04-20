"use client";

import { useState } from "react";

const C = {
  bg: "#0d0f1a",
  surface: "#141627",
  surface2: "#1c1f35",
  border: "#2a2d45",
  border2: "#353860",
  text: "#e8eaf6",
  text2: "#99a3c7",
  text3: "#5c6490",
  primary: "#6366f1",
  primaryHover: "#818cf8",
  accent: "#22d3ee",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  tag: "#1e2145",
};

const YEAR_LEVELS = [
  "Pre-Primary",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Year 7",
  "Year 8",
  "Year 9",
  "Year 10",
  "Year 11",
  "Year 12",
];

const SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "HASS",
  "Technologies",
  "The Arts",
  "HPE",
  "Languages",
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

  const inputCls = `w-full rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0`;
  const labelCls = "block text-xs font-semibold mb-1.5 uppercase tracking-wider";
  const sectionTitleCls = "text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2";

  return (
    <div style={{ background: C.bg }} className="min-h-screen flex items-center justify-center p-4">
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }}
        className="w-full max-w-lg rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            width: 56, height: 56,
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
            margin: "0 auto 16px",
          }}>
            🤖
          </div>
          <h1 style={{ color: C.text }} className="text-xl font-black mb-2">Welcome to PickleNickAI!</h1>
          <p style={{ color: C.text2 }} className="text-sm">Before we start, tell me a bit about yourself.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah"
              style={{ background: C.surface2, color: C.text, borderColor: C.border }}
              className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30`}
            />
          </div>

          {/* Year Levels */}
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Year Levels You Teach</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {YEAR_LEVELS.map((level) => {
                const selected = selectedYears.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleYear(level)}
                    style={{
                      background: selected ? C.primary + "30" : C.surface2,
                      color: selected ? C.primaryHover : C.text2,
                      border: `1px solid ${selected ? C.primary : C.border}`,
                    }}
                    className="rounded-lg px-2 py-1.5 text-xs font-medium transition-all hover:border-indigo-500"
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Subjects You Teach</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SUBJECTS.map((subject) => {
                const selected = selectedSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    style={{
                      background: selected ? C.primary + "30" : C.surface2,
                      color: selected ? C.primaryHover : C.text2,
                      border: `1px solid ${selected ? C.primary : C.border}`,
                    }}
                    className="rounded-lg px-3 py-2 text-xs font-medium transition-all hover:border-indigo-500"
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: `${C.danger}15`, border: `1px solid ${C.danger}40`, color: C.danger }}
              className="rounded-lg px-4 py-3 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
            }}
            className="w-full text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all hover:opacity-90"
          >
            Let&apos;s get started! 🎉
          </button>
        </form>
      </div>
    </div>
  );
}
