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

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);

    // Try to load existing profile from Supabase via API
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
      .catch(() => {
        // Supabase not configured or error — proceed without profile (will show onboarding)
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleOnboardingComplete(p: TeacherProfile) {
    // Save profile to Supabase
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveProfile",
          sessionId,
          profile: p,
        }),
      });
    } catch {
      // Silent fail — app still works without persistence
    }
    setProfile(p);
  }

  if (loading) {
    return (
      <div
        style={{ background: "#0d0f1a" }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              width: 56,
              height: 56,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 16px",
            }}
          >
            🤖
          </div>
          <p style={{ color: "#99a3c7" }} className="text-sm animate-pulse">
            Loading PickleNickAI…
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <TeacherOnboarding onComplete={handleOnboardingComplete} />;
  }

  return <ChatInterface teacherProfile={profile} sessionId={sessionId} />;
}
