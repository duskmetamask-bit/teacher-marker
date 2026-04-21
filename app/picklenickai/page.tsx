"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatTab from "@/components/ChatTab";
import LibraryTab from "@/components/LibraryTab";
import CurriculumTab from "@/components/CurriculumTab";
import FrameworksTab from "@/components/FrameworksTab";
import AssessmentsTab from "@/components/AssessmentsTab";
import AdminTab from "@/components/AdminTab";
import ProfileTab from "@/components/ProfileTab";
import TeacherOnboarding from "@/components/TeacherOnboarding";
import ErrorBoundary from "@/components/ErrorBoundary";

type TabId = "chat" | "library" | "curriculum" | "frameworks" | "assessments" | "admin" | "profile";

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
      <div
        style={{
          background: "#0d0f1a",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              width: 56,
              height: 56,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 16,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            PN
          </div>
          <p style={{ color: "#99a3c7", fontSize: "0.875rem" }}>Loading PickleNickAI...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <TeacherOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div
      style={{
        background: "#0d0f1a",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />

      <main
        style={{
          flex: 1,
          marginLeft: 0,
          overflowY: "auto",
          minHeight: "100vh",
          background: "#0d0f1a",
        }}
        className="main-content"
      >
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
            <ErrorBoundary title="Chat error"><ChatTab teacherProfile={profile} sessionId={sessionId} /></ErrorBoundary>
          ) : activeTab === "library" ? (
            <ErrorBoundary title="Library error"><LibraryTab /></ErrorBoundary>
          ) : activeTab === "curriculum" ? (
            <ErrorBoundary title="Curriculum error"><CurriculumTab /></ErrorBoundary>
          ) : activeTab === "frameworks" ? (
            <ErrorBoundary title="Frameworks error"><FrameworksTab /></ErrorBoundary>
          ) : activeTab === "assessments" ? (
            <ErrorBoundary title="Assessments error"><AssessmentsTab /></ErrorBoundary>
          ) : activeTab === "admin" ? (
            <ErrorBoundary title="Admin error"><AdminTab /></ErrorBoundary>
          ) : activeTab === "profile" ? (
            <ErrorBoundary title="Profile error"><ProfileTab profile={profile} /></ErrorBoundary>
          ) : null}
        </div>
      </main>
    </div>
  );
}
