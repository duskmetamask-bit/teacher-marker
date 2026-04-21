"use client";
import { C, radius } from "@/lib/design";

interface BadgeProps {
  size?: "sm" | "md";
}

// ─── Certification Bar (wraps all badges) ─────────────────────────────────

export function CertificationBar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(52,211,153,0.05) 100%)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: radius.md,
        padding: "10px 14px",
        marginBottom: 10,
        animation: "certSlideIn 0.4s ease-out",
      }}
    >
      <style>{`
        @keyframes certSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── AC9 Badge — PROMINENT ───────────────────────────────────────────────

export function AC9Badge({ codes, size = "sm" }: BadgeProps & { codes?: string[] }) {
  if (!codes || codes.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        background: "rgba(99,102,241,0.12)",
        border: "1px solid rgba(99,102,241,0.5)",
        borderRadius: radius.md,
        padding: size === "sm" ? "6px 10px" : "8px 14px",
        boxShadow: "0 0 12px rgba(99,102,241,0.15), inset 0 0 8px rgba(99,102,241,0.05)",
        animation: "ac9Glow 3s ease-in-out infinite alternate",
      }}
    >
      <style>{`
        @keyframes ac9Glow {
          from { box-shadow: 0 0 8px rgba(99,102,241,0.15), inset 0 0 4px rgba(99,102,241,0.05); }
          to { box-shadow: 0 0 16px rgba(99,102,241,0.25), inset 0 0 8px rgba(99,102,241,0.08); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: size === "sm" ? 9 : 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "#818cf8",
          textTransform: "uppercase",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#6366f1" strokeWidth="1.5"/>
          <path d="M5 8l2 2 4-4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        AC9 Curriculum Alignment
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        {codes.map((code, i) => (
          <span
            key={i}
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
              borderRadius: radius.sm,
              padding: "1px 6px",
              fontSize: size === "sm" ? 10 : 12,
              fontWeight: 600,
              fontFamily: "monospace",
              letterSpacing: "0.02em",
            }}
          >
            {code}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── AITSL Badge — PROMINENT ─────────────────────────────────────────────

export function AITSLBadge({ standards, size = "sm" }: BadgeProps & { standards?: string[] }) {
  if (!standards || standards.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        background: "rgba(52,211,153,0.1)",
        border: "1px solid rgba(52,211,153,0.4)",
        borderRadius: radius.md,
        padding: size === "sm" ? "6px 10px" : "8px 14px",
        boxShadow: "0 0 12px rgba(52,211,153,0.12), inset 0 0 8px rgba(52,211,153,0.04)",
        animation: "aitslGlow 3s ease-in-out infinite alternate",
      }}
    >
      <style>{`
        @keyframes aitslGlow {
          from { box-shadow: 0 0 8px rgba(52,211,153,0.12), inset 0 0 4px rgba(52,211,153,0.04); }
          to { box-shadow: 0 0 16px rgba(52,211,153,0.22), inset 0 0 8px rgba(52,211,153,0.07); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: size === "sm" ? 9 : 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "#6ee7b7",
          textTransform: "uppercase",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <path d="M8 1l2.09 4.26L15 6.18l-3.5 3.41.82 4.79L8 12.5l-4.32 1.88.82-4.79L1 6.18l4.91-.92L8 1z" fill="#34d399" stroke="#34d399" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
        AITSL Professional Standards
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        {standards.map((std, i) => (
          <span
            key={i}
            style={{
              background: "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.3)",
              color: "#6ee7b7",
              borderRadius: radius.sm,
              padding: "1px 6px",
              fontSize: size === "sm" ? 10 : 12,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {std}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Privacy Badge — PROMINENT ───────────────────────────────────────────

export function PrivacyBadge({ size = "sm" }: BadgeProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(92,100,144,0.15)",
        border: "1px solid rgba(92,100,144,0.35)",
        borderRadius: radius.md,
        padding: size === "sm" ? "5px 10px" : "6px 12px",
        animation: "privacyPulse 4s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes privacyPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(92,100,144,0); }
          50% { box-shadow: 0 0 8px rgba(92,100,144,0.15); }
        }
      `}</style>
      <span style={{ fontSize: size === "sm" ? 11 : 13 }}>
        🔒
      </span>
      <span
        style={{
          fontSize: size === "sm" ? 10 : 12,
          fontWeight: 600,
          color: "#99a3c7",
          letterSpacing: "0.02em",
        }}
      >
        Your session is private — always
      </span>
    </div>
  );
}

// ─── Guardrail Message — Polished ────────────────────────────────────────

export function GuardrailMessage({
  suggestedTopics = [],
}: {
  suggestedTopics?: string[];
}) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: "12px 16px",
        background: "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.04) 100%)",
        border: "1px solid rgba(251,191,36,0.3)",
        borderRadius: radius.md,
        fontSize: 13,
        color: "#fbbf24",
        lineHeight: 1.6,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div
          style={{
            background: "rgba(251,191,36,0.15)",
            borderRadius: radius.sm,
            padding: "4px 8px",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          <span style={{ fontSize: 14 }}>⚠️</span>
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ display: "block", marginBottom: 6, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Teaching topics only
          </strong>
          <p style={{ margin: "0 0 8px 0", color: "#fcd34d", fontSize: 12 }}>
            I'm here to help with lesson plans, assessment design, AC9 curriculum alignment, AITSL standards, and classroom strategies. What are you working on?
          </p>
          {suggestedTopics.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {suggestedTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => {
                    // Dispatch custom event for parent to handle
                    window.dispatchEvent(new CustomEvent("pickle-topic-click", { detail: { topic } }));
                  }}
                  style={{
                    background: "rgba(251,191,36,0.12)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    borderRadius: radius.full,
                    padding: "3px 10px",
                    fontSize: 11,
                    color: "#fcd34d",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(251,191,36,0.2)";
                    e.currentTarget.style.borderColor = "rgba(251,191,36,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(251,191,36,0.12)";
                    e.currentTarget.style.borderColor = "rgba(251,191,36,0.3)";
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Badge Row — REBUILT ─────────────────────────────────────────────────

export function BadgeRow({
  ac9Codes,
  aitslStandards,
  showPrivacy = true,
  showGuardrail = false,
}: {
  ac9Codes?: string[];
  aitslStandards?: string[];
  showPrivacy?: boolean;
  showGuardrail?: boolean;
}) {
  const hasAnyBadge = (ac9Codes && ac9Codes.length > 0) || (aitslStandards && aitslStandards.length > 0) || showPrivacy;

  if (!hasAnyBadge) return null;

  return (
    <CertificationBar>
      <AC9Badge codes={ac9Codes} />
      <AITSLBadge standards={aitslStandards} />
      {showPrivacy && <PrivacyBadge />}
      {showGuardrail && <GuardrailMessage />}
    </CertificationBar>
  );
}