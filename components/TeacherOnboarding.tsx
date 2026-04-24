"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { C, radius, shadows } from "@/lib/design";

const YEAR_LEVELS = [
  "Pre-Primary", "Year 1", "Year 2", "Year 3",
  "Year 4", "Year 5", "Year 6",
  "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12",
];

const SUBJECTS = [
  "Mathematics", "English", "Science", "HASS",
  "Technologies", "The Arts", "HPE", "Languages",
];

const SCHOOL_TYPES = [
  "Government (Public)",
  "Catholic",
  "Independent",
  "Other",
];

const STEPS = ["Welcome", "Year Levels", "Subjects", "School Type", "Done"];

function MultiSelectButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: selected ? "rgba(99,102,241,0.15)" : C.surface2,
        color: selected ? C.primary : C.text2,
        border: `1px solid ${selected ? C.primary : C.border}`,
        borderRadius: radius.md,
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s ease",
        textAlign: "center",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.background = C.surface3;
          e.currentTarget.style.borderColor = C.border2;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.background = C.surface2;
          e.currentTarget.style.borderColor = C.border;
        }
      }}
    >
      {label}
    </button>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = ((step) / (STEPS.length - 1)) * 100;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        {STEPS.map((s, i) => (
          <span
            key={s}
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: i <= step ? C.primary : C.text3,
              transition: "color 0.3s ease",
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <div style={{ background: C.surface2, borderRadius: radius.full, height: 4, overflow: "hidden" }}>
        <div
          style={{
            background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
            height: "100%",
            width: `${pct}%`,
            borderRadius: radius.full,
            transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

export default function TeacherOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [schoolType, setSchoolType] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
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

  async function handleDone() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/teachers/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", yearLevels: selectedYears, subjects: selectedSubjects, schoolType }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Onboarding failed");
      }
      setStep(4); // Done step
      setTimeout(() => { router.push("/picklenickai?onboarded=1"); }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  function advance() {
    setError("");
    if (step === 1 && selectedYears.length === 0) {
      setError("Please select at least one year level.");
      return;
    }
    if (step === 2 && selectedSubjects.length === 0) {
      setError("Please select at least one subject.");
      return;
    }
    setStep((s) => s + 1);
  }

  const cardCls = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    boxShadow: shadows.lg,
    borderRadius: radius.xl,
    padding: "36px 40px",
    maxWidth: 560,
    width: "100%",
  };

  return (
    <div
      style={{ background: C.bg, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div style={cardCls}>
        <ProgressBar step={step} />

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
              width: 64,
              height: 64,
              borderRadius: radius.xl,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "#fff",
              margin: "0 auto 20px",
            }}>
              AI
            </div>
            <h1 style={{ color: C.text, fontSize: 22, fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Welcome to PickleNickAI
            </h1>
            <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 32px" }}>
              Your personal AI teaching assistant for Australian F–6 teachers.
              Let&apos;s set up your profile in a few quick steps.
            </p>
            <button
              onClick={advance}
              style={{
                background: C.primary,
                color: "#fff",
                border: "none",
                borderRadius: radius.md,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
                boxShadow: `0 4px 16px ${C.primary}40`,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Let&apos;s go!
            </button>
          </div>
        )}

        {/* ── Step 1: Year Levels ── */}
        {step === 1 && (
          <div>
            <h2 style={{ color: C.text, fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>
              What year levels do you teach?
            </h2>
            <p style={{ color: C.text2, fontSize: 13, margin: "0 0 24px" }}>
              Select all that apply.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
              {YEAR_LEVELS.map((level) => (
                <MultiSelectButton
                  key={level}
                  label={level}
                  selected={selectedYears.includes(level)}
                  onClick={() => toggleYear(level)}
                />
              ))}
            </div>
            {error && <ErrorMsg msg={error} />}
            <div style={{ display: "flex", gap: 10 }}>
              <BackBtn onClick={() => { setStep(0); setError(""); }} />
              <NextBtn onClick={advance} label="Continue" />
            </div>
          </div>
        )}

        {/* ── Step 2: Subjects ── */}
        {step === 2 && (
          <div>
            <h2 style={{ color: C.text, fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>
              What subjects do you teach?
            </h2>
            <p style={{ color: C.text2, fontSize: 13, margin: "0 0 24px" }}>
              Select all that apply.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 24 }}>
              {SUBJECTS.map((subject) => (
                <MultiSelectButton
                  key={subject}
                  label={subject}
                  selected={selectedSubjects.includes(subject)}
                  onClick={() => toggleSubject(subject)}
                />
              ))}
            </div>
            {error && <ErrorMsg msg={error} />}
            <div style={{ display: "flex", gap: 10 }}>
              <BackBtn onClick={() => { setStep(1); setError(""); }} />
              <NextBtn onClick={advance} label="Continue" />
            </div>
          </div>
        )}

        {/* ── Step 3: School Type ── */}
        {step === 3 && (
          <div>
            <h2 style={{ color: C.text, fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>
              What type of school do you work at?
            </h2>
            <p style={{ color: C.text2, fontSize: 13, margin: "0 0 24px" }}>
              This helps us tailor suggestions to your context.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {SCHOOL_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSchoolType(type)}
                  style={{
                    background: schoolType === type ? `${C.primary}15` : C.surface2,
                    color: schoolType === type ? C.primary : C.text2,
                    border: `1px solid ${schoolType === type ? C.primary : C.border}`,
                    borderRadius: radius.md,
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: schoolType === type ? 600 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <BackBtn onClick={() => { setStep(2); setError(""); }} />
              <NextBtn onClick={advance} label="Continue" disabled={!schoolType} />
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 4 && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              background: `${C.success}20`,
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              border: `2px solid ${C.success}`,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>
              You&apos;re all set!
            </h2>
            <p style={{ color: C.text2, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
              Your profile is ready. Let&apos;s start building some great lessons.
            </p>
            <p style={{ color: C.text3, fontSize: 12 }}>
              Redirecting you to the chat...
            </p>
          </div>
        )}
      </div>

      {/* Hidden submit button for done step */}
      {step === 3 && (
        <button
          type="button"
          onClick={handleDone}
          disabled={submitting}
          style={{ display: "none" }}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{
      background: `${C.danger}12`,
      border: `1px solid ${C.danger}40`,
      color: C.danger,
      borderRadius: radius.md,
      padding: "10px 14px",
      fontSize: 13,
      marginBottom: 16,
    }}>
      {msg}
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        background: C.surface2,
        color: C.text2,
        border: `1px solid ${C.border}`,
        borderRadius: radius.md,
        padding: "12px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      Back
    </button>
  );
}

function NextBtn({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 2,
        background: disabled ? C.surface2 : C.primary,
        color: disabled ? C.text3 : "#fff",
        border: "none",
        borderRadius: radius.md,
        padding: "12px",
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `0 4px 16px ${C.primary}40`,
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}
