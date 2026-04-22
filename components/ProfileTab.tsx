"use client";

import { useState } from "react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Card from "./ui/Card";
import { C, radius } from "@/lib/design";

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
}

interface ProfileTabProps {
  profile: TeacherProfile | null;
}

const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"];
const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "HPE", "Languages"];

export default function ProfileTab({ profile }: ProfileTabProps) {
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    selectedYears: profile?.yearLevels ?? [],
    selectedSubjects: profile?.subjects ?? [],
  });

  function toggleYear(level: string) {
    setForm((prev) => ({
      ...prev,
      selectedYears: prev.selectedYears.includes(level)
        ? prev.selectedYears.filter((y) => y !== level)
        : [...prev.selectedYears, level],
    }));
  }

  function toggleSubject(subject: string) {
    setForm((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter((s) => s !== subject)
        : [...prev.selectedSubjects, subject],
    }));
  }

  function handleSave() {
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!profile) return null;

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>Profile</h2>
        {!editMode && <Button size="sm" onClick={() => setEditMode(true)}>Edit Profile</Button>}
        {saved && <div style={{ color: "var(--success)", fontSize: 13, animation: "fadeIn 0.2s ease-out" }}>Saved successfully</div>}
      </div>

      {/* Avatar section */}
      <Card style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), #8B5CF6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}>
            {form.name ? form.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            {editMode ? (
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--primary)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 16,
                  fontWeight: 700,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            ) : (
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>{form.name}</div>
            )}
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>Australian Teacher</div>
          </div>
        </div>
      </Card>

      {/* Year Levels */}
      <Card style={{ marginBottom: "1rem" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
          Year Levels You Teach
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {YEAR_LEVELS.map((level) => {
            const selected = form.selectedYears.includes(level);
            return editMode ? (
              <button
                key={level}
                onClick={() => toggleYear(level)}
                style={{
                  background: selected ? "rgba(59,130,246,0.15)" : "var(--surface)",
                  color: selected ? "var(--primary)" : "var(--text-secondary)",
                  border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: selected ? 600 : 400,
                  cursor: "pointer",
                  transition: "all var(--transition)",
                }}
              >
                {level}
              </button>
            ) : (
              <Badge key={level} variant={selected ? "primary" : "default"}>{level}</Badge>
            );
          })}
        </div>
      </Card>

      {/* Subjects */}
      <Card style={{ marginBottom: "1rem" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
          Subjects You Teach
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUBJECTS.map((subject) => {
            const selected = form.selectedSubjects.includes(subject);
            return editMode ? (
              <button
                key={subject}
                onClick={() => toggleSubject(subject)}
                style={{
                  background: selected ? "rgba(59,130,246,0.15)" : "var(--surface)",
                  color: selected ? "var(--primary)" : "var(--text-secondary)",
                  border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: selected ? 600 : 400,
                  cursor: "pointer",
                  transition: "all var(--transition)",
                }}
              >
                {subject}
              </button>
            ) : (
              <Badge key={subject} variant={selected ? "primary" : "default"}>{subject}</Badge>
            );
          })}
        </div>
      </Card>

      {/* Subscription */}
      <Card>
        <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          Subscription
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--success)", fontWeight: 600, fontSize: 14 }}>Free Trial</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2 }}>14 days remaining</div>
          </div>
          <Button size="sm" variant="secondary">Upgrade</Button>
        </div>
      </Card>

      {editMode && (
        <div style={{ display: "flex", gap: 8, marginTop: "1rem", justifyContent: "flex-end" }}>
          <Button size="sm" variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}
