"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { C, radius, shadows, SUBJECT_COLORS } from "@/lib/design";

interface Unit {
  id: string;
  title: string;
  yearLevel: string | null;
  subject: string | null;
  ac9Codes: string[];
  createdAt: string;
}

function getSubjectColor(subject: string | null) {
  if (!subject) return { bg: C.surface2, text: C.text2, border: C.border };
  return SUBJECT_COLORS[subject] ?? { bg: C.surface2, text: C.text2, border: C.border };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Unit Card ───────────────────────────────────────────────────────

function UnitCard({
  unit,
  onOpen,
  onDelete,
}: {
  unit: Unit;
  onOpen: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const sc = getSubjectColor(unit.subject);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.surface2 : C.surface,
        border: `1px solid ${hovered ? C.border2 : C.border}`,
        borderRadius: radius.lg,
        padding: "20px",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? shadows.md : shadows.sm,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "default",
      }}
    >
      {/* Subject tag */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {unit.subject ? (
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
        ) : (
          <span />
        )}
        <span style={{ color: C.text3, fontSize: 11 }}>
          {formatDate(unit.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          color: C.text,
          fontSize: 15,
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.3,
          flex: 1,
        }}
      >
        {unit.title}
      </h3>

      {/* Year level */}
      {unit.yearLevel && (
        <p style={{ color: C.text2, fontSize: 12, margin: 0 }}>
          {unit.yearLevel}
        </p>
      )}

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
              +{unit.ac9Codes.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 4, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => onOpen(unit)}
          style={{
            flex: 1,
            background: hovered ? C.primary : C.surface2,
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
          Open
        </button>
        <button
          onClick={() => onDelete(unit)}
          style={{
            background: C.surface2,
            color: C.danger,
            border: `1px solid ${C.border}`,
            borderRadius: radius.sm,
            padding: "7px 10px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${C.danger}15`;
            e.currentTarget.style.borderColor = `${C.danger}50`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = C.surface2;
            e.currentTarget.style.borderColor = C.border;
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────

function DeleteModal({
  unit,
  onConfirm,
  onCancel,
}: {
  unit: Unit;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 40,
          backdropFilter: "blur(3px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: radius.xl,
          padding: "28px 32px",
          zIndex: 50,
          width: "min(420px, calc(100vw - 48px))",
          boxShadow: shadows.lg,
        }}
      >
        <h3 style={{ color: C.text, fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>
          Delete &quot;{unit.title}&quot;?
        </h3>
        <p style={{ color: C.text2, fontSize: 13, margin: "0 0 24px", lineHeight: 1.6 }}>
          This will permanently remove the unit from your library. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: C.surface2,
              color: C.text2,
              border: `1px solid ${C.border}`,
              borderRadius: radius.md,
              padding: "10px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: C.danger,
              color: "#fff",
              border: "none",
              borderRadius: radius.md,
              padding: "10px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Delete Unit
          </button>
        </div>
      </div>
    </>
  );
}

// ─── New Unit Modal ──────────────────────────────────────────────────

function NewUnitModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), yearLevel: yearLevel || null, subject: subject || null, ac9Codes: [], content: {} }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create unit");
      }
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 40,
          backdropFilter: "blur(3px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: radius.xl,
          padding: "28px 32px",
          zIndex: 50,
          width: "min(480px, calc(100vw - 48px))",
          boxShadow: shadows.lg,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ color: C.text, fontSize: 16, fontWeight: 800, margin: 0 }}>
            Create New Unit
          </h3>
          <button
            onClick={onClose}
            style={{
              background: C.surface2,
              color: C.text2,
              border: `1px solid ${C.border}`,
              borderRadius: radius.sm,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Unit Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Fractions"
              required
              style={{
                width: "100%",
                background: C.surface2,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: radius.md,
                padding: "10px 14px",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
              onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                style={{
                  width: "100%",
                  background: C.surface2,
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.md,
                  padding: "10px 14px",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              >
                <option value="">Select...</option>
                {["Pre-Primary","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9","Year 10","Year 11","Year 12"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", color: C.text2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: "100%",
                  background: C.surface2,
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.md,
                  padding: "10px 14px",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              >
                <option value="">Select...</option>
                {["Mathematics","English","Science","HASS","Technologies","The Arts","HPE","Languages"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ background: `${C.danger}12`, border: `1px solid ${C.danger}40`, color: C.danger, borderRadius: radius.md, padding: "10px 14px", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: C.surface2,
                color: C.text2,
                border: `1px solid ${C.border}`,
                borderRadius: radius.md,
                padding: "10px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              style={{
                flex: 2,
                background: loading ? C.surface2 : C.primary,
                color: loading ? C.text3 : "#fff",
                border: "none",
                borderRadius: radius.md,
                padding: "10px",
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : `0 4px 16px ${C.primary}40`,
              }}
            >
              {loading ? "Creating..." : "Create Unit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Filter Pills ─────────────────────────────────────────────────────

const ALL_SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "HPE", "Languages"];
const ALL_YEARS = ["Pre-Primary","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9","Year 10","Year 11","Year 12"];

function FilterPills({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ color: C.text3, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", minWidth: 60 }}>
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(selected === opt ? "" : opt)}
          style={{
            background: selected === opt ? `${C.primary}20` : C.surface2,
            color: selected === opt ? C.primary : C.text2,
            border: `1px solid ${selected === opt ? C.primary : C.border}`,
            borderRadius: radius.full,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: selected === opt ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main Library Tab ────────────────────────────────────────────────

export default function LibraryTab() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/units");
      if (!res.ok) throw new Error("Failed to load units");
      const data = await res.json();
      setUnits(data.units ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const filtered = units.filter((u) => {
    if (subjectFilter && u.subject !== subjectFilter) return false;
    if (yearFilter && u.yearLevel !== yearFilter) return false;
    return true;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/units/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setUnits((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete unit");
    } finally {
      setDeleting(false);
    }
  }

  function handleOpen(unit: Unit) {
    // Navigate to chat with the unit context
    router.push(`/picklenickai?tab=chat&unit=${unit.id}`);
  }

  const hasFilters = subjectFilter || yearFilter;

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
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h1 style={{ color: C.text, fontSize: 24, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                My Unit Library
              </h1>
              <p style={{ color: C.text2, fontSize: 14, margin: 0 }}>
                {loading ? "Loading..." : `${units.length} saved unit${units.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              style={{
                background: C.primary,
                color: "#fff",
                border: "none",
                borderRadius: radius.md,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 4px 16px ${C.primary}40`,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Unit
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FilterPills label="Subject" options={ALL_SUBJECTS} selected={subjectFilter} onChange={setSubjectFilter} />
            <FilterPills label="Year" options={ALL_YEARS} selected={yearFilter} onChange={setYearFilter} />
          </div>

          {hasFilters && (
            <button
              onClick={() => { setSubjectFilter(""); setYearFilter(""); }}
              style={{
                marginTop: 8,
                background: "transparent",
                color: C.danger,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.lg,
                  height: 180,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: radius.lg }}>
            <p style={{ color: C.danger, fontSize: 14, margin: "0 0 16px" }}>{error}</p>
            <button onClick={fetchUnits} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: radius.md, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: radius.lg }}>
            <div style={{ width: 56, height: 56, borderRadius: radius.lg, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 10h16M4 14h10M4 18h6" stroke={C.text3} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
              {hasFilters ? "No units match your filters" : "Your saved units will appear here"}
            </h3>
            <p style={{ color: C.text3, fontSize: 13, margin: "0 0 20px" }}>
              {hasFilters ? "Try different filter selections." : "Start a chat and save a lesson plan to build your library."}
            </p>
            {!hasFilters && (
              <button
                onClick={() => router.push("/picklenickai?tab=chat")}
                style={{
                  background: C.primary,
                  color: "#fff",
                  border: "none",
                  borderRadius: radius.md,
                  padding: "10px 24px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: `0 4px 16px ${C.primary}40`,
                }}
              >
                Go to Chat
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map((unit) => (
              <UnitCard key={unit.id} unit={unit} onOpen={handleOpen} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {deleteTarget && (
        <DeleteModal
          unit={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showNewModal && (
        <NewUnitModal
          onClose={() => setShowNewModal(false)}
          onCreated={fetchUnits}
        />
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
