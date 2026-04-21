"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontWeight: 500,
    cursor: "pointer",
    transition: "var(--transition)",
    fontFamily: "inherit",
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 12px", fontSize: 12 },
    md: { padding: "8px 16px", fontSize: 13 },
    lg: { padding: "12px 24px", fontSize: 14 },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "var(--primary)", color: "#fff", boxShadow: "var(--shadow)" },
    secondary: { background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" },
    ghost: { background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" },
    danger: { background: "transparent", color: "var(--error)", border: "1px solid var(--error)" },
  };

  const style = { ...base, ...sizes[size], ...variants[variant] };

  return (
    <button
      style={style}
      onMouseEnter={(e) => {
        if (variant === "primary") e.currentTarget.style.background = "var(--primary-hover)";
        else if (variant === "secondary" || variant === "ghost") {
          e.currentTarget.style.background = "var(--border)";
          e.currentTarget.style.color = "var(--text)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") e.currentTarget.style.background = "var(--primary)";
        else if (variant === "secondary" || variant === "ghost") {
          e.currentTarget.style.background = "var(--surface)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
