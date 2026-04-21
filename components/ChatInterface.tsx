"use client";

import { useState, useEffect, useRef } from "react";

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

const SUGGESTED_PROMPTS = [
  { label: "Year 4 Fractions lesson plan", prompt: "Give me a Year 4 Mathematics lesson plan on fractions using the WIEP framework." },
  { label: "Year 3 Narrative writing rubric", prompt: "Build an A-E rubric for Year 3 Narrative Writing assessment." },
  { label: "8-week English unit on narrative", prompt: "Create an 8-week English unit on narrative writing for Year 3-4." },
  { label: "EAL differentiation strategies", prompt: "What are some differentiation strategies for EAL students in a mixed-ability classroom?" },
  { label: "Feedback on this task", prompt: "Give me feedback on this assessment task: Year 4 students write an informative text about their local environment." },
];

function applyInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 700, color: "var(--text)" }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} style={{ color: "var(--text)" }}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("### ")) {
      elements.push(
        <p key={i} style={{ color: "var(--accent)", fontWeight: 700, marginTop: 12, marginBottom: 4, fontSize: 13 }}>
          {applyInline(line.slice(4))}
        </p>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <p key={i} style={{ color: "var(--text)", fontWeight: 800, marginTop: 14, marginBottom: 4, fontSize: 14 }}>
          {applyInline(line.slice(3))}
        </p>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <p key={i} style={{ color: "var(--text)", fontWeight: 900, marginTop: 16, marginBottom: 6, fontSize: 15 }}>
          {applyInline(line.slice(2))}
        </p>
      );
    } else if (line.startsWith("---") || line.startsWith("===")) {
      elements.push(<hr key={i} style={{ borderColor: "var(--border)", marginTop: 8, marginBottom: 8 }} />);
    } else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const content = line.replace(/^[-*•] /, "");
      elements.push(
        <p key={i} style={{ color: "var(--text2)", margin: "2px 0", paddingLeft: 16, fontSize: 13 }}>
          <span style={{ color: "var(--accent)", marginRight: 6 }}>&#8226;</span> {applyInline(content)}
        </p>
      );
    } else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)/);
      if (match) {
        elements.push(
          <p key={i} style={{ color: "var(--text2)", margin: "2px 0", paddingLeft: 16, fontSize: 13 }}>
            <span style={{ color: "var(--primary)", fontWeight: 600, marginRight: 4 }}>{match[1]}.</span> {applyInline(match[2])}
          </p>
        );
      }
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      elements.push(
        <p key={i} style={{ color: "var(--text2)", margin: "2px 0", fontSize: 13, lineHeight: 1.6 }}>
          {applyInline(line)}
        </p>
      );
    }
  });

  return <div>{elements}</div>;
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "10px 14px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--text3)",
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
      <p style={{ color: "var(--text3)", fontSize: 12, marginBottom: 4, textAlign: "center" }}>
        Choose a starting point or ask anything below
      </p>
      {SUGGESTED_PROMPTS.map((sp, i) => (
        <button
          key={i}
          onClick={() => onSelect(sp.prompt)}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "var(--text2)",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
            transition: "all var(--transition)",
            boxShadow: "var(--shadow)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.color = "var(--text)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text2)";
            e.currentTarget.style.boxShadow = "var(--shadow)";
          }}
        >
          {sp.label}
        </button>
      ))}
    </div>
  );
}

const MSGS_KEY = "picklenickai-messages";

export default function ChatInterface({ teacherProfile, sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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
    } catch {}

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

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(MSGS_KEY + sessionId, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed === "[DONE]") break;
                if (typeof parsed === "string") {
                  fullResponse += parsed;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[assistantIndex] = { role: "assistant", content: fullResponse };
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = { role: "assistant", content: fullResponse };
        localStorage.setItem(MSGS_KEY + sessionId, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // keep partial
      } else {
        setMessages((prev) => prev.slice(0, -1));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Something went wrong. Please try again."}` },
        ]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
    }}>
      {/* Header */}
      <header style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
        padding: "12px 24px",
        flexShrink: 0,
        boxShadow: "var(--shadow)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            width: 36,
            height: 36,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}>
            AI
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ color: "var(--text)", fontSize: 16, fontWeight: 800, margin: 0 }}>PickleNickAI</h1>
              {teacherProfile?.name && (
                <span style={{
                  background: "var(--surface)",
                  color: "var(--primary)",
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontWeight: 500,
                }}>
                  {teacherProfile.name}
                </span>
              )}
            </div>
            {(teacherProfile?.yearLevels?.length ?? 0) > 0 && (
              <p style={{ color: "var(--text3)", fontSize: 11, margin: 0, marginTop: 2 }}>
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
                  color: "var(--text3)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 11,
                  cursor: "pointer",
                  transition: "all var(--transition)",
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
                  background: msg.role === "user" ? "var(--primary)" : "var(--card)",
                  border: msg.role === "user" ? "none" : "1px solid var(--border)",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "10px 14px",
                  boxShadow: msg.role === "user" ? "none" : "var(--shadow)",
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
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px 18px 18px 4px", boxShadow: "var(--shadow)" }}>
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        borderTop: "1px solid var(--border)",
        background: "var(--card)",
        padding: "12px 16px",
        flexShrink: 0,
      }}>
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
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              resize: "none",
              outline: "none",
              lineHeight: 1.5,
              transition: "border-color var(--transition)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "var(--border)" : "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              width: 44,
              height: 44,
              fontSize: 16,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all var(--transition)",
            }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) e.currentTarget.style.background = "var(--primary-hover)";
            }}
            onMouseLeave={(e) => {
              if (!loading && input.trim()) e.currentTarget.style.background = "var(--primary)";
            }}
          >
            &#8594;
          </button>
        </div>
        <p style={{ color: "var(--text3)", fontSize: 10, textAlign: "center", margin: "6px 0 0" }}>
          PickleNickAI can make mistakes. Review important content before using in class.
        </p>
      </div>
    </div>
  );
}
