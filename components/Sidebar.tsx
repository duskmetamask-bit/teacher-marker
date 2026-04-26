"use client";

import { useState } from "react";

type TabId = "chat" | "library" | "curriculum" | "frameworks" | "assessments" | "mark" | "admin" | "profile";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: "chat",
    label: "Chat",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M14 8.5c0 2-1.5 3.5-3.5 3.5H5L2 14V4.5C2 2.5 3.5 1 5.5 1h5C12.5 1 14 2.5 14 5v3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "library",
    label: "Library",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M4.5 3V1M11.5 3V1M1.5 7h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "curriculum",
    label: "Curriculum",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "frameworks",
    label: "Frameworks",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.8l-3.6 1.7.7-4L2.2 5.7l4-.6L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "mark",
    label: "Auto-Mark",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M9 1l1.5 3 3.5.5-2.5 2.5.5 3.5L8 8.8l-3.5 1.7.5-3.5L2 4.5l3.5-.5L7 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M2.5 11.5l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "admin",
    label: "Admin",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2.5 14c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 4h8v7a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
];

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const C = {
  bg: "#0d0f1a",
  surface: "#141627",
  surface2: "#1c1f35",
  border: "#2a2d45",
  border2: "#353860",
  text: "#e8eaf6",
  text2: "#99a3c7",
  text3: "#5c6490",
  primary: "#6366f1",
  accent: "#22d3ee",
};

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            PN
          </div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: C.text, letterSpacing: "-0.01em" }}>
              PickleNickAI
            </div>
            <div style={{ fontSize: "0.65rem", color: C.text3, marginTop: 1 }}>
              Australian Teaching AI
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 8 }} />

      {/* Nav */}
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              background: isActive ? `${C.primary}15` : "transparent",
              color: isActive ? C.primary : C.text2,
              border: "none",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? `3px solid ${C.primary}` : "3px solid transparent",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = C.surface;
                e.currentTarget.style.color = C.text;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = C.text2;
              }
            }}
          >
            <span
              style={{
                opacity: isActive ? 1 : 0.7,
                width: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}

      {/* Footer tagline */}
      <div style={{ marginTop: "auto", padding: "20px" }}>
        <p style={{ color: C.text3, fontSize: "0.7rem", margin: 0, lineHeight: 1.5 }}>
          Cut admin. Boost capability.
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        style={{
          width: 240,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "12px 0",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          overflowY: "auto",
          zIndex: 40,
        }}
        className="desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: "none",
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 50,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "8px 10px",
          color: C.text,
          fontSize: 16,
          cursor: "pointer",
        }}
        className="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        {mobileOpen ? "\u00D7" : "\u2630"}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 45,
            backdropFilter: "blur(3px)",
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        style={{
          width: 240,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "12px 0",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          overflowY: "auto",
          zIndex: 46,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.2s ease",
        }}
        className="mobile-sidebar"
      >
        {sidebarContent}
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-sidebar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-sidebar { display: none !important; }
        }
      `}</style>
    </>
  );
}
