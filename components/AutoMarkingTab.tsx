"use client";

import { useState, useRef, useCallback } from "react";
import Button from "./ui/Button";
import { C } from "../lib/design";

interface UploadZoneProps {
  label: string;
  hint: string;
  image: string | null;
  onChange: (dataUrl: string | null) => void;
}

function UploadZone({ label, hint, image, onChange }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      style={{
        flex: 1,
        minWidth: 0,
        border: `1.5px dashed ${image ? C.accent : C.border2}`,
        borderRadius: "var(--radius-md)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "pointer",
        background: image ? `${C.accent}08` : "transparent",
        transition: "all 0.15s ease",
        position: "relative",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {image ? (
        <>
          <img
            src={image}
            alt={label}
            style={{
              width: "100%",
              maxHeight: 180,
              objectFit: "contain",
              borderRadius: "var(--radius-sm)",
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: C.surface3,
              border: `1px solid ${C.border}`,
              borderRadius: "var(--radius-sm)",
              color: C.text2,
              padding: "4px 10px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 12l-5-5-5 5M12 3v12" stroke={C.text2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 11, color: C.text3 }}>
              {hint}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface GradingResult {
  score: string;
  summary: string;
  breakdown: Array<{ criterion: string; marks: string; feedback: string }>;
  areasToImprove: string[];
  nextSteps: string;
}

export default function AutoMarkingTab() {
  const [studentWork, setStudentWork] = useState<string | null>(null);
  const [rubric, setRubric] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGrade = async () => {
    if (!studentWork) {
      setError("Please upload a student work image");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      if (studentWork) fd.append("studentWorkImage", studentWork);
      if (rubric) fd.append("markingGuideImage", rubric);

      const res = await fetch("/api/auto-mark", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Grading failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const scoreNum = result
    ? parseFloat(result.score.replace(/[^0-9.]/g, ""))
    : null;

  const scoreColor =
    scoreNum === null ? C.text
    : scoreNum >= 7 ? C.success
    : scoreNum >= 4 ? C.warning
    : C.danger;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
          Auto-Marking
        </h1>
        <p style={{ fontSize: 13, color: C.text3, margin: 0 }}>
          Upload student work and rubric images — AI grades them instantly.
        </p>
      </div>

      {/* Upload zones */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <UploadZone
          label="Student Work"
          hint="Drop or click to upload"
          image={studentWork}
          onChange={setStudentWork}
        />
        <UploadZone
          label="Rubric"
          hint="Optional — drop or click to upload"
          image={rubric}
          onChange={setRubric}
        />
      </div>

      {/* Grade button */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 28 }}>
        <Button
          onClick={handleGrade}
          disabled={!studentWork || loading}
          variant="primary"
          size="lg"
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Grading...
            </>
          ) : "Grade This"}
        </Button>

        {error && (
          <span style={{ fontSize: 13, color: C.danger, marginLeft: 8 }}>
            {error}
          </span>
        )}
      </div>

      {/* Results panel */}
      {result && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          {/* Score header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "20px 24px",
              borderBottom: `1px solid ${C.border}`,
              background: `${scoreColor}0a`,
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {result.score}
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.text3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Overall Score
              </div>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.4 }}>
                {result.summary}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Criterion Breakdown
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {result.breakdown.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.text,
                      background: C.surface3,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      whiteSpace: "nowrap",
                      marginTop: 1,
                    }}
                  >
                    {item.marks}
                  </span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 2 }}>
                      {item.criterion}
                    </div>
                    <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>
                      {item.feedback}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Areas to Improve & Next Steps */}
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Areas to Improve
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 5 }}>
                {result.areasToImprove.map((item, i) => (
                  <li key={i} style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Next Steps
              </div>
              <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6, margin: 0 }}>
                {result.nextSteps}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}