"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatTab from "@/components/ChatTab";
import PlansTab from "@/components/PlansTab";
import AssessmentsTab from "@/components/AssessmentsTab";
import DocsTab from "@/components/DocsTab";
import AdminTab from "@/components/AdminTab";
import ProfileTab from "@/components/ProfileTab";
import TeacherOnboarding from "@/components/TeacherOnboarding";

type TabId = "chat" | "plans" | "assessments" | "docs" | "admin" | "profile";

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
}

const SESSION_KEY = "picklenickai-session";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
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
        background: "var(--background)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--primary), #8B5CF6)",
            width: 56,
            height: 56,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            margin: "0 auto 16px",
            color: "#fff",
            fontWeight: 700,
          }}>
            AI
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Loading PickleNickAI...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <TeacherOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{
      background: "var(--background)",
      minHeight: "100vh",
      display: "flex",
    }}>
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Main content — offset by sidebar on desktop, padding on mobile */}
      <main style={{
        flex: 1,
        marginLeft: 0,
        overflowY: "auto",
        minHeight: "100vh",
        background: "var(--background)",
      }} className="main-content">
        <style>{`
          @media (min-width: 769px) {
            .main-content { margin-left: 240px; }
          }
          @media (max-width: 768px) {
            .main-content { padding-top: 56px; }
          }
        `}</style>

        <div style={{ display: activeTab === "chat" ? "flex" : "block", flexDirection: "column", minHeight: "100dvh" }}>
          {activeTab === "chat" ? (
            <ChatTab teacherProfile={profile} sessionId={sessionId} />
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
      </main>
    </div>
  );
}
