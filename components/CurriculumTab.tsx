"use client";

import { useState, useEffect } from "react";
import { C, shadows, radius, SUBJECT_COLORS } from "@/lib/design";

interface Subject {
  id: string;
  name: string;
  shortName: string;
  strands: string[];
  yearLevels: string[];
  description: string;
  crossCurriculum: string[];
}

const YEAR_LEVELS = ["Foundation", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

export default function CurriculumTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("Mathematics");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/library/curriculum")
      .then((r) => r.json())
      .then((data) => {
        setSubjects(data.subjects ?? []);
        if (data.subjects?.length > 0) setSelectedSubject(data.subjects[0].name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const subject = subjects.find((s) => s.name === selectedSubject) ?? subjects[0];
  const sc = SUBJECT_COLORS[subject?.name] ?? { bg: C.surface2, text: C.text2, border: C.border };

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
            Australian Curriculum v9
          </h1>
          <p style={{ color: C.text2, fontSize: 14, margin: 0 }}>
            Browse AC9 content descriptors by subject and year level. All content is PickleNickAI curated and aligned.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {/* Subject selector */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          {subjects.map((s) => {
            const isActive = s.name === selectedSubject;
            const sc2 = SUBJECT_COLORS[s.name] ?? { bg: C.surface2, text: C.text2, border: C.border };
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.name)}
                style={{
                  background: isActive ? sc2.bg : C.surface,
                  color: isActive ? sc2.text : C.text2,
                  border: `1px solid ${isActive ? sc2.border : C.border}`,
                  borderRadius: radius.full,
                  padding: "7px 16px",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = C.border2;
                    e.currentTarget.style.color = C.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.color = C.text2;
                  }
                }}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ color: C.text3, textAlign: "center", padding: 40 }}>Loading...</div>
        ) : subject ? (
          <>
            {/* Subject overview card */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: radius.lg,
                padding: "24px",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                <div
                  style={{
                    background: sc.bg,
                    color: sc.text,
                    border: `1px solid ${sc.border}`,
                    borderRadius: radius.md,
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {subject.name}
                </div>
                <p style={{ color: C.text2, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  {subject.description}
                </p>
              </div>

              {/* Strands */}
              <div style={{ marginBottom: 16 }}>
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
                  Strands
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {subject.strands.map((strand) => (
                    <span
                      key={strand}
                      style={{
                        background: C.surface2,
                        color: C.text2,
                        border: `1px solid ${C.border}`,
                        borderRadius: radius.sm,
                        padding: "4px 12px",
                        fontSize: 12,
                      }}
                    >
                      {strand}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cross-curriculum */}
              {subject.crossCurriculum.length > 0 && (
                <div>
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
                    Cross-Curriculum Priorities
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {subject.crossCurriculum.map((cc) => (
                      <span
                        key={cc}
                        style={{
                          background: `${C.accent}10`,
                          color: C.accent,
                          border: `1px solid ${C.accent}30`,
                          borderRadius: radius.sm,
                          padding: "4px 12px",
                          fontSize: 12,
                        }}
                      >
                        {cc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Year level breakdown */}
            <h2
              style={{
                color: C.text,
                fontSize: 16,
                fontWeight: 700,
                margin: 0,
                marginBottom: 16,
                letterSpacing: "-0.01em",
              }}
            >
              Content by Year Level
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {subject.yearLevels.map((yl) => (
                <div
                  key={yl}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: radius.lg,
                    padding: "16px 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{yl}</span>
                    <span
                      style={{
                        color: C.accent,
                        background: `${C.accent}10`,
                        border: `1px solid ${C.accent}30`,
                        borderRadius: radius.sm,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontFamily: "monospace",
                      }}
                    >
                      AC9{yl === "Foundation" ? "F" : yl.replace("Year ", "")}
                    </span>
                  </div>
                  <p style={{ color: C.text2, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                    {subject.strands.map((strand) => (
                      <span key={strand}>
                        <span style={{ color: sc.text }}>{strand}</span>
                        {strand !== subject.strands[subject.strands.length - 1] && " · "}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 60, color: C.text3 }}>
            No curriculum data available. Run the vault sync script to populate.
          </div>
        )}
      </div>
    </div>
  );
}
