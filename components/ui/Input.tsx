"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style: incomingStyle, ...props }: InputProps) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface)",
    color: "var(--text)",
    border: error ? "1px solid var(--error)" : "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    fontSize: 13,
    outline: "none",
    transition: "border-color var(--transition)",
    fontFamily: "inherit",
    ...incomingStyle,
  };

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label style={{
          display: "block",
          color: "var(--text-secondary)",
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <input
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? "var(--error)" : "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
        {...props}
      />
      {error && (
        <p style={{ color: "var(--error)", fontSize: 11, marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}
