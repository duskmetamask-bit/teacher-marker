"use client";

import { useState, useEffect } from "react";
import { C, shadows, radius } from "@/lib/design";

interface Phase {
  phase: string;
  duration: string;
  description: string;
}

interface Framework {
  id: string;
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  whenToUse: string;
  structure: Phase[];
  ac9Aligned: boolean;
  aitslStandard: string;
  tags: string[];
}

export default function FrameworksTab() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/library/frameworks")
      .then((r) => r.json())
      .then((data) => {
        setFrameworks(data.frameworks ?? []);
        if (data.frameworks?.length > 0) setExpandedId(data.frameworks[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            Teaching Frameworks
          </h1>
          <p style={{ color: C.text2, fontSize: 14, margin: 0 }}>
            Evidence-based planning models for Australian classrooms. WIEP is the default for WA schools.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div style={{ color: C.text3, textAlign: "center", padding: 40 }}>Loading...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {frameworks.map((fw) => {
              const isOpen = expandedId === fw.id;
              return (
                <div
                  key={fw.id}
                  style={{
                    background: C.surface,
                    border: `1px solid ${isOpen ? C.primary + "60" : C.border}`,
                    borderRadius: radius.lg,
                    overflow: "hidden",
                    transition: "border-color 0.2s ease",
                    boxShadow: isOpen ? shadows.glow : shadows.sm,
                  }}
                >
                  {/* Card header */}
                  <button
                    onClick={() => setExpandedId(isOpen ? null : fw.id)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "20px 24px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span
                          style={{
                            color: C.primary,
                            fontSize: 18,
                            fontWeight: 900,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {fw.name}
                        </span>
                        {fw.ac9Aligned && (
                          <span
                            style={{
                              color: C.success,
                              background: `${C.success}15`,
                              border: `1px solid ${C.success}40`,
                              borderRadius: radius.full,
                              padding: "2px 8px",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            AC9 Aligned
                          </span>
                        )}
                      </div>
                      <p style={{ color: C.text2, fontSize: 13, margin: 0, marginBottom: 6 }}>
                        {fw.tagline}
                      </p>
                      <p style={{ color: C.text3, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                        {fw.description.slice(0, 160)}...
                      </p>
                    </div>
                    <span
                      style={{
                        color: C.text3,
                        fontSize: 12,
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                      }}
                    >
                      &#9660;
                    </span>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div
                      style={{
                        borderTop: `1px solid ${C.border}`,
                        padding: "24px",
                        background: `linear-gradient(180deg, ${C.surface2} 0%, ${C.surface} 100%)`,
                      }}
                    >
                      {/* When to use */}
                      <div
                        style={{
                          background: `${C.accent}10`,
                          border: `1px solid ${C.accent}30`,
                          borderRadius: radius.md,
                          padding: "14px 16px",
                          marginBottom: 20,
                        }}
                      >
                        <p
                          style={{
                            color: C.accent,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            margin: "0 0 6px",
                          }}
                        >
                          When to Use
                        </p>
                        <p style={{ color: C.text2, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                          {fw.whenToUse}
                        </p>
                      </div>

                      {/* AITSL */}
                      {fw.aitslStandard && (
                        <div style={{ marginBottom: 20 }}>
                          <p
                            style={{
                              color: C.text3,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              margin: "0 0 8px",
                            }}
                          >
                            AITSL Standards
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {fw.aitslStandard.split(",").map((std) => (
                              <span
                                key={std}
                                style={{
                                  background: `${C.primary}15`,
                                  color: C.primary,
                                  border: `1px solid ${C.primary}40`,
                                  borderRadius: radius.sm,
                                  padding: "4px 10px",
                                  fontSize: 11,
                                  fontFamily: "monospace",
                                }}
                              >
                                {std.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Structure */}
                      <div>
                        <p
                          style={{
                            color: C.text3,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            margin: "0 0 12px",
                          }}
                        >
                          Lesson Structure
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {fw.structure.map((phase, i) => (
                            <div
                              key={phase.phase}
                              style={{
                                background: C.surface,
                                border: `1px solid ${C.border}`,
                                borderRadius: radius.md,
                                padding: "12px 16px",
                                display: "flex",
                                gap: 14,
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, #6366f1, #818cf8)`,
                                  color: "#fff",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {i + 1}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 3,
                                  }}
                                >
                                  <span
                                    style={{ color: C.text, fontWeight: 600, fontSize: 13 }}
                                  >
                                    {phase.phase}
                                  </span>
                                  <span
                                    style={{
                                      color: C.accent,
                                      background: `${C.accent}10`,
                                      border: `1px solid ${C.accent}30`,
                                      borderRadius: radius.sm,
                                      padding: "2px 8px",
                                      fontSize: 10,
                                    }}
                                  >
                                    {phase.duration}
                                  </span>
                                </div>
                                <p style={{ color: C.text2, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                                  {phase.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      {fw.tags.length > 0 && (
                        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {fw.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                background: C.tag,
                                color: C.text2,
                                borderRadius: radius.sm,
                                padding: "3px 10px",
                                fontSize: 11,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
