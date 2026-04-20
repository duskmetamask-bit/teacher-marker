"use client";

import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error";
}

export default function Badge({ variant = "default", children, ...props }: BadgeProps) {
  const map: Record<string, string> = {
    default: "var(--text-secondary)",
    primary: "var(--primary)",
    success: "var(--success)",
    warning: "var(--warning)",
    error: "var(--error)",
  };

  const color = map[variant] ?? map.default;

  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    background: "var(--surface)",
    color,
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    border: `1px solid var(--border)`,
    ...props.style,
  };

  return (
    <span style={style} {...props}>
      {children}
    </span>
  );
}
