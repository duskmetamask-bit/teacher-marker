"use client";

import { useState } from "react";

const SUBJECTS: Record<string, string[]> = {
  Mathematics: ["Number", "Algebra", "Measurement", "Geometry", "Statistics", "Probability"],
  English: ["Reading", "Writing", "Speaking & Listening", "Language", "Literature"],
  Science: ["Biological Sciences", "Chemical Sciences", "Earth & Space Sciences", "Physical Sciences"],
  HASS: ["History", "Geography", "Civics & Citizenship", "Economics & Business"],
  Technologies: ["Digital Technologies", "Design & Technologies"],
  "The Arts": ["Visual Arts", "Music", "Drama", "Dance"],
  "Health & Physical Education": ["Health", "Physical Education"],
  Languages: ["Italian", "Japanese", "Mandarin", "Indonesian"],
};

const YEAR_LEVELS = [
  "Pre-Primary",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];

const LESSON_TYPES = [
  "Explicit Teaching",
  "Inquiry-Based",
  "Flipped Classroom",
  "Guided Practice",
  "Independent Task",
  "Review / Revision",
];

const DIFFERENTIATIONS = [
  "Same task, varied support",
  "Tiered tasks",
  "Extension activities",
  "Scaffolding",
  "Mixed-ability groups",
];

interface LessonMeta {
  subject: string;
  yearLevel: string;
  topic: string;
  duration: number;
}

export default function LessonPlanner() {
  const [subject, setSubject] = useState("Mathematics");
  const [yearLevel, setYearLevel] = useState("Year 3");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(60);
  const [objectives, setObjectives] = useState("");
  const [lessonType, setLessonType] = useState("Explicit Teaching");
  const [resources, setResources] = useState("");
  const [differentiation, setDifferentiation] = useState("Same task, varied support");
  const [activities, setActivities] = useState("");
  const [plan, setPlan] = useState("");
  const [meta, setMeta] = useState<LessonMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const focusOptions = SUBJECTS[subject] ?? [];

  async function handleGenerate() {
    setError("");
    if (!topic.trim()) {
      setError("Please enter a topic/focus.");
      return;
    }
    if (!objectives.trim()) {
      setError("Please enter at least one learning objective.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          yearLevel,
          topic,
          duration,
          objectives,
          focusArea: focusOptions[0],
          lessonType,
          resources,
          differentiation,
          activities,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed.");
      } else {
        setPlan(data.plan);
        setMeta({ subject, yearLevel, topic, duration });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!plan) return;
    const blob = new Blob([plan], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTopic = meta?.topic.slice(0, 20).replace(/\s+/g, "_") ?? "topic";
    const date = new Date().toISOString().slice(0, 10);
    a.download = `LessonPlan_${meta?.subject}_${meta?.yearLevel}_${safeTopic}_${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    setPlan("");
    setMeta(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-6 px-4 shadow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">📚 Teacher Marker — Lesson Planner</h1>
          <p className="text-indigo-200 mt-1 text-sm">
            Build a structured, WA Curriculum-aligned lesson plan in seconds
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* How it works */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <h2 className="font-semibold text-indigo-800 mb-2">📋 How it works</h2>
          <ol className="text-sm text-indigo-700 space-y-1">
            <li>1. <strong>Select</strong> subject &amp; year level</li>
            <li>2. <strong>Enter</strong> topic and duration</li>
            <li>3. <strong>Add</strong> learning objectives</li>
            <li>4. <strong>Click Generate</strong></li>
            <li>5. <strong>Download</strong> as text file</li>
          </ol>
        </div>

        {/* Lesson Details */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
            📝 Lesson Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.keys(SUBJECTS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year Level</label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {YEAR_LEVELS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Focus</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Multiplying 2-digit by 1-digit numbers"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Duration: <span className="font-semibold text-indigo-600">{duration} minutes</span>
            </label>
            <input
              type="range"
              min={30}
              max={120}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>30 min</span>
              <span>120 min</span>
            </div>
          </div>
        </section>

        {/* Learning Objectives */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            🎯 Learning Objectives
          </h2>
          <textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder={'1. Solve multiplication problems involving 2-digit numbers...\n2. Use mental strategies to estimate products...'}
            rows={4}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </section>

        {/* Strand & Lesson Type */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            🧩 Strand &amp; Lesson Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Strand / Focus</label>
              <select
                value={focusOptions[0]}
                onChange={(e) => {}}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              >
                {focusOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Updates when you change subject</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lesson Type</label>
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LESSON_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Resources & Differentiation */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            📎 Resources &amp; Differentiation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resources needed</label>
              <input
                type="text"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
                placeholder="Whiteboards, worksheets, projector"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Differentiation</label>
              <select
                value={differentiation}
                onChange={(e) => setDifferentiation(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DIFFERENTIATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Activity Breakdown */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            🕐 Activity Breakdown
          </h2>
          <textarea
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            placeholder={'Introduction / warm-up — 10 min\nGuided examples — 15 min\nIndependent practice — 20 min\nReflection / exit ticket — 10 min'}
            rows={4}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">Format: Activity description — X min (one per line)</p>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Building your lesson plan...
            </>
          ) : (
            <>🚀 Generate Lesson Plan</>
          )}
        </button>

        {/* Generated Plan */}
        {plan && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">📄 Your Lesson Plan</h2>
              <button
                onClick={handleClear}
                className="text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                🗑️ Clear
              </button>
            </div>
            {meta && (
              <p className="text-sm text-slate-600 font-medium mb-4">
                {meta.subject} — {meta.yearLevel} — {meta.topic}
              </p>
            )}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 overflow-x-auto">
              <pre className="lesson-plan text-sm text-slate-800 whitespace-pre-wrap">{plan}</pre>
            </div>
            <button
              onClick={handleDownload}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              💾 Download Lesson Plan (.txt)
            </button>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 py-4">
          Teacher Marker — $19/mo teacher plan · School license $99/mo
        </footer>
      </main>
    </div>
  );
}
