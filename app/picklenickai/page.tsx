"use client";

import { useState, useEffect } from "react";
import TeacherOnboarding from "@/components/TeacherOnboarding";
import PlanGenerator from "@/components/PlanGenerator";
import ChatInterface from "@/components/ChatInterface";

const SESSION_KEY = "picklenickai-session";

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
}

type TabId = "chat" | "plans" | "assessments" | "docs" | "admin" | "profile";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "chat", label: "Chat" },
  { id: "plans", label: "Lesson Plans" },
  { id: "assessments", label: "Assessments" },
  { id: "docs", label: "Doc Control" },
  { id: "admin", label: "Admin Tasks" },
  { id: "profile", label: "Profile" },
];

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function PlansTab({ sessionId }: { sessionId: string }) {
  return <PlanGenerator sessionId={sessionId} />;
}

function AssessmentsTab() {
  return (
    <div style={{ padding: "2rem 2rem 2rem 2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text)" }}>
        Assessments
      </h2>
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "2.5rem 2rem",
        textAlign: "center",
        boxShadow: "var(--shadow)",
        marginBottom: "1rem",
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--text3)" }}>[ ]</div>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>
          Upload Student Work
        </div>
        <div style={{ color: "var(--text2)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Drag & drop or click to upload
        </div>
        <button style={{
          background: "var(--primary)",
          color: "#fff",
          border: "none",
          padding: "0.5rem 1.25rem",
          borderRadius: 8,
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: "pointer",
        }}>
          Upload File
        </button>
      </div>
      <p style={{ color: "var(--text3)", fontSize: "0.875rem", textAlign: "center" }}>
        Auto-grading and rubric builder coming soon
      </p>
    </div>
  );
}

function DocsTab() {
  const docs = [
    { title: "Lesson Plan - Fractions (v2)", time: "Last edited 1 day ago" },
    { title: "Assessment Rubric - English (v1)", time: "Last edited 3 days ago" },
    { title: "Unit Planner - Science (v3)", time: "Last edited 1 week ago" },
  ];
  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text)" }}>
        Doc Control
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {docs.map((doc, i) => (
          <div key={i} style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1rem 1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "var(--shadow)",
          }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: "0.25rem", color: "var(--text)" }}>{doc.title}</div>
              <div style={{ color: "var(--text2)", fontSize: "0.875rem" }}>{doc.time}</div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button style={{
                background: "var(--surface)",
                color: "var(--text2)",
                border: "1px solid var(--border)",
                padding: "0.35rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.75rem",
                cursor: "pointer",
              }}>
                Share
              </button>
              <button style={{
                background: "var(--surface)",
                color: "var(--text2)",
                border: "1px solid var(--border)",
                padding: "0.35rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.75rem",
                cursor: "pointer",
              }}>
                Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTab() {
  const tasks = [
    { icon: "[=]", title: "Timetables", desc: "View and manage class schedules" },
    { icon: "[...]", title: "Meeting Notes", desc: "Generate structured meeting notes" },
    { icon: "[@]", title: "Parent Comms", desc: "Templates for parent communication" },
    { icon: "[*]", title: "PD Log", desc: "Track professional development (TRBWA)" },
  ];
  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text)" }}>
        Admin Tasks
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {tasks.map((task, i) => (
          <div key={i} style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.5rem",
            cursor: "pointer",
            boxShadow: "var(--shadow)",
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem", color: "var(--text3)" }}>{task.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--text)" }}>{task.title}</div>
            <div style={{ color: "var(--text2)", fontSize: "0.875rem" }}>{task.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ profile }: { profile: TeacherProfile | null }) {
  if (!profile) return null;
  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text)" }}>
        Profile
      </h2>
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        marginBottom: "1rem",
        boxShadow: "var(--shadow)",
      }}>
        <div style={{ color: "var(--text3)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          Name
        </div>
        <div style={{ fontWeight: 500, marginBottom: "1.25rem", color: "var(--text)" }}>{profile.name}</div>

        <div style={{ color: "var(--text3)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          Year Levels
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {profile.yearLevels.map((y) => (
            <span key={y} style={{
              background: "var(--surface)",
              color: "var(--primary)",
              padding: "0.25rem 0.75rem",
              borderRadius: 20,
              fontSize: "0.875rem",
              fontWeight: 500,
            }}>
              {y}
            </span>
          ))}
        </div>

        <div style={{ color: "var(--text3)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          Subjects
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {profile.subjects.map((s) => (
            <span key={s} style={{
              background: "var(--surface)",
              color: "var(--accent)",
              padding: "0.25rem 0.75rem",
              borderRadius: 20,
              fontSize: "0.875rem",
              fontWeight: 500,
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        boxShadow: "var(--shadow)",
      }}>
        <div style={{ color: "var(--text3)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          Subscription
        </div>
        <div style={{ color: "#16a34a", fontWeight: 600 }}>Free Trial — 14 days remaining</div>
      </div>
    </div>
  );
}

export default function PickleNickAIPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id, messages: [], checkProfile: true }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.profile?.name) {
          setProfile({
            name: data.profile.name,
            yearLevels: data.profile.year_levels || [],
            subjects: data.profile.subjects || [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleOnboardingComplete(p: TeacherProfile) {
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveProfile", sessionId, profile: p }),
      });
    } catch {}
    setProfile(p);
  }

  if (loading) {
    return (
      <div style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            width: 56,
            height: 56,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            margin: "0 auto 16px",
            color: "#fff",
            fontWeight: 700,
          }}>
            AI
          </div>
          <p style={{ color: "var(--text2)", fontSize: "0.875rem" }}>Loading PickleNickAI…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <TeacherOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{
      background: "var(--bg)",
      minHeight: "100vh",
      display: "flex",
    }}>
      {/* Sidebar */}
      <div style={{
        width: 240,
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "1rem 0",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "0.75rem 1.5rem", marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>
            PickleNickAI
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: "0.25rem" }}>
            Cut admin. Boost capability.
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", marginBottom: "0.75rem" }} />

        {/* Tabs */}
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1.5rem",
                background: isActive ? "var(--surface)" : "transparent",
                color: isActive ? "var(--text)" : "var(--text2)",
                border: "none",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                transition: "all var(--transition)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text2)";
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: 240,
        overflowY: "auto",
        minHeight: "100vh",
        background: "var(--bg)",
      }}>
        {activeTab === "chat" ? (
          <ChatInterface teacherProfile={profile} sessionId={sessionId} />
        ) : activeTab === "plans" ? (
          <PlansTab sessionId={sessionId} />
        ) : activeTab === "assessments" ? (
          <AssessmentsTab />
        ) : activeTab === "docs" ? (
          <DocsTab />
        ) : activeTab === "admin" ? (
          <AdminTab />
        ) : activeTab === "profile" ? (
          <ProfileTab profile={profile} />
        ) : null}
      </div>
    </div>
  );
}
