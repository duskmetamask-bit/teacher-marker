"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { C, shadows, transition, radius } from "@/lib/design";
import { BadgeRow } from "./Badge";

// ─── Types ────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ac9Codes?: string[];
  aitslStandards?: string[];
  showGuardrail?: boolean;
  savedAsUnit?: boolean;
}

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
}

interface ChatTabProps {
  teacherProfile: TeacherProfile | null;
  sessionId: string;
}

// ─── Unit Parser ──────────────────────────────────────────────────────

function parseUnitFromResponse(
  content: string,
  ac9Codes: string[]
): { title: string; yearLevel: string | null; subject: string | null; ac9Codes: string[]; content: unknown } | null {
  const lines = content.split("\n");

  // Title: first # heading
  let title = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      title = trimmed.slice(2).trim();
      break;
    }
    if (trimmed.startsWith("## ") && !title) {
      title = trimmed.slice(3).trim();
    }
  }
  if (!title) {
    // Fallback: first non-empty line as title
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("-") && !trimmed.startsWith("*") && !trimmed.startsWith("|")) {
        title = trimmed.slice(0, 60);
        break;
      }
    }
  }
  if (!title) return null;

  // Year level: look for "Year N" or "Year N-M" patterns
  const yearMatch = content.match(/\b(Year\s*\d+(?:[-–]\d+)?|Pre-Primary|Foundation)\b/i);
  const yearLevel = yearMatch ? yearMatch[0].replace(/\s+/g, " ") : null;

  // Subject: look for known subject keywords
  const subjectKeywords = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "HPE", "Health", "Languages"];
  let subject: string | null = null;
  for (const kw of subjectKeywords) {
    if (content.includes(kw)) {
      subject = kw === "Health" ? "HPE" : kw;
      break;
    }
  }

  return {
    title,
    yearLevel,
    subject,
    ac9Codes,
    content: { markdown: content },
  };
}

// ─── Suggested Prompts ────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  {
    label: "Year 4 Fractions unit plan",
    prompt: "Give me a complete 8-week unit plan for Year 4 Mathematics on fractions using the WIEP framework. Include all 24 lesson plans, cold/hot tasks, and A-E rubric.",
    icon: "📐",
  },
  {
    label: "Year 3 Narrative rubric",
    prompt: "Build an A-E rubric for Year 3 Narrative Writing. I want criteria for structure, language features, and conventions.",
    icon: "✍️",
  },
  {
    label: "EAL differentiation strategies",
    prompt: "What are the best differentiation strategies for EAL students in a mixed-ability Year 5 classroom? Give specific, actionable techniques.",
    icon: "🌍",
  },
  {
    label: "8-week English unit",
    prompt: "Create an 8-week English unit on persuasive writing for Year 3-4. Include mentor texts, all lesson plans, and an assessment rubric.",
    icon: "📚",
  },
  {
    label: "Feedback on my assessment task",
    prompt: "Review this assessment task and suggest improvements: Year 4 students create an informative text about a local ecosystem, 45 minutes.",
    icon: "🔍",
  },
];

// ─── Markdown Renderer ────────────────────────────────────────────────

function applyInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: C.text }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} style={{ color: C.text2 }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            background: C.surface2,
            color: C.accent,
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: "0.88em",
            fontFamily: "monospace",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableLines: string[] = [];

  const flushTable = () => {
    if (tableLines.length === 0) return;
    const rows = tableLines.filter((l) => l.trim() && !l.startsWith("---"));
    if (rows.length > 1) {
      const headers = rows[0].split("|").filter((c) => c.trim());
      const dataRows = rows.slice(2).filter((r) => r.trim());
      elements.push(
        <div key={`table-${elements.length}`} style={{ overflowX: "auto", margin: "8px 0" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              borderRadius: radius.md,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: C.surface2 }}>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      color: C.accent,
                      padding: "8px 12px",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: 12,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : C.surface }}>
                  {row.split("|").filter((c) => c.trim()).map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        color: C.text2,
                        padding: "8px 12px",
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 13,
                      }}
                    >
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableLines = [];
    inTable = false;
  };

  lines.forEach((line, i) => {
    if (line.startsWith("|") && line.includes("---")) {
      inTable = true;
      tableLines.push(line);
      return;
    }
    if (line.startsWith("|") && line.trim().endsWith("|")) {
      if (!inTable && tableLines.length > 0) flushTable();
      inTable = true;
      tableLines.push(line);
      return;
    }
    if (inTable) {
      tableLines.push(line);
      if (line.trim() === "" || (!line.startsWith("|") && !line.includes("|"))) {
        flushTable();
      }
      return;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <p
          key={i}
          style={{
            color: C.accent,
            fontWeight: 700,
            marginTop: 14,
            marginBottom: 4,
            fontSize: 14,
          }}
        >
          {applyInline(line.slice(4))}
        </p>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <p
          key={i}
          style={{
            color: C.text,
            fontWeight: 800,
            marginTop: 16,
            marginBottom: 4,
            fontSize: 15,
          }}
        >
          {applyInline(line.slice(3))}
        </p>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <p
          key={i}
          style={{
            color: C.text,
            fontWeight: 900,
            marginTop: 18,
            marginBottom: 6,
            fontSize: 16,
          }}
        >
          {applyInline(line.slice(2))}
        </p>
      );
    } else if (line.startsWith("---")) {
      elements.push(
        <hr key={i} style={{ borderColor: C.border, margin: "12px 0", opacity: 0.5 }} />
      );
    } else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const content = line.replace(/^[-*\u2022] /, "");
      elements.push(
        <p
          key={i}
          style={{ color: C.text2, margin: "3px 0", paddingLeft: 16, fontSize: 13, lineHeight: 1.6 }}
        >
          <span style={{ color: C.accent, marginRight: 8 }}>&#8226;</span>
          {applyInline(content)}
        </p>
      );
    } else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)/);
      if (match) {
        elements.push(
          <p
            key={i}
            style={{ color: C.text2, margin: "3px 0", paddingLeft: 16, fontSize: 13, lineHeight: 1.6 }}
          >
            <span style={{ color: C.primary, fontWeight: 700, marginRight: 6 }}>{match[1]}.</span>
            {applyInline(match[2])}
          </p>
        );
      }
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      elements.push(
        <p
          key={i}
          style={{ color: C.text2, margin: "3px 0", fontSize: 13, lineHeight: 1.7 }}
        >
          {applyInline(line)}
        </p>
      );
    }
  });

  if (inTable) flushTable();
  return <>{elements}</>;
}

// ─── Streaming Markdown ──────────────────────────────────────────────

function renderMarkdownStream(text: string): { __html: string } {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  let html = escaped.replace(/\*\*([^*]*)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]*)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, '<code style="background:#1c1f35;color:#22d3ee;padding:1px 5px;border-radius:4px;font-size:0.88em;font-family:monospace">$1</code>');
  html = html.replace(/\n/g, "<br/>");

  return { __html: html };
}

// ─── Typing Indicator ───────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        gap: 5,
        padding: "14px 16px",
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C.text3,
            animation: `chatbounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes chatbounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Streaming Div ───────────────────────────────────────────────────

function StreamingDiv({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && isStreaming) {
      ref.current.innerHTML = renderMarkdownStream(content).__html;
    }
  }, [content, isStreaming]);

  if (!isStreaming) {
    return <>{renderMarkdown(content)}</>;
  }

  return (
    <div ref={ref} style={{ color: C.text2 }} />
  );
}

// ─── Toast ─────────────────────────────────────────────────────────

function Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        background: C.success,
        color: "#fff",
        padding: "10px 20px",
        borderRadius: radius.full,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: shadows.md,
        zIndex: 100,
        animation: "fadeUp 0.3s ease-out",
      }}
    >
      {message}
    </div>
  );
}

// ─── Save as Unit Button ────────────────────────────────────────────

function SaveAsUnitButton({
  messageId,
  content,
  ac9Codes,
  onSave,
  saved,
}: {
  messageId: string;
  content: string;
  ac9Codes: string[];
  onSave: (unitId: string) => void;
  saved: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const unitData = parseUnitFromResponse(content, ac9Codes);
      if (!unitData) {
        alert("Could not parse a unit from this response. Make sure it has a heading and subject/year level.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Save failed");
      }
      const data = await res.json();
      onSave(data.unit.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save unit");
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: `${C.success}20`,
          color: C.success,
          border: `1px solid ${C.success}50`,
          borderRadius: radius.sm,
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Saved
      </div>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      style={{
        background: C.surface2,
        color: C.primary,
        border: `1px solid ${C.border}`,
        borderRadius: radius.sm,
        padding: "4px 10px",
        fontSize: 11,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        transition: "all 0.15s ease",
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = `${C.primary}15`;
          e.currentTarget.style.borderColor = C.primary;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = C.surface2;
        e.currentTarget.style.borderColor = C.border;
      }}
    >
      {loading ? (
        "Saving..."
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v9M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Save as Unit
        </>
      )}
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────

function MessageBubble({
  message,
  isStreaming = false,
  onSaveAsUnit,
  savedUnitId,
}: {
  message: Message;
  isStreaming?: boolean;
  onSaveAsUnit: (messageId: string, unitId: string) => void;
  savedUnitId: string | null;
}) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        animation: "msgFadeIn 0.25s ease-out",
      }}
    >
      <style>{`
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes streamGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(99,102,241,0.15), 0 4px 16px rgba(99,102,241,0.1); }
          50% { box-shadow: 0 0 0 2px rgba(99,102,241,0.3), 0 4px 20px rgba(99,102,241,0.2); }
        }
      `}</style>
      <div
        style={{
          maxWidth: "82%",
          background: isUser
            ? "linear-gradient(135deg, #6366f1, #818cf8)"
            : C.surface,
          border: isUser ? "none" : `1px solid ${C.border}`,
          borderRadius: isUser ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
          padding: "12px 16px",
          boxShadow: isUser
            ? "0 4px 16px rgba(99,102,241,0.25)"
            : isStreaming
              ? undefined
              : shadows.md,
          color: isUser ? "#fff" : C.text,
          fontSize: 14,
          lineHeight: 1.65,
          wordBreak: "break-word",
          animation: isStreaming ? "streamGlow 2s ease-in-out infinite" : "none",
        }}
      >
        {isUser ? (
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
        ) : (
          <StreamingDiv content={message.content} isStreaming={isStreaming} />
        )}

        {/* Save as Unit button — shown after streaming completes */}
        {!isUser && !isStreaming && message.content.length > 50 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
            <SaveAsUnitButton
              messageId={message.id}
              content={message.content}
              ac9Codes={message.ac9Codes ?? []}
              onSave={(unitId) => onSaveAsUnit(message.id, unitId)}
              saved={savedUnitId === message.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export default function ChatTab({ teacherProfile, sessionId }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [ac9Codes, setAc9Codes] = useState<string[]>([]);
  const [savedUnitIds, setSavedUnitIds] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ visible: false, message: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);

  // ── Restore history from DB ──────────────────────────────────────
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/generations");
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        const gens = data.generations ?? [];

        if (gens.length === 0) {
          setWelcomeMessage();
          return;
        }

        // Build messages from generations
        const msgs: Message[] = [];
        for (const gen of gens) {
          if (gen.type === "user") {
            msgs.push({
              id: gen.id,
              role: "user",
              content: gen.prompt,
            });
          } else if (gen.type === "assistant" && gen.output) {
            msgs.push({
              id: gen.id,
              role: "assistant",
              content: gen.output,
              ac9Codes: gen.ac9Codes ?? [],
            });
          }
        }

        if (msgs.length === 0) {
          setWelcomeMessage();
          return;
        }

        setMessages(msgs);
      } catch {
        setWelcomeMessage();
      }
    }

    function setWelcomeMessage() {
      if (teacherProfile?.name) {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Hi ${teacherProfile.name}! I'm PickleNickAI, your expert teaching assistant.\n\nI know you teach ${teacherProfile.yearLevels.join(", ")} and cover ${teacherProfile.subjects.join(", ")}.\n\nI have deep knowledge of the Australian Curriculum v9, WA context, AITSL standards, and evidence-based teaching methodologies. Ask me for:\n- Complete unit plans\n- Lesson plans (WIEP, 5E, Direct Instruction, Inquiry)\n- A-E rubrics and assessment design\n- Differentiation for EAL, gifted, and students with adjustments\n- Curriculum mapping and AC9 codes\n\nWhat can I help you with today?`,
          },
        ]);
      } else {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Hi! I'm PickleNickAI, your expert teaching assistant for Australian schools.\n\nI know the Australian Curriculum v9 inside-out, WA and eastern-states context, AITSL standards, and evidence-based teaching methodologies. Ask me for anything — unit plans, lesson plans, rubrics, differentiation strategies, or curriculum advice.\n\nWhat are you working on today?",
          },
        ]);
      }
    }

    loadHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  function showToast(message: string) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }

  function handleSaveAsUnit(messageId: string, unitId: string) {
    setSavedUnitIds((prev) => ({ ...prev, [messageId]: unitId }));
    showToast("Unit saved to library ✓");
  }

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || loading) return;

      setAc9Codes([]);

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);
      isStreamingRef.current = true;

      // Save user message to DB
      await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "user", prompt: text }),
      }).catch(() => {});

      // Add placeholder for streaming response
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", ac9Codes: [], aitslStandards: [], showGuardrail: false }]);
      setStreamingContent("");

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
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

                  // Token — server sends {stage: "thinking", content: "..."}
                  if (parsed.stage === "thinking" && typeof parsed.content === "string") {
                    fullResponse += parsed.content;
                    setStreamingContent(fullResponse);
                    setMessages((prev) => {
                      const updated = [...prev];
                      const idx = updated.findIndex((m) => m.id === assistantId);
                      if (idx !== -1) {
                        updated[idx] = { ...updated[idx], content: fullResponse };
                      }
                      return updated;
                    });
                  }

                  // AC9 codes — server sends {stage: "done", ac9_codes: [...]}
                  if (parsed.stage === "done" && Array.isArray(parsed.ac9_codes)) {
                    setAc9Codes((prev) => [...new Set([...prev, ...parsed.ac9_codes])]);
                    setMessages((prev) => {
                      const updated = [...prev];
                      const idx = updated.findIndex((m) => m.id === assistantId);
                      if (idx !== -1) {
                        updated[idx] = { ...updated[idx], ac9Codes: [...new Set([...(updated[idx].ac9Codes || []), ...parsed.ac9_codes])] };
                      }
                      return updated;
                    });
                  }

                  // Done — server sends {stage: "done", content: "", ac9_codes: [...]}
                  if (parsed.stage === "done") {
                    isStreamingRef.current = false;
                    setStreamingContent("");

                    // Save assistant response to DB
                    const finalCodes = Array.isArray(parsed.ac9_codes) ? parsed.ac9_codes : [];
                    await fetch("/api/generations", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "assistant", prompt: text, output: fullResponse, ac9Codes: finalCodes }),
                    }).catch(() => {});

                    setMessages((prev) => {
                      const updated = [...prev];
                      const idx = updated.findIndex((m) => m.id === assistantId);
                      if (idx !== -1) {
                        updated[idx] = { ...updated[idx], content: fullResponse, ac9Codes: finalCodes };
                      }
                      return updated;
                    });
                  }
                } catch {}
              }
            }
          }
        }

        isStreamingRef.current = false;
        setStreamingContent("");
        setMessages((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((m) => m.id === assistantId);
          if (idx !== -1 && !updated[idx].content) {
            updated[idx] = { ...updated[idx], content: fullResponse };
          }
          return updated;
        });
      } catch (err) {
        isStreamingRef.current = false;
        setStreamingContent("");

        if (err instanceof Error && err.name === "AbortError") {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Something went wrong: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
            },
          ]);
        }
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [input, loading, messages, sessionId]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    if (teacherProfile?.name) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Hi ${teacherProfile.name}! I'm PickleNickAI, your expert teaching assistant.\n\nI know you teach ${teacherProfile.yearLevels.join(", ")} and cover ${teacherProfile.subjects.join(", ")}.\n\nWhat can I help you with today?`,
        },
      ]);
    } else {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Hi! I'm PickleNickAI, your expert teaching assistant for Australian schools.\n\nAsk me for unit plans, lesson plans, rubrics, differentiation strategies, or curriculum advice.\n\nWhat are you working on today?",
        },
      ]);
    }
  }

  return (
    <div
      style={{
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          background: `linear-gradient(180deg, #1a1f3d 0%, ${C.surface} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "0 24px",
          flexShrink: 0,
          height: 64,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Avatar */}
            <div style={{ position: "relative", width: 42, height: 42, flexShrink: 0 }}>
              <style>{`
                @keyframes avatarGlow {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radius.md + 2,
                  padding: 2,
                  background: "linear-gradient(135deg, #6366f1, #22d3ee, #a855f7, #6366f1)",
                  backgroundSize: "300% 300%",
                  animation: "avatarGlow 4s ease infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radius.md,
                  background: "linear-gradient(135deg, #1a1f3d, #2d3561)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{
                  background: "linear-gradient(135deg, #6366f1, #22d3ee)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 800,
                  fontSize: 15,
                }}>P</span>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1
                  style={{
                    color: C.text,
                    fontSize: 15,
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  PickleNickAI
                </h1>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: C.success,
                    boxShadow: `0 0 6px ${C.success}`,
                  }}
                />
              </div>
              {teacherProfile?.name ? (
                <p style={{ color: C.text3, fontSize: 11, margin: 0, marginTop: 1 }}>
                  {teacherProfile.name} · {teacherProfile.yearLevels.join(", ")}
                </p>
              ) : (
                <p style={{ color: C.text3, fontSize: 11, margin: 0, marginTop: 1 }}>
                  Expert Australian Teaching Assistant
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(92,100,144,0.12)",
                border: "1px solid rgba(92,100,144,0.25)",
                borderRadius: radius.full,
                padding: "4px 10px",
                fontSize: 10,
                color: "#7c8599",
              }}
            >
              <span>🔒</span>
              <span style={{ fontWeight: 500 }}>Private</span>
            </div>
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                style={{
                  background: "transparent",
                  color: C.text3,
                  border: `1px solid ${C.border}`,
                  borderRadius: radius.sm,
                  padding: "6px 12px",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: transition,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C.text;
                  e.currentTarget.style.borderColor = C.border2;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = C.text3;
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Suggested prompts */}
          {messages.length === 1 && !loading && (
            <div style={{ animation: "fadeUp 0.4s ease-out" }}>
              <style>{`
                @keyframes fadeUp {
                  from { opacity: 0; transform: translateY(12px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <p
                  style={{
                    color: C.text3,
                    fontSize: 12,
                    marginBottom: 4,
                    textAlign: "center",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Try asking me to...
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  {SUGGESTED_PROMPTS.map((sp, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(sp.prompt)}
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: radius.full,
                        padding: "8px 16px",
                        color: C.text2,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        boxShadow: shadows.sm,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.primary;
                        e.currentTarget.style.color = C.text;
                        e.currentTarget.style.boxShadow = shadows.glow;
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.color = C.text2;
                        e.currentTarget.style.boxShadow = shadows.sm;
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{sp.icon}</span>
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const isLastAssistant = msg.id === messages[messages.length - 1]?.id;
            return (
              <div key={msg.id}>
                {!isUser && (
                  <div style={{ marginBottom: 8 }}>
                    <BadgeRow
                      ac9Codes={msg.ac9Codes}
                      aitslStandards={msg.aitslStandards}
                      showPrivacy={true}
                      showGuardrail={msg.showGuardrail}
                    />
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isStreaming={isLastAssistant && loading && streamingContent !== ""}
                  onSaveAsUnit={handleSaveAsUnit}
                  savedUnitId={savedUnitIds[msg.id] ?? null}
                />
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && messages[messages.length - 1]?.content === "" && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "18px 18px 18px 6px",
                  boxShadow: shadows.md,
                  padding: "4px 8px",
                }}
              >
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
          padding: "16px 24px 20px",
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: radius.lg,
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              padding: "8px 8px 8px 16px",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = C.primary;
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px rgba(99,102,241,0.12), ${shadows.glow}`;
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for a lesson plan, rubric, unit, or any teaching advice..."
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                color: C.text,
                border: "none",
                padding: "6px 0",
                fontSize: 14,
                resize: "none",
                outline: "none",
                lineHeight: 1.6,
                fontFamily: "inherit",
                maxHeight: 120,
                overflowY: "auto",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background:
                  loading || !input.trim()
                    ? C.surface2
                    : "linear-gradient(135deg, #6366f1, #818cf8)",
                color: loading || !input.trim() ? C.text3 : "#fff",
                border: "none",
                borderRadius: radius.md,
                width: 40,
                height: 40,
                fontSize: 16,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: loading || !input.trim() ? "none" : "0 4px 12px rgba(99,102,241,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #818cf8, #a5b4fc)";
                  e.currentTarget.style.transform = "scale(1.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #6366f1, #818cf8)";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14 2L7 9M14 2l-4 12-3-6-6-3 12-4z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <p
            style={{
              color: C.text3,
              fontSize: 10,
              textAlign: "center",
              margin: "7px 0 0",
              letterSpacing: "0.02em",
            }}
          >
            PickleNickAI can make mistakes. Review important content before using in class.
          </p>
        </div>
      </div>

      {/* ── Toast ── */}
      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}
