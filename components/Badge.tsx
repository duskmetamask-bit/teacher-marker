"use client";
import { C, radius } from "@/lib/design";

interface BadgeProps {
  size?: "sm" | "md";
}

export function AC9Badge({ codes, size = "sm" }: BadgeProps & { codes?: string[] }) {
  if (!codes || codes.length === 0) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(99,102,241,0.15)",
        border: "1px solid rgba(99,102,241,0.4)",
        color: "#a5b4fc",
        borderRadius: radius.full,
        padding: size === "sm" ? "2px 8px" : "4px 12px",
        fontSize: size === "sm" ? 10 : 12,
        fontWeight: 600,
        letterSpacing: "0.03em",
        fontFamily: "monospace",
      }}
    >
      <span style={{ color: "#6366f1", fontWeight: 700 }}>AC9</span>
      {codes.join(", ")}
    </span>
  );
}

export function AITSLBadge({ standards, size = "sm" }: BadgeProps & { standards?: string[] }) {
  if (!standards || standards.length === 0) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(52,211,153,0.12)",
        border: "1px solid rgba(52,211,153,0.35)",
        color: "#6ee7b7",
        borderRadius: radius.full,
        padding: size === "sm" ? "2px 8px" : "4px 12px",
        fontSize: size === "sm" ? 10 : 12,
        fontWeight: 600,
        letterSpacing: "0.03em",
      }}
    >
      <span style={{ color: "#34d399", fontWeight: 700 }}>AITSL</span>
      {standards.join(", ")}
    </span>
  );
}

export function PrivacyBadge({ size = "sm" }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(92,100,144,0.15)",
        border: "1px solid rgba(92,100,144,0.3)",
        color: "#99a3c7",
        borderRadius: radius.full,
        padding: size === "sm" ? "2px 8px" : "4px 12px",
        fontSize: size === "sm" ? 10 : 12,
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      🔒 Your session is private
    </span>
  );
}

export function GuardrailMessage() {
  return (
    <div
      style={{
        marginTop: 10,
        padding: "10px 14px",
        background: "rgba(251,191,36,0.08)",
        border: "1px solid rgba(251,191,36,0.25)",
        borderRadius: radius.md,
        fontSize: 12,
        color: "#fbbf24",
        lineHeight: 1.55,
        width: "100%",
      }}
    >
      <strong style={{ display: "block", marginBottom: 4 }}>
        I can help with teaching topics:
      </strong>
      Lesson plans, unit plans, assessment rubrics, AC9 curriculum
      alignment, AITSL standards, differentiation strategies, classroom
      management, or any teaching challenge.
    </div>
  );
}

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
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
        alignItems: "center",
      }}
    >
      <AC9Badge codes={ac9Codes} />
      <AITSLBadge standards={aitslStandards} />
      {showPrivacy && <PrivacyBadge />}
      {showGuardrail && <GuardrailMessage />}
    </div>
  );
}
