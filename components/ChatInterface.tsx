"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0d0f1a",
  surface: "#141627",
  surface2: "#1c1f35",
  border: "#2a2d45",
  text: "#e8eaf6",
  text2: "#99a3c7",
  text3: "#5c6490",
  primary: "#6366f1",
  primaryHover: "#818cf8",
  accent: "#22d3ee",
  tag: "#1e2145",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
}

interface ChatInterfaceProps {
  teacherProfile: TeacherProfile | null;
  sessionId: string;
}

// Quick-start prompts shown on empty state
const SUGGESTED_PROMPTS = [
  { label: "Year 4 Fractions lesson plan", prompt: "Give me a Year 4 Mathematics lesson plan on fractions using the WIEP framework." },
  { label: "Year 3 Narrative writing rubric", prompt: "Build an A-E rubric for Year 3 Narrative Writing assessment." },
  { label: "8-week English unit on narrative", prompt: "Create an 8-week English unit on narrative writing for Year 3-4." },
  { label: "EAL differentiation strategies", prompt: "What are some differentiation strategies for EAL students in a mixed-ability classroom?" },
  { label: "Feedback on this task", prompt: "Give me feedback on this assessment task: Year 4 students write an informative text about their local environment." },
];

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("### ")) {
      elements.push(
        <p key={i} style={{ color: C.accent, fontWeight: 700, marginTop: 12, marginBottom: 4, fontSize: 13 }}>
          {applyInline(line.slice(4))}
        </p>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <p key={i} style={{ color: C.text, fontWeight: 800, marginTop: 14, marginBottom: 4, fontSize: 14 }}>
          {applyInline(line.slice(3))}
        </p>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <p key={i} style={{ color: C.text, fontWeight: 900, marginTop: 16, marginBottom: 6, fontSize: 15 }}>
          {applyInline(line.slice(2))}
        </p>
      );
    } else if (line.startsWith("---") || line.startsWith("═══")) {
      elements.push(<hr key={i} style={{ borderColor: C.border, marginTop: 8, marginBottom: 8 }} />);
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <p key={i} style={{ color: C.text2, margin: "2px 0", paddingLeft: 16, fontSize: 13 }}>
          <span style={{ color: C.accent }}>•</span> {applyInline(line.slice(2))}
        </p>
      );
    } else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)/);
      if (match) {
        elements.push(
          <p key={i} style={{ color: C.text2, margin: "2px 0", paddingLeft: 16, fontSize: 13 }}>
            <span style={{ color: C.primaryHover, fontWeight: 600 }}>{match[1]}.</span> {applyInline(match[2])}
          </p>
        );
      }
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      elements.push(
        <p key={i} style={{ color: C.text2, margin: "2px 0", fontSize: 13, lineHeight: 1.6 }}>
          {applyInline(line)}
        </p>
      );
    }
  });

  return <div>{elements}</div>;
}

function applyInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: C.text, fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} style={{ color: C.text }}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "8px 12px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: C.text3,
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "2rem 1rem" }}>
      <p style={{ color: C.text3, fontSize: 12, marginBottom: 4, textAlign: "center" }}>
        Choose a starting point or ask anything below
      </p>
      {SUGGESTED_PROMPTS.map((sp, i) => (
        <button
          key={i}
          onClick={() => onSelect(sp.prompt)}
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            color: C.text2,
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}
        >
          {sp.label}
        </button>
      ))}
    </div>
  );
}

// localStorage keys
const MSGS_KEY = "picklenickai-messages";
const STREAMING_KEY = "picklenickai-streaming";

export default function ChatInterface({ teacherProfile, sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MSGS_KEY + sessionId);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch { /* ignore */ }

    // Default greeting
    if (teacherProfile?.name) {
      setMessages([{
        role: "assistant",
        content: `Hi ${teacherProfile.name}! I'm PickleNickAI, your teaching assistant.\n\nI know you teach ${teacherProfile.yearLevels.join(", ")} and cover ${teacherProfile.subjects.join(", ")}.\n\nWhat can I help you with today?`,
      }]);
    } else {
      setMessages([{
        role: "assistant",
        content: "Hi! I'm PickleNickAI, your teaching assistant. Ask me for lesson plans, rubrics, worksheets, unit planners, or differentiation strategies.",
      }]);
    }
  }, []);

  // Persist messages to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(MSGS_KEY + sessionId, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Handle suggested prompt selection
  async function handleSuggestedPrompt(prompt: string) {
    setInput(prompt);
    await sendMessage(prompt);
  }

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreaming(true);

    // Create assistant message placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    const assistantIndex = newMessages.length;

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          sessionId,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE lines: data: {"content":"..."}
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed === "[DONE]") break;
                if (typeof parsed === "string") {
                  fullResponse += parsed;
                  // Update the last message (assistant) with accumulated content
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[assistantIndex] = { role: "assistant", content: fullResponse };
                    return updated;
                  });
                }
              } catch { /* skip malformed JSON */ }
            }
          }
        }
      }

      // Save final response
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = { role: "assistant", content: fullResponse };
        localStorage.setItem(MSGS_KEY + sessionId, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // User cancelled — keep partial response
      } else {
        // Remove the placeholder message on error
        setMessages((prev) => prev.slice(0, -1));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Something went wrong. Please try again."}` },
        ]);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const isEmpty = messages.length === 0 || (messages.length === 1 && messages[0].role === "assistant" && messages[0].content === "");

  return (
    <div style={{ background: C.bg, display: "flex", flexDirection: "column", height: "100dvh" }}>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(180deg, #1a1f3d 0%, #0d0f1a 100%)",
          borderBottom: `1px solid ${C.border}`,
          padding: "12px 16px",
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 20, color: "#e8eaf6" }}>[ Bot ]</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ color: C.text, fontSize: 16, fontWeight: 800, margin: 0 }}>PickleNickAI</h1>
              {teacherProfile?.name && (
                <span style={{ background: C.tag, color: C.text2, fontSize: 11, padding: "2px 8px", borderRadius: 99 }}>
                  {teacherProfile.name}
                </span>
              )}
            </div>
            {(teacherProfile?.yearLevels?.length ?? 0) > 0 && (
              <p style={{ color: C.text3, fontSize: 11, margin: 0, marginTop: 2 }}>
                {teacherProfile!.yearLevels.join(", ")}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem(MSGS_KEY + sessionId);
                  setMessages([]);
                }}
                style={{
                  background: "transparent",
                  color: C.text3,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Clear chat
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Show suggested prompts on empty state */}
          {messages.length === 0 && !loading && (
            <SuggestedPrompts onSelect={handleSuggestedPrompt} />
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1, #818cf8)"
                    : C.surface2,
                  border: msg.role === "user" ? "none" : `1px solid ${C.border}`,
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "10px 14px",
                }}
              >
                {msg.role === "user" ? (
                  <p style={{ color: "#fff", fontSize: 13, margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                ) : (
                  renderMarkdown(msg.content)
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px" }}>
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ borderTop: `1px solid ${C.border}`, background: C.surface, padding: "12px 16px", flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for a lesson plan, rubric, unit, worksheet… (Enter to send)"
            rows={2}
            style={{
              flex: 1,
              background: C.surface2,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              resize: "none",
              outline: "none",
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? C.primary + "40" : "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              width: 44,
              height: 44,
              fontSize: 18,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? "…" : "➤"}
          </button>
        </div>
        <p style={{ color: C.text3, fontSize: 10, textAlign: "center", margin: "6px 0 0" }}>
          PickleNickAI can make mistakes. Review important content before using in class.
        </p>
      </div>
    </div>
  );
}