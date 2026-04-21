"use client";

import { useState, useEffect } from "react";

interface SavedPlan {
  id: string;
  title: string;
  subject: string;
  yearLevel: string;
  topic: string;
  weeks: number;
  content: string;
  createdAt: string;
}

const STORAGE_KEY = "picklenickai-plans";

const SUBJECTS = ["English", "Mathematics", "Science", "HASS", "Technologies", "The Arts", "HPE", "Languages"];
const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const FRAMEWORKS = ["WIEP", "5E", "Direct Instruction", "Inquiry-Based"];

function applyInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, idx) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={idx} style={{ color: "var(--text)", fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*")) return <em key={idx} style={{ color: "var(--text)" }}>{p.slice(1, -1)}</em>;
    return p;
  });
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableLines: string[] = [];

  const flushTable = () => {
    if (tableLines.length === 0) return;
    const rows = tableLines.filter(l => l.trim() && !l.startsWith("---"));
    if (rows.length > 1) {
      const headers = rows[0].split("|").filter(c => c.trim());
      const dataRows = rows.slice(2).filter(r => r.trim());
      elements.push(
        <table key={elements.length} style={{ width: "100%", borderCollapse: "collapse", margin: "8px 0", fontSize: 12 }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{ color: "var(--accent)", borderBottom: "1px solid var(--border)", padding: "4px 8px", textAlign: "left" }}>{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri}>
                {row.split("|").filter(c => c.trim()).map((cell, ci) => (
                  <td key={ci} style={{ color: "var(--text2)", padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    tableLines = [];
    inTable = false;
  };

  lines.forEach((line, i) => {
    if (line.startsWith("|") && line.includes("---")) {
      inTable = true;
      tableLines.push(line);
      return;
    }
    if (line.startsWith("|") && line.trim().endsWith("|")) {
      if (!inTable && tableLines.length > 0) flushTable();
      inTable = true;
      tableLines.push(line);
      return;
    }
    if (inTable) {
      tableLines.push(line);
      if (line.trim() === "" || (!line.startsWith("|") && !line.includes("|"))) {
        flushTable();
      }
      return;
    }

    if (line.startsWith("### ")) {
      elements.push(<p key={i} style={{ color: "var(--accent)", fontWeight: 700, marginTop: 12, marginBottom: 4, fontSize: 13 }}>{line.slice(4)}</p>);
    } else if (line.startsWith("## ")) {
      elements.push(<p key={i} style={{ color: "var(--text)", fontWeight: 800, marginTop: 14, marginBottom: 4, fontSize: 14 }}>{line.slice(3)}</p>);
    } else if (line.startsWith("# ")) {
      elements.push(<p key={i} style={{ color: "var(--text)", fontWeight: 900, marginTop: 16, marginBottom: 6, fontSize: 15 }}>{line.slice(2)}</p>);
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} style={{ borderColor: "var(--border)", marginTop: 8, marginBottom: 8 }} />);
    } else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const content = line.replace(/^[-*•] /, "");
      elements.push(<p key={i} style={{ color: "var(--text2)", margin: "2px 0", paddingLeft: 16, fontSize: 13 }}><span style={{ color: "var(--accent)", marginRight: 6 }}>&#8226;</span> {applyInline(content)}</p>);
    } else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)/);
      if (match) elements.push(<p key={i} style={{ color: "var(--text2)", margin: "2px 0", paddingLeft: 16, fontSize: 13 }}><span style={{ color: "var(--primary)", fontWeight: 600 }}>{match[1]}.</span> {applyInline(match[2])}</p>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      elements.push(<p key={i} style={{ color: "var(--text2)", margin: "2px 0", fontSize: 13, lineHeight: 1.6 }}>{applyInline(line)}</p>);
    }
  });

  if (inTable) flushTable();
  return <div>{elements}</div>;
}

export default function PlanGenerator({ sessionId }: { sessionId: string }) {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    subject: "English",
    yearLevel: "Year 4",
    topic: "",
    weeks: "8",
    framework: "WIEP",
    mentorText: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPlans(JSON.parse(saved));
    } catch {}
  }, []);

  function savePlans(updated: SavedPlan[]) {
    setPlans(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async function generatePlan() {
    if (!form.topic.trim()) return;
    setGenerating(true);

    const prompt = `Create a comprehensive ${form.weeks}-week ${form.subject} unit plan for ${form.yearLevel} on the topic: "${form.topic}". Use the ${form.framework} framework.${form.mentorText ? ` Mentor text: ${form.mentorText}.` : ""}

Generate:
1. 8-week overview table
2. Cold Task (Week 1, Lesson 1) — pre-assessment
3. All 24 lesson plans (3 per week) with I Do/We Do/You Do phases, timing, teacher actions, student activities
4. Hot Task (Week 8, Lesson 1) — same format as cold task
5. Full A-E rubric with AC9 curriculum codes
6. EAL / Gifted / NEP differentiation for every lesson
7. Success criteria

Output as structured markdown. Be comprehensive — every lesson fully written.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          sessionId,
          stream: false,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        const newPlan: SavedPlan = {
          id: crypto.randomUUID(),
          title: `${form.yearLevel} ${form.subject} — ${form.topic}`,
          subject: form.subject,
          yearLevel: form.yearLevel,
          topic: form.topic,
          weeks: parseInt(form.weeks),
          content: data.reply,
          createdAt: new Date().toISOString(),
        };
        savePlans([newPlan, ...plans]);
        setShowModal(false);
        setForm({ subject: "English", yearLevel: "Year 4", topic: "", weeks: "8", framework: "WIEP", mentorText: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  function deletePlan(id: string) {
    savePlans(plans.filter((p) => p.id !== id));
    if (expandedPlan === id) setExpandedPlan(null);
  }

  function copyPlanContent(id: string) {
    const plan = plans.find((p) => p.id === id);
    if (plan) navigator.clipboard.writeText(plan.content);
  }

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>Unit Plans</h2>
          <p style={{ color: "var(--text3)", fontSize: 12, margin: "4px 0 0" }}>
            {plans.length} plan{plans.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1.25rem",
            borderRadius: 10,
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            boxShadow: "var(--shadow)",
            transition: "all var(--transition)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--primary-hover)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--primary)"}
        >
          + Generate Unit Plan
        </button>
      </div>

      {/* Plans list */}
      {plans.length === 0 ? (
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "2.5rem 2rem",
          textAlign: "center",
          boxShadow: "var(--shadow)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem", color: "var(--text3)" }}>[ ]</div>
          <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: "1.25rem" }}>
            Generate your first unit plan to get started.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1.25rem",
              borderRadius: 10,
              fontSize: "0.875rem",
              cursor: "pointer",
              boxShadow: "var(--shadow)",
              transition: "all var(--transition)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--primary-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--primary)"}
          >
            Generate Unit Plan
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              boxShadow: "var(--shadow)",
            }}>
              {/* Plan header */}
              <div
                style={{ padding: "1rem 1.25rem", cursor: "pointer" }}
                onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <span style={{
                        background: "var(--surface)",
                        color: "var(--primary)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 500,
                      }}>
                        {plan.subject}
                      </span>
                      <span style={{
                        background: "var(--surface)",
                        color: "var(--text2)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                      }}>
                        {plan.yearLevel}
                      </span>
                      <span style={{
                        background: "var(--surface)",
                        color: "var(--accent)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                      }}>
                        {plan.weeks} weeks
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: "var(--text)" }}>{plan.title}</div>
                    <div style={{ color: "var(--text3)", fontSize: 12 }}>
                      Created {new Date(plan.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyPlanContent(plan.id); }}
                      style={{
                        background: "var(--surface)",
                        color: "var(--text2)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                        transition: "all var(--transition)",
                      }}
                    >
                      Copy
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); }}
                      style={{
                        background: "transparent",
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                        transition: "all var(--transition)",
                      }}
                    >
                      Delete
                    </button>
                    <span style={{
                      color: "var(--text3)",
                      fontSize: 10,
                      transition: "transform 0.2s ease",
                      transform: expandedPlan === plan.id ? "rotate(180deg)" : "none",
                      display: "inline-block",
                    }}>
                      &#9660;
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {expandedPlan === plan.id && (
                <div style={{
                  borderTop: "1px solid var(--border)",
                  padding: "1.25rem",
                  background: "var(--surface)",
                  maxHeight: 500,
                  overflowY: "auto",
                }}>
                  <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.7 }}>
                    {renderMarkdown(plan.content)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => !generating && setShowModal(false)}
        >
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "2rem",
              width: "100%",
              maxWidth: 520,
              boxShadow: "var(--shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text)" }}>
                Generate Unit Plan
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  color: "var(--text3)",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                &#215;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ color: "var(--text2)", fontSize: 12, display: "block", marginBottom: 4, fontWeight: 500 }}>Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    style={{
                      width: "100%",
                      background: "var(--surface)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "8px 10px",
                      fontSize: 13,
                      outline: "none",
                      transition: "border-color var(--transition)",
                    }}
                  >
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: "var(--text2)", fontSize: 12, display: "block", marginBottom: 4, fontWeight: 500 }}>Year Level</label>
                  <select
                    value={form.yearLevel}
                    onChange={(e) => setForm({ ...form, yearLevel: e.target.value })}
                    style={{
                      width: "100%",
                      background: "var(--surface)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "8px 10px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ color: "var(--text2)", fontSize: 12, display: "block", marginBottom: 4, fontWeight: 500 }}>Topic</label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Narrative Writing using Leo and Ralph"
                  style={{
                    width: "100%",
                    background: "var(--surface)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 13,
                    outline: "none",
                    transition: "border-color var(--transition)",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ color: "var(--text2)", fontSize: 12, display: "block", marginBottom: 4, fontWeight: 500 }}>Weeks</label>
                  <input
                    type="number"
                    min={4}
                    max={12}
                    value={form.weeks}
                    onChange={(e) => setForm({ ...form, weeks: e.target.value })}
                    style={{
                      width: "100%",
                      background: "var(--surface)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "8px 10px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: "var(--text2)", fontSize: 12, display: "block", marginBottom: 4, fontWeight: 500 }}>Framework</label>
                  <select
                    value={form.framework}
                    onChange={(e) => setForm({ ...form, framework: e.target.value })}
                    style={{
                      width: "100%",
                      background: "var(--surface)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "8px 10px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    {FRAMEWORKS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: "var(--text2)", fontSize: 12, display: "block", marginBottom: 4, fontWeight: 500 }}>Mentor Text</label>
                  <input
                    type="text"
                    value={form.mentorText}
                    onChange={(e) => setForm({ ...form, mentorText: e.target.value })}
                    placeholder="Optional"
                    style={{
                      width: "100%",
                      background: "var(--surface)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "8px 10px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: "var(--surface)",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                marginTop: 4,
              }}>
                <p style={{ color: "var(--text3)", fontSize: 11, margin: 0 }}>
                  The AI will generate a full {form.weeks || 8}-week unit with 24 detailed lesson plans, cold/hot tasks, rubric, and differentiation.
                </p>
              </div>

              <button
                onClick={generatePlan}
                disabled={!form.topic.trim() || generating}
                style={{
                  background: !form.topic.trim() || generating ? "var(--border)" : "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "0.75rem",
                  fontSize: 13,
                  cursor: !form.topic.trim() || generating ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  marginTop: 4,
                  transition: "all var(--transition)",
                  boxShadow: !form.topic.trim() || generating ? "none" : "var(--shadow)",
                }}
                onMouseEnter={(e) => {
                  if (form.topic.trim() && !generating) e.currentTarget.style.background = "var(--primary-hover)";
                }}
                onMouseLeave={(e) => {
                  if (form.topic.trim() && !generating) e.currentTarget.style.background = "var(--primary)";
                }}
              >
                {generating ? "Generating… (may take up to 30 seconds)" : "Generate Unit Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
