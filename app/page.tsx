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

interface GradeResult {
  score: string;
  summary: string;
  breakdown: { criterion: string; marks: string; feedback: string }[];
  areasToImprove: string[];
  nextSteps: string;
}

// ─── Lesson Planner ───────────────────────────────────────────────

function LessonPlannerTab() {
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
    if (!topic.trim()) { setError("Please enter a topic/focus."); return; }
    if (!objectives.trim()) { setError("Please enter at least one learning objective."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, topic, duration, objectives, focusArea: focusOptions[0], lessonType, resources, differentiation, activities }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Generation failed.");
      else { setPlan(data.plan); setMeta({ subject, yearLevel, topic, duration }); }
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

  return (
    <div className="space-y-6">
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
        <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">📝 Lesson Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {Object.keys(SUBJECTS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year Level</label>
            <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Focus</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Multiplying 2-digit by 1-digit numbers" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">Duration: <span className="font-semibold text-indigo-600">{duration} minutes</span></label>
          <input type="range" min={30} max={120} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-indigo-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>30 min</span><span>120 min</span></div>
        </div>
      </section>

      {/* Learning Objectives */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">🎯 Learning Objectives</h2>
        <textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder={'1. Solve multiplication problems involving 2-digit numbers...\n2. Use mental strategies to estimate products...'} rows={4} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </section>

      {/* Strand & Lesson Type */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">🧩 Strand &amp; Lesson Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Strand / Focus</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50">
              {focusOptions.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <p className="text-xs text-slate-400 mt-1">Updates when you change subject</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lesson Type</label>
            <select value={lessonType} onChange={(e) => setLessonType(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {LESSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Resources & Differentiation */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">📎 Resources &amp; Differentiation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resources needed</label>
            <input type="text" value={resources} onChange={(e) => setResources(e.target.value)} placeholder="Whiteboards, worksheets, projector" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Differentiation</label>
            <select value={differentiation} onChange={(e) => setDifferentiation(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {DIFFERENTIATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Activity Breakdown */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">🕐 Activity Breakdown</h2>
        <textarea value={activities} onChange={(e) => setActivities(e.target.value)} placeholder={'Introduction / warm-up — 10 min\nGuided examples — 15 min\nIndependent practice — 20 min\nReflection / exit ticket — 10 min'} rows={4} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        <p className="text-xs text-slate-400 mt-1">Format: Activity description — X min (one per line)</p>
      </section>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">❌ {error}</div>}

      <button onClick={handleGenerate} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base flex items-center justify-center gap-2">
        {loading ? <><span className="animate-spin">⏳</span> Building your lesson plan...</> : <>🚀 Generate Lesson Plan</>}
      </button>

      {plan && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">📄 Your Lesson Plan</h2>
            <button onClick={() => { setPlan(""); setMeta(null); }} className="text-sm text-slate-500 hover:text-red-600 transition-colors">🗑️ Clear</button>
          </div>
          {meta && <p className="text-sm text-slate-600 font-medium mb-4">{meta.subject} — {meta.yearLevel} — {meta.topic}</p>}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 overflow-x-auto">
            <pre className="text-sm text-slate-800 whitespace-pre-wrap">{plan}</pre>
          </div>
          <button onClick={handleDownload} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm flex items-center gap-2">
            💾 Download Lesson Plan (.txt)
          </button>
        </section>
      )}
    </div>
  );
}

// ─── Auto Grader ──────────────────────────────────────────────────

function AutoGraderTab() {
  const [studentText, setStudentText] = useState("");
  const [rubric, setRubric] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [yearLevel, setYearLevel] = useState("Year 3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState("");

  function getScoreColor(score: string): string {
    const n = parseFloat(score);
    if (isNaN(n)) return "bg-slate-100 border-slate-300";
    if (n >= 8) return "bg-emerald-50 border-emerald-300";
    if (n >= 5) return "bg-amber-50 border-amber-300";
    return "bg-red-50 border-red-300";
  }

  function getScoreLabel(score: string): string {
    const n = parseFloat(score);
    if (isNaN(n)) return "Neutral";
    if (n >= 8) return "Excellent";
    if (n >= 5) return "Satisfactory";
    return "Needs Work";
  }

  async function handleGrade() {
    setError("");
    if (!rubric.trim()) { setError("Please paste a rubric or answer key."); return; }
    if (!studentText.trim()) { setError("Please paste student work text."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: studentText, rubric, subject, yearLevel }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Grading failed.");
      else setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <h2 className="font-semibold text-indigo-800 mb-2">📋 How it works</h2>
        <ol className="text-sm text-indigo-700 space-y-1">
          <li>1. <strong>Paste</strong> the student's written work</li>
          <li>2. <strong>Paste</strong> your rubric or answer key</li>
          <li>3. <strong>Select</strong> subject &amp; year level</li>
          <li>4. <strong>Click Grade</strong></li>
          <li>5. Get <strong>instant feedback</strong>, breakdown &amp; next steps</li>
        </ol>
      </div>

      {/* Subject & Year */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">🎓 Class Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {Object.keys(SUBJECTS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year Level</label>
            <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Student Work */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">✍️ Student Work</h2>
        <textarea
          value={studentText}
          onChange={(e) => setStudentText(e.target.value)}
          placeholder={"Paste the student's written response here...\n\nYou can paste an essay, short answer responses, problem solutions, or any text-based student work."}
          rows={8}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">For image-based work, paste a text description of what the student submitted</p>
      </section>

      {/* Rubric */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">📏 Rubric / Answer Key</h2>
        <textarea
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          placeholder={"Paste your rubric here...\n\nExample:\n- Content accuracy (0-10): Excellent work demonstrates deep understanding...\n- Structure & organisation (0-5): Clear introduction, body, conclusion...\n- Language & conventions (0-5): Few or no errors..."}
          rows={8}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">Include criteria names, max marks, and descriptions of what each level looks like</p>
      </section>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">❌ {error}</div>}

      <button onClick={handleGrade} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base flex items-center justify-center gap-2">
        {loading ? <><span className="animate-spin">⏳</span> Analysing student work...</> : <>✅ Grade Student Work</>}
      </button>

      {result && (
        <div className="space-y-4">
          {/* Score Card */}
          <div className={`rounded-xl border-2 p-6 text-center ${getScoreColor(result.score)}`}>
            <p className="text-sm font-medium uppercase tracking-wide opacity-70 mb-1">Overall Score</p>
            <p className="text-5xl font-bold text-slate-800 mb-2">{result.score}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${parseFloat(result.score) >= 8 ? "bg-emerald-200 text-emerald-800" : parseFloat(result.score) >= 5 ? "bg-amber-200 text-amber-800" : "bg-red-200 text-red-800"}`}>
              {getScoreLabel(result.score)}
            </span>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-2">📝 Overall Summary</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">📊 Criterion Breakdown</h3>
            <div className="space-y-3">
              {result.breakdown.map((item, i) => {
                const marks = item.marks.split("/");
                const earned = parseFloat(marks[0]) || 0;
                const total = parseFloat(marks[1]) || 1;
                const pct = (earned / total) * 100;
                const color = pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
                return (
                  <div key={i} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-800 text-sm">{item.criterion}</span>
                      <span className="text-sm font-semibold text-slate-700">{item.marks}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Areas to Improve */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <h3 className="font-semibold text-amber-800 mb-3">🔻 Areas to Improve</h3>
            <ul className="space-y-2">
              {result.areasToImprove.map((area, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <span>•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6">
            <h3 className="font-semibold text-indigo-800 mb-3">🎯 Recommended Next Steps</h3>
            <p className="text-sm text-indigo-900 leading-relaxed">{result.nextSteps}</p>
          </div>

          <button onClick={() => setResult(null)} className="w-full text-slate-500 hover:text-red-600 text-sm py-2 transition-colors">
            🗑️ Clear Results
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────

export default function TeacherMarker() {
  const [tab, setTab] = useState<"planner" | "grader">("planner");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-6 px-4 shadow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">📚 Teacher Marker</h1>
          <p className="text-indigo-200 mt-1 text-sm">WA Curriculum Lesson Planner &amp; Auto-Grader</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => setTab("planner")}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              tab === "planner"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            📚 Lesson Planner
          </button>
          <button
            onClick={() => setTab("grader")}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              tab === "grader"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            ✅ Auto Grader
          </button>
        </div>

        {tab === "planner" ? <LessonPlannerTab /> : <AutoGraderTab />}

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 py-4 mt-8">
          Teacher Marker — $19/mo teacher plan · School license $99/mo
        </footer>
      </main>
    </div>
  );
}
