"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
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

function SignInPage() {
  return (
    <div
      style={{
        background: "var(--header-bg, #0f172a)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8)",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
        {/* Logo */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
            width: 64,
            height: 64,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-6)",
            fontSize: 20,
            color: "#fff",
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
          }}
        >
          PN
        </div>

        {/* Title */}
        <h1
          style={{
            color: "#fff",
            fontSize: "var(--text-2xl)",
            fontWeight: 800,
            marginBottom: "var(--space-3)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          PickleNickAI
        </h1>
        <p
          style={{
            color: "var(--muted, #94a3b8)",
            fontSize: "var(--text-base, 15px)",
            marginBottom: "var(--space-8)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Your personal AI teaching assistant for Australian F–6 teachers
        </p>

        {/* Sign in button */}
        <button
          onClick={() => signIn()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-3)",
            width: "100%",
            padding: "var(--space-4) var(--space-6)",
            background: "#fff",
            color: "var(--navy, #1e293b)",
            border: "none",
            borderRadius: "var(--radius-md, 8px)",
            fontSize: "var(--text-base, 15px)",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Enter PickleNickAI
        </button>

        <p
          style={{
            color: "var(--muted, #94a3b8)",
            fontSize: "var(--text-xs, 11px)",
            marginTop: "var(--space-6)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          By continuing, you agree to our privacy policy
        </p>
      </div>
    </div>
  );
}

export default function PickleNickAIPage() {
  const { data: session, status } = useSession();
  const [sessionId, setSessionId] = useState<string>("");
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  useEffect(() => {
    const id = sessionStorage.getItem("picklenickai-session") || crypto.randomUUID();
    sessionStorage.setItem("picklenickai-session", id);
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

  // Re-check profile after onboarding wizard redirects back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarded") === "1") {
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkOnboarding" }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.onboarded) {
            // Teacher is now onboarded — refetch full profile
            fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: sessionStorage.getItem("picklenickai-session") || "", messages: [], checkProfile: true }),
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
              });
            // Clean URL
            window.history.replaceState({}, "", "/picklenickai");
          }
        })
        .catch(() => {});
    }
  }, []);

  // Auth bypassed — go straight to app
  if (status === "loading") {
    return (
      <div
        style={{
          background: "var(--header-bg, #0f172a)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {status === "loading" ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
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
            <p style={{ color: "var(--muted, #94a3b8)", fontSize: "var(--text-sm)" }}>
              Loading PickleNickAI...
            </p>
          </div>
        ) : (
          <SignInPage />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          background: "var(--header-bg, #0f172a)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
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
          <p style={{ color: "var(--muted, #94a3b8)", fontSize: "var(--text-sm)" }}>
            Loading PickleNickAI...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <TeacherOnboarding />;
  }

  return (
    <div
      style={{
        background: "var(--header-bg, #0f172a)",
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
          background: "var(--header-bg, #0f172a)",
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
