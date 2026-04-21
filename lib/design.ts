// PickleNickAI Design System
// Premium dark-mode AI interface aesthetic

export const C = {
  bg: "#0d0f1a",          // Deep navy — main background
  surface: "#141627",      // Slightly lighter — card backgrounds
  surface2: "#1c1f35",     // Form/section backgrounds
  surface3: "#222440",      // Hover states
  border: "#2a2d45",       // Subtle borders
  border2: "#353860",      // Hover borders
  text: "#e8eaf6",         // Off-white — primary text
  text2: "#99a3c7",        // Muted — secondary text
  text3: "#5c6490",        // Dim — labels, placeholders
  primary: "#6366f1",       // Indigo — primary actions
  primaryHover: "#818cf8",  // Lighter indigo — hover
  accent: "#22d3ee",        // Cyan — highlights, accents
  success: "#34d399",       // Emerald — good scores
  warning: "#fbbf24",       // Amber — medium scores
  danger: "#f87171",        // Red — poor scores, errors
  tag: "#1e2145",           // Tag background
};

// Spacing scale
export const sp = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

// Common shadow styles
export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.3)",
  md: "0 4px 12px rgba(0,0,0,0.35)",
  lg: "0 10px 30px rgba(0,0,0,0.4)",
  glow: "0 0 20px rgba(99,102,241,0.15)",
};

// Transition
export const transition = "all 0.15s ease";

// Subject color mapping (muted, desaturated for dark bg)
export const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Mathematics: { bg: "#1a1f3d", text: "#93c5fd", border: "#1e3a5f" },
  English:      { bg: "#2d1f2d", text: "#f9a8d4", border: "#4a2040" },
  Science:      { bg: "#1a2d1a", text: "#86efac", border: "#1e4a2e" },
  HASS:         { bg: "#2d2a1a", text: "#fcd34d", border: "#4a3d1e" },
  Technologies: { bg: "#1f1a2d", text: "#c4b5fd", border: "#2e2750" },
  "The Arts":   { bg: "#2d1a2d", text: "#f9a8d4", border: "#4a1e4a" },
  "Health & Physical Education": { bg: "#1a2d2a", text: "#6ee7b7", border: "#1e4a3a" },
  Languages:    { bg: "#1a242d", text: "#7dd3fc", border: "#1e3a50" },
};
