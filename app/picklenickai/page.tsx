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
          onClick={() => signIn("google")}
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
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
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

  // NextAuth loading or unauthenticated — show sign in
  if (status === "loading" || (!session && !loading)) {
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
    return <TeacherOnboarding onComplete={handleOnboardingComplete} />;
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
