"use client";

import { useEffect, useState } from "react";
import TeacherOnboarding from "@/components/TeacherOnboarding";
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
  icon: string;
}

const TABS: Tab[] = [
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "plans", label: "Lesson Plans", icon: "📚" },
  { id: "assessments", label: "Assessments", icon: "📝" },
  { id: "docs", label: "Doc Control", icon: "📄" },
  { id: "admin", label: "Admin Tasks", icon: "⚙️" },
  { id: "profile", label: "Profile", icon: "👤" },
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

// Placeholder components for each tab
function PlansTab() {
  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: "#e8eaf6", fontSize: "1.25rem", fontWeight: 600 }}>Lesson Plans</h2>
        <button style={{ background: "#6366f1", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.875rem", cursor: "pointer" }}>
          + Create New Plan
        </button>
      </div>
      <div style={{ display: "grid", gap: "1rem" }}>
        {["Year 5 Mathematics - Fractions", "Year 7 English - Narrative Writing", "Year 4 Science - Human Body Systems"].map((title, i) => (
          <div key={i} style={{ background: "#141627", border: "1px solid #2a2d45", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <div style={{ color: "#6366f1", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>WIEP • Year 5 • Mathematics</div>
            <div style={{ color: "#e8eaf6", fontWeight: 500, marginBottom: "0.5rem" }}>{title}</div>
            <div style={{ color: "#99a3c7", fontSize: "0.875rem" }}>Created 2 days ago • 45 min duration</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssessmentsTab() {
  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ color: "#e8eaf6", fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>Assessments</h2>
      <div style={{ background: "#141627", border: "1px solid #2a2d45", borderRadius: 12, padding: "2rem", textAlign: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📤</div>
        <div style={{ color: "#e8eaf6", fontWeight: 500, marginBottom: "0.5rem" }}>Upload Student Work</div>
        <div style={{ color: "#99a3c7", fontSize: "0.875rem", marginBottom: "1rem" }}>Drag & drop or click to upload</div>
        <button style={{ background: "#6366f1", color: "#fff", border: "none", padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: "0.875rem", cursor: "pointer" }}>Upload File</button>
      </div>
      <div style={{ color: "#5c6490", fontSize: "0.875rem", textAlign: "center" }}>Auto-grading and rubric builder coming soon</div>
    </div>
  );
}

function DocsTab() {
  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ color: "#e8eaf6", fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>Doc Control</h2>
      <div style={{ display: "grid", gap: "1rem" }}>
        {["Lesson Plan - Fractions (v2)", "Assessment Rubric - English (v1)", "Unit Planner - Science (v3)"].map((title, i) => (
          <div key={i} style={{ background: "#141627", border: "1px solid #2a2d45", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#e8eaf6", fontWeight: 500, marginBottom: "0.25rem" }}>{title}</div>
              <div style={{ color: "#99a3c7", fontSize: "0.875rem" }}>Last edited 1 day ago</div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button style={{ background: "#1c1f35", color: "#99a3c7", border: "1px solid #2a2d45", padding: "0.35rem 0.75rem", borderRadius: 6, fontSize: "0.75rem", cursor: "pointer" }}>Share</button>
              <button style={{ background: "#1c1f35", color: "#99a3c7", border: "1px solid #2a2d45", padding: "0.35rem 0.75rem", borderRadius: 6, fontSize: "0.75rem", cursor: "pointer" }}>Export</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTab() {
  const tasks = [
    { icon: "📅", title: "Timetables", desc: "View and manage class schedules" },
    { icon: "📋", title: "Meeting Notes", desc: "Generate structured meeting notes" },
    { icon: "📧", title: "Parent Comms", desc: "Templates for parent communication" },
    { icon: "🎓", title: "PD Log", desc: "Track professional development (TRBWA)" },
  ];
  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ color: "#e8eaf6", fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>Admin Tasks</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {tasks.map((task, i) => (
          <div key={i} style={{ background: "#141627", border: "1px solid #2a2d45", borderRadius: 12, padding: "1.25rem", cursor: "pointer" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{task.icon}</div>
            <div style={{ color: "#e8eaf6", fontWeight: 600, marginBottom: "0.25rem" }}>{task.title}</div>
            <div style={{ color: "#99a3c7", fontSize: "0.875rem" }}>{task.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ profile }: { profile: TeacherProfile | null }) {
  if (!profile) return null;
  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ color: "#e8eaf6", fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>Profile</h2>
      <div style={{ background: "#141627", border: "1px solid #2a2d45", borderRadius: 12, padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ color: "#99a3c7", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Name</div>
        <div style={{ color: "#e8eaf6", fontWeight: 500, marginBottom: "1rem" }}>{profile.name}</div>
        <div style={{ color: "#99a3c7", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Year Levels</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          {profile.yearLevels.map((y) => <span key={y} style={{ background: "#1c1f35", color: "#6366f1", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.875rem" }}>{y}</span>)}
        </div>
        <div style={{ color: "#99a3c7", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Subjects</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {profile.subjects.map((s) => <span key={s} style={{ background: "#1c1f35", color: "#22d3ee", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.875rem" }}>{s}</span>)}
        </div>
      </div>
      <div style={{ background: "#141627", border: "1px solid #2a2d45", borderRadius: 12, padding: "1.5rem" }}>
        <div style={{ color: "#99a3c7", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Subscription</div>
        <div style={{ color: "#2ea043", fontWeight: 600 }}>Free Trial — 14 days remaining</div>
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
      <div style={{ background: "#0d0f1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>
            🤖
          </div>
          <p style={{ color: "#99a3c7", fontSize: "0.875rem" }}>Loading PickleNickAI…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <TeacherOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{ background: "#0d0f1a", minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: "#141627", borderRight: "1px solid #2a2d45", display: "flex", flexDirection: "column", padding: "1rem 0" }}>
        {/* Logo */}
        <div style={{ padding: "0.75rem 1.25rem", marginBottom: "0.5rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e8eaf6" }}>🤖 PickleNickAI</div>
          <div style={{ fontSize: "0.75rem", color: "#5c6490" }}>Cut admin. Boost capability.</div>
        </div>
        <div style={{ borderTop: "1px solid #2a2d45", marginBottom: "0.5rem" }} />
        {/* Tabs */}
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1.25rem",
              background: activeTab === tab.id ? "#1c1f35" : "transparent",
              color: activeTab === tab.id ? "#e8eaf6" : "#99a3c7",
              border: "none",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: activeTab === tab.id ? 600 : 400,
              borderLeft: activeTab === tab.id ? "3px solid #6366f1" : "3px solid transparent",
            }}
          >
            <span style={{ fontSize: "1rem" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "chat" ? (
          <ChatInterface teacherProfile={profile} sessionId={sessionId} />
        ) : activeTab === "plans" ? (
          <PlansTab />
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