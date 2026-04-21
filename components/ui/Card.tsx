"use client";

import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface";
}

export default function Card({ variant = "default", children, ...props }: CardProps) {
  const style: React.CSSProperties = {
    background: variant === "surface" ? "var(--surface)" : "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    boxShadow: "var(--shadow)",
    padding: "24px",
    ...props.style,
  };

  return (
    <div style={style} className={props.className} {...props}>
      {children}
    </div>
  );
}
