"use client";

import { useState, useEffect } from "react";
import { C, shadows, transition, radius, SUBJECT_COLORS } from "@/lib/design";

// ─── Types ────────────────────────────────────────────────────────────

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

interface UnitsResponse {
  units: Unit[];
  meta: {
    totalUnits: number;
    returned: number;
    offset: number;
    limit: number;
    lastUpdated: string;
  };
}

// ─── Subject Colors ───────────────────────────────────────────────────

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] ?? { bg: C.surface2, text: C.text2, border: C.border };
}

// ─── Status Badge ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Unit["status"] }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    deployed: { color: C.success, bg: `${C.success}15`, label: "Deployed" },
    polished: { color: C.accent, bg: `${C.accent}15`, label: "Polished" },
    draft: { color: C.text3, bg: C.surface2, label: "Draft" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span
      style={{
        color: s.color,
        background: s.bg,
        padding: "2px 8px",
        borderRadius: radius.full,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.03em",
      }}
    >
      {s.label}
    </span>
  );
}

// ─── Unit Card ───────────────────────────────────────────────────────

function UnitCard({
  unit,
  onView,
}: {
  unit: Unit;
  onView: (unit: Unit) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const sc = getSubjectColor(unit.subject);

  return (
    <div
      onClick={() => onView(unit)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.surface2 : C.surface,
        border: `1px solid ${hovered ? C.border2 : C.border}`,
        borderRadius: radius.lg,
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? shadows.md : shadows.sm,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Top row: subject + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            background: sc.bg,
            color: sc.text,
            border: `1px solid ${sc.border}`,
            padding: "3px 10px",
            borderRadius: radius.full,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {unit.subject}
        </span>
        <StatusBadge status={unit.status} />
      </div>

      {/* Title */}
      <div>
        <h3
          style={{
            color: C.text,
            fontSize: 15,
            fontWeight: 700,
            margin: 0,
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {unit.title}
        </h3>
        <p style={{ color: C.text3, fontSize: 12, margin: 0 }}>{unit.yearLevel} · {unit.topic}</p>
      </div>

      {/* Description */}
      <p
        style={{
          color: C.text2,
          fontSize: 12,
          margin: 0,
          lineHeight: 1.6,
          flex: 1,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {unit.description}
      </p>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        <span
          style={{
            background: C.surface2,
            color: C.text2,
            padding: "2px 8px",
            borderRadius: radius.sm,
            fontSize: 11,
          }}
        >
          {unit.framework}
        </span>
        <span
          style={{
            background: C.surface2,
            color: C.text2,
            padding: "2px 8px",
            borderRadius: radius.sm,
            fontSize: 11,
          }}
        >
          {unit.duration}
        </span>
        <span
          style={{
            background: C.surface2,
            color: C.accent,
            padding: "2px 8px",
            borderRadius: radius.sm,
            fontSize: 11,
          }}
        >
          {unit.lessons} lessons
        </span>
      </div>

      {/* AC9 codes */}
      {unit.ac9Codes.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {unit.ac9Codes.slice(0, 3).map((code) => (
            <span
              key={code}
              style={{
                color: C.accent,
                background: `${C.accent}10`,
                border: `1px solid ${C.accent}30`,
                padding: "1px 6px",
                borderRadius: 4,
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              {code}
            </span>
          ))}
          {unit.ac9Codes.length > 3 && (
            <span style={{ color: C.text3, fontSize: 10 }}>
              +{unit.ac9Codes.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {unit.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {unit.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                background: C.tag,
                color: C.text2,
                padding: "2px 6px",
                borderRadius: radius.sm,
                fontSize: 10,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 4,
          paddingTop: 10,
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(unit);
          }}
          style={{
            flex: 1,
            background: hovered ? "linear-gradient(135deg, #6366f1, #818cf8)" : C.surface2,
            color: hovered ? "#fff" : C.text2,
            border: "none",
            borderRadius: radius.sm,
            padding: "7px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          View Unit
        </button>
        {unit.deployedUrl && (
          <a
            href={unit.deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.surface2,
              color: C.accent,
              border: `1px solid ${C.accent}40`,
              borderRadius: radius.sm,
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.2s ease",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Live
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Unit Detail Slide-over ───────────────────────────────────────────

function UnitDetail({
  unit,
  onClose,
}: {
  unit: Unit;
  onClose: () => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const sc = getSubjectColor(unit.subject);

  useEffect(() => {
    // Try to fetch the unit content if it has a deployed URL
    if (unit.deployedUrl) {
      fetch(`${unit.deployedUrl}/content.json`)
        .then((r) => r.json())
        .catch(() => null);
    }
  }, [unit]);

  function handleCopy() {
    const text = `${unit.title}\n${unit.subject} · ${unit.yearLevel}\n${unit.framework} · ${unit.duration}\n\n${unit.description}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 40,
          backdropFilter: "blur(3px)",
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(680px, 100vw)",
          background: C.surface,
          borderLeft: `1px solid ${C.border}`,
          zIndex: 50,
          overflowY: "auto",
          animation: "slideIn 0.25s ease-out",
          boxShadow: shadows.lg,
        }}
      >
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        `}</style>

        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            background: `linear-gradient(180deg, ${C.surface} 0%, ${C.surface}cc 100%)`,
            backdropFilter: "blur(8px)",
            borderBottom: `1px solid ${C.border}`,
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            zIndex: 1,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <span
                style={{
                  background: sc.bg,
                  color: sc.text,
                  border: `1px solid ${sc.border}`,
                  padding: "3px 10px",
                  borderRadius: radius.full,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {unit.subject}
              </span>
              <span style={{ color: C.text2, fontSize: 12, padding: "3px 0" }}>
                {unit.yearLevel}
              </span>
              <StatusBadge status={unit.status} />
            </div>
            <h2
              style={{
                color: C.text,
                fontSize: 18,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {unit.title}
            </h2>
            <p style={{ color: C.text3, fontSize: 12, margin: "4px 0 0" }}>
              {unit.topic} · {unit.duration} · {unit.lessons} lessons
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: C.surface2,
              color: C.text2,
              border: `1px solid ${C.border}`,
              borderRadius: radius.sm,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              fontSize: 18,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.border;
              e.currentTarget.style.color = C.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.surface2;
              e.currentTarget.style.color = C.text2;
            }}
          >
            &#215;
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* Framework + Mentor */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <div
              style={{
                background: `${C.primary}15`,
                color: C.primary,
                border: `1px solid ${C.primary}40`,
                padding: "6px 14px",
                borderRadius: radius.md,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {unit.framework}
            </div>
            {unit.mentorText && (
              <div
                style={{
                  background: `${C.accent}15`,
                  color: C.accent,
                  border: `1px solid ${C.accent}40`,
                  padding: "6px 14px",
                  borderRadius: radius.md,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Mentor: {unit.mentorText}
              </div>
            )}
          </div>

          {/* Description */}
          <div
            style={{
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: radius.lg,
              padding: "20px",
              marginBottom: 20,
            }}
          >
            <p style={{ color: C.text2, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              {unit.description}
            </p>
          </div>

          {/* AC9 Codes */}
          {unit.ac9Codes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  color: C.text3,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                AC9 Curriculum Codes
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {unit.ac9Codes.map((code) => (
                  <span
                    key={code}
                    style={{
                      background: `${C.accent}15`,
                      color: C.accent,
                      border: `1px solid ${C.accent}40`,
                      padding: "4px 12px",
                      borderRadius: radius.sm,
                      fontSize: 12,
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {unit.tags.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  color: C.text3,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Topics &amp; Tags
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {unit.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: C.tag,
                      color: C.text2,
                      padding: "4px 12px",
                      borderRadius: radius.sm,
                      fontSize: 12,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? `${C.success}20` : C.surface2,
                color: copied ? C.success : C.text2,
                border: `1px solid ${copied ? C.success : C.border}`,
                borderRadius: radius.md,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease",
              }}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Copy Details
                </>
              )}
            </button>

            {unit.deployedUrl && (
              <a
                href={unit.deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  color: "#fff",
                  border: "none",
                  borderRadius: radius.md,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3H3v10h10v-3M9 3h4v4M7 9l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                View Live Unit
              </a>
            )}
          </div>

          {/* Placeholder content notice */}
          <div
            style={{
              marginTop: 24,
              padding: "16px",
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: radius.md,
              textAlign: "center",
            }}
          >
            <p style={{ color: C.text3, fontSize: 12, margin: 0 }}>
              Full unit content is available in the deployed unit or by asking PickleNickAI to show you the full plan.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Filter Bar ─────────────────────────────────────────────────────

function FilterBar({
  subject,
  setSubject,
  yearLevel,
  setYearLevel,
  framework,
  setFramework,
  status,
  setStatus,
}: {
  subject: string;
  setSubject: (v: string) => void;
  yearLevel: string;
  setYearLevel: (v: string) => void;
  framework: string;
  setFramework: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
}) {
  const selectStyle: React.CSSProperties = {
    background: C.surface2,
    color: C.text,
    border: `1px solid ${C.border}`,
    borderRadius: radius.md,
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.15s ease",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        padding: "14px 16px",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: radius.lg,
        marginBottom: 20,
      }}
    >
      <span style={{ color: C.text3, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Filter:
      </span>
      <select value={subject} onChange={(e) => setSubject(e.target.value)} style={selectStyle}>
        <option value="All">All Subjects</option>
        {Object.keys(SUBJECT_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} style={selectStyle}>
        <option value="All">All Year Levels</option>
        {["Foundation","Pre-Primary","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6"].map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <select value={framework} onChange={(e) => setFramework(e.target.value)} style={selectStyle}>
        <option value="All">All Frameworks</option>
        {["WIEP","5E","Gradual Release","Direct Instruction","Inquiry-Based","Leo and Ralph"].map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
        <option value="All">All Status</option>
        <option value="deployed">Deployed</option>
        <option value="polished">Polished</option>
        <option value="draft">Draft</option>
      </select>
      {(subject !== "All" || yearLevel !== "All" || framework !== "All" || status !== "All") && (
        <button
          onClick={() => { setSubject("All"); setYearLevel("All"); setFramework("All"); setStatus("All"); }}
          style={{
            background: "transparent",
            color: C.danger,
            border: "none",
            fontSize: 12,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: radius.sm,
            fontWeight: 600,
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

// ─── Main Library Tab ────────────────────────────────────────────────

export default function LibraryTab() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [subject, setSubject] = useState("All");
  const [yearLevel, setYearLevel] = useState("All");
  const [framework, setFramework] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (subject !== "All") params.set("subject", subject);
    if (yearLevel !== "All") params.set("yearLevel", yearLevel);
    if (framework !== "All") params.set("framework", framework);
    if (status !== "All") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());

    fetch(`/api/library/units?${params}`)
      .then((r) => r.json())
      .then((data: UnitsResponse) => {
        setUnits(data.units ?? []);
        setTotal(data.meta?.totalUnits ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subject, yearLevel, framework, status, search]);

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(180deg, #1a1f3d 0%, ${C.surface} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "32px 24px 24px",
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: `${C.primary}20`,
              border: `1px solid ${C.primary}40`,
              borderRadius: radius.full,
              padding: "4px 12px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.success,
                boxShadow: `0 0 6px ${C.success}`,
              }}
            />
            <span style={{ color: C.primary, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
              {total} units in knowledge base
            </span>
          </div>

          <h1
            style={{
              color: C.text,
              fontSize: 24,
              fontWeight: 900,
              margin: 0,
              marginBottom: 6,
              letterSpacing: "-0.02em",
            }}
          >
            PickleNickAI Library
          </h1>
          <p style={{ color: C.text2, fontSize: 14, margin: 0 }}>
            Complete unit plans built by PickleNickAI. All AC9-aligned, WA and eastern states ready.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "24px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.text3, pointerEvents: "none" }}
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search units by title, topic, or AC9 code..."
            style={{
              width: "100%",
              background: C.surface,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: radius.lg,
              padding: "11px 16px 11px 40px",
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.15s ease",
              fontFamily: "inherit",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          />
        </div>

        {/* Filters */}
        <FilterBar
          subject={subject}
          setSubject={setSubject}
          yearLevel={yearLevel}
          setYearLevel={setYearLevel}
          framework={framework}
          setFramework={setFramework}
          status={status}
          setStatus={setStatus}
        />

        {/* Grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.lg,
                  height: 200,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : units.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: radius.lg,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: radius.lg,
                background: C.surface2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 24,
              }}
            >
              [ ]
            </div>
            <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
              No units found
            </h3>
            <p style={{ color: C.text3, fontSize: 13, margin: 0 }}>
              {search ? `No units match "${search}". Try different keywords.` : "Adjust your filters or check back soon as the knowledge base grows."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} onView={setSelectedUnit} />
            ))}
          </div>
        )}
      </div>

      {/* Unit detail slide-over */}
      {selectedUnit && (
        <UnitDetail unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
