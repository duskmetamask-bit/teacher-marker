"use client";

import { useState } from "react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

interface Task {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: "available" | "coming-soon";
}

const TASKS: Task[] = [
  { id: "timetables", title: "Timetables", description: "View and manage class schedules", icon: "[=]", status: "available" },
  { id: "meetings", title: "Meeting Notes", description: "Generate structured meeting notes", icon: "[m]", status: "available" },
  { id: "parent", title: "Parent Comms", description: "Templates for parent communication", icon: "[@]", status: "available" },
  { id: "pd", title: "PD Log", description: "Track professional development (TRBWA)", icon: "[*]", status: "available" },
  { id: "reports", title: "Report Comments", description: "AI-assisted report writing", icon: "[r]", status: "coming-soon" },
  { id: "梯db", title: "Student Database", description: "Track student progress and needs", icon: "[s]", status: "coming-soon" },
];

export default function AdminTab() {
  const [launched, setLaunched] = useState<string | null>(null);

  function handleLaunch(task: Task) {
    if (task.status === "coming-soon") return;
    setLaunched(task.id);
    setTimeout(() => setLaunched(null), 2000);
  }

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>Admin Tasks</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "4px 0 0" }}>Tools to streamline your administrative work</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        {TASKS.map((task) => (
          <div
            key={task.id}
            onClick={() => handleLaunch(task)}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              cursor: task.status === "available" ? "pointer" : "default",
              boxShadow: "var(--shadow)",
              transition: "all var(--transition)",
              position: "relative",
              opacity: task.status === "coming-soon" ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (task.status === "available") {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "var(--shadow)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {task.status === "coming-soon" && (
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <Badge variant="warning">Coming Soon</Badge>
              </div>
            )}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "var(--text-secondary)",
              marginBottom: "0.75rem",
            }}>
              {task.icon}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: "0.25rem", color: "var(--text)" }}>{task.title}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{task.description}</div>

            {launched === task.id && (
              <div style={{ position: "absolute", inset: 0, background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius)" }}>
                <div style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>Opening...</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
