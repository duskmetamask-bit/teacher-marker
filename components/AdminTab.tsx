"use client";

import { useState } from "react";
import { C, shadows, radius } from "@/lib/design";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

type Section = "meeting" | "parent" | "pd";

const TEMPLATES = {
  progress: "Progress Report",
  behaviour: "Behaviour Notification",
  celebrate: "Achievement Celebration",
};

const MEETING_TYPES = ["Staff Meeting", "PLP Meeting", "Stage Meeting", "Parent-Teacher", "Admin", "Other"];

export default function AdminTab() {
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  // Meeting state
  const [meetingType, setMeetingType] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [attendees, setAttendees] = useState("");
  const [agenda, setAgenda] = useState("");
  const [actions, setActions] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  // Parent comms state
  const [commType, setCommType] = useState<keyof typeof TEMPLATES>("progress");
  const [studentName, setStudentName] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");

  // PD log state
  const [pdEntries, setPdEntries] = useState<{ id: string; date: string; title: string; provider: string; hours: number; reflections: string; evidence: string }[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("picklenickai-pd-log");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [pdDate, setPdDate] = useState("");
  const [pdTitle, setPdTitle] = useState("");
  const [pdProvider, setPdProvider] = useState("");
  const [pdHours, setPdHours] = useState("");
  const [pdReflections, setPdReflections] = useState("");
  const [pdEvidence, setPdEvidence] = useState("");

  function savePdEntry() {
    if (!pdDate || !pdTitle) return;
    const entry = {
      id: crypto.randomUUID(),
      date: pdDate,
      title: pdTitle,
      provider: pdProvider,
      hours: parseFloat(pdHours) || 0,
      reflections: pdReflections,
      evidence: pdEvidence,
    };
    const updated = [entry, ...pdEntries].slice(0, 50);
    setPdEntries(updated);
    localStorage.setItem("picklenickai-pd-log", JSON.stringify(updated));
    setPdDate(""); setPdTitle(""); setPdProvider(""); setPdHours(""); setPdReflections(""); setPdEvidence("");
  }

  function deletePdEntry(id: string) {
    const updated = pdEntries.filter((e) => e.id !== id);
    setPdEntries(updated);
    localStorage.setItem("picklenickai-pd-log", JSON.stringify(updated));
  }

  async function generateParentComm() {
    if (!studentName || !details) return;
    setGenerating(true);
    setGeneratedText("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Write a professional, warm ${commType === "progress" ? "progress report update" : commType === "behaviour" ? "behaviour notification" : "celebration message"} for the parent/guardian of student ${studentName} regarding ${subject}. Details: ${details}. Keep it concise (150 words), professional but friendly, suitable for Australian primary school context.`,
          }],
          sessionId: "admin",
          stream: false,
        }),
      });
      const data = await res.json();
      setGeneratedText(data.response ?? "Failed to generate. Please try again.");
    } catch {
      setGeneratedText("Failed to generate. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function generateMeetingNotes() {
    if (!meetingType || !meetingDate) return;
    setGenerating(true);
    setGeneratedText("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Generate structured meeting notes for a ${meetingType} held on ${meetingDate} with attendees: ${attendees || "not specified"}. Agenda: ${agenda || "not specified"}. Action items: ${actions || "not specified"}. Next steps: ${nextSteps || "not specified"}. Format as clean markdown with sections: Attendees, Agenda, Discussion, Actions, Next Steps. Keep it professional and succinct.`,
          }],
          sessionId: "admin",
          stream: false,
        }),
      });
      const data = await res.json();
      setGeneratedText(data.response ?? "Failed to generate. Please try again.");
    } catch {
      setGeneratedText("Failed to generate. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function copyGenerated() {
    navigator.clipboard.writeText(generatedText).catch(() => {});
  }

  function renderSectionContent() {
    switch (activeSection) {
      case "meeting":
        return (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Meeting Type</label>
                <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)} style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none" }}>
                  <option value="">Select type...</option>
                  {MEETING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Date</label>
                <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Attendees</label>
              <input type="text" value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="e.g. Mrs. Smith, Mr. Jones, Parents (x2)" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Agenda Items</label>
              <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="What will be discussed?" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", resize: "vertical", minHeight: 60, fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Action Items</label>
                <textarea value={actions} onChange={(e) => setActions(e.target.value)} placeholder="Tasks arising from the meeting" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", resize: "vertical", minHeight: 60, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Next Steps</label>
                <textarea value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} placeholder="Follow-up actions and deadlines" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", resize: "vertical", minHeight: 60, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            </div>
            <Button onClick={generateMeetingNotes} disabled={generating || !meetingType || !meetingDate}>
              {generating ? "Generating..." : "Generate Meeting Notes"}
            </Button>
          </div>
        );

      case "parent":
        return (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {Object.entries(TEMPLATES).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCommType(key as keyof typeof TEMPLATES)}
                  style={{
                    background: commType === key ? `${C.primary}20` : C.surface2,
                    color: commType === key ? C.primary : C.text2,
                    border: `1px solid ${commType === key ? C.primary + "50" : C.border}`,
                    borderRadius: radius.full,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: commType === key ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Student Name</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Jamie Thompson" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Subject / Area</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics, Reading" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Details / Context</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder={commType === "behaviour" ? "Describe the behaviour and context..." : commType === "celebrate" ? "What achievement should we celebrate?" : "What progress is being communicated?"} style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", resize: "vertical", minHeight: 80, fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <Button onClick={generateParentComm} disabled={generating || !studentName || !details}>
              {generating ? "Generating..." : `Generate ${TEMPLATES[commType]}`}
            </Button>
          </div>
        );

      case "pd":
        return (
          <div>
            <div style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: radius.md, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ color: C.accent, fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>TRBWA Professional Development Log</p>
              <p style={{ color: C.text2, fontSize: 12, margin: 0 }}>Record all PD activities for Teacher Registration Board of Western Australia compliance.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Date</label>
                <input type="date" value={pdDate} onChange={(e) => setPdDate(e.target.value)} style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Hours</label>
                <input type="number" step="0.5" min="0" value={pdHours} onChange={(e) => setPdHours(e.target.value)} placeholder="e.g. 2.5" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Provider</label>
                <input type="text" value={pdProvider} onChange={(e) => setPdProvider(e.target.value)} placeholder="e.g. WCAA, AISWA" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>PD Title / Focus</label>
              <input type="text" value={pdTitle} onChange={(e) => setPdTitle(e.target.value)} placeholder="e.g. Explicit Instruction Masterclass" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Reflections</label>
              <textarea value={pdReflections} onChange={(e) => setPdReflections(e.target.value)} placeholder="What did you learn? How will you apply it?" style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", resize: "vertical", minHeight: 80, fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Evidence Links</label>
              <input type="text" value={pdEvidence} onChange={(e) => setPdEvidence(e.target.value)} placeholder="Certificate URL, course materials, etc." style={{ width: "100%", background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <Button onClick={savePdEntry} disabled={!pdDate || !pdTitle}>Log PD Entry</Button>

            {pdEntries.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h4 style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>PD History ({pdEntries.length} entries)</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {pdEntries.map((entry) => (
                    <div key={entry.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: radius.md, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ color: C.text, fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>{entry.title}</p>
                          <p style={{ color: C.text2, fontSize: 12, margin: 0 }}>
                            {entry.date} · {entry.hours}h · {entry.provider || "Self-directed"}
                          </p>
                          {entry.reflections && <p style={{ color: C.text3, fontSize: 12, margin: "6px 0 0", fontStyle: "italic" }}>"{entry.reflections.slice(0, 80)}..."</p>}
                        </div>
                        <button onClick={() => deletePdEntry(entry.id)} style={{ background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }

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
            Admin Tools
          </h1>
          <p style={{ color: C.text2, fontSize: 14, margin: 0 }}>
            Meeting notes, parent communications, and PD logging — all with AI assistance.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {/* Section selector */}
        {activeSection === null ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { id: "meeting", icon: "📝", label: "Meeting Notes", desc: "Structured meeting notes with AI enhancement", color: C.primary },
              { id: "parent", icon: "💬", label: "Parent Comms", desc: "Progress reports, behaviour notifications, celebrations", color: C.accent },
              { id: "pd", icon: "📚", label: "PD Log", desc: "TRBWA-compliant professional development records", color: C.success },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.lg,
                  padding: "20px 24px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  transition: "all 0.15s ease",
                  width: "100%",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color + "50"; e.currentTarget.style.background = C.surface2; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}15`, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ color: C.text, fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>{item.label}</p>
                  <p style={{ color: C.text2, fontSize: 13, margin: 0 }}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => { setActiveSection(null); setGeneratedText(""); }}
              style={{ background: "none", border: "none", color: C.text2, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4, marginBottom: 20 }}
            >
              ← Back to Admin Tools
            </button>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: radius.lg, padding: "24px", marginBottom: 20 }}>
              {renderSectionContent()}
            </div>

            {generatedText && (
              <div style={{ background: C.surface, border: `1px solid ${C.primary}40`, borderRadius: radius.lg, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ color: C.text, fontSize: 14, fontWeight: 700, margin: 0 }}>Generated Output</h4>
                  <Button size="sm" variant="ghost" onClick={copyGenerated}>Copy</Button>
                </div>
                <pre style={{ color: C.text2, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>
                  {generatedText}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}