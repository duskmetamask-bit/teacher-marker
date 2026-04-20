"use client";

import { useState } from "react";

type TabId = "chat" | "plans" | "assessments" | "docs" | "admin" | "profile";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "chat", label: "Chat", icon: "[ ]" },
  { id: "plans", label: "Lesson Plans", icon: "[#]" },
  { id: "assessments", label: "Assessments", icon: "[=]" },
  { id: "docs", label: "Doc Control", icon: "[~]" },
  { id: "admin", label: "Admin Tasks", icon: "[*]" },
  { id: "profile", label: "Profile", icon: "[@]" },
];

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{ padding: "1rem 1.5rem", marginBottom: "0.5rem" }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>
          PickleNickAI
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
          Cut admin. Boost capability.
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: "0.75rem" }} />

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
              gap: "0.75rem",
              padding: "0.7rem 1.5rem",
              background: isActive ? "var(--surface)" : "transparent",
              color: isActive ? "var(--text)" : "var(--text-secondary)",
              border: "none",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.875rem",
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
                e.currentTarget.style.color = "var(--text-secondary)";
              }
            }}
          >
            <span style={{ fontSize: "0.75rem", opacity: 0.6, width: 16, textAlign: "center" }}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
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
        zIndex: 40,
      }} className="desktop-sidebar">
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
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "8px 10px",
          color: "var(--text)",
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
            background: "rgba(0,0,0,0.5)",
            zIndex: 45,
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside style={{
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
        zIndex: 46,
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.2s ease",
      }} className="mobile-sidebar">
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
