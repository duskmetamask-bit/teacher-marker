"use client";

import { useState } from "react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

interface DocVersion {
  id: string;
  label: string;
  time: string;
  author: string;
  current?: boolean;
}

interface Doc {
  id: string;
  title: string;
  subject: string;
  yearLevel: string;
  versions: DocVersion[];
  aitslBadge: boolean;
}

export default function DocsTab() {
  const [docs, setDocs] = useState<Doc[]>([
    {
      id: "1",
      title: "Lesson Plan - Fractions",
      subject: "Mathematics",
      yearLevel: "Year 4",
      versions: [
        { id: "v3", label: "v3", time: "Just now", author: "You", current: true },
        { id: "v2", label: "v2", time: "1 day ago", author: "You" },
        { id: "v1", label: "v1", time: "3 days ago", author: "You" },
      ],
      aitslBadge: true,
    },
    {
      id: "2",
      title: "Assessment Rubric - English",
      subject: "English",
      yearLevel: "Year 3",
      versions: [
        { id: "v1", label: "v1", time: "3 days ago", author: "You", current: true },
      ],
      aitslBadge: false,
    },
    {
      id: "3",
      title: "Unit Planner - Science",
      subject: "Science",
      yearLevel: "Year 5",
      versions: [
        { id: "v3", label: "v3", time: "1 week ago", author: "You", current: true },
        { id: "v2", label: "v2", time: "2 weeks ago", author: "You" },
        { id: "v1", label: "v1", time: "1 month ago", author: "You" },
      ],
      aitslBadge: true,
    },
  ]);

  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  function handleShare(docId: string) {
    setShareFeedback(`Link copied for "${docs.find(d => d.id === docId)?.title}"`);
    setTimeout(() => setShareFeedback(null), 3000);
  }

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>Doc Control</h2>
        {shareFeedback && (
          <div style={{ color: "var(--success)", fontSize: 13, animation: "fadeIn 0.2s ease-out" }}>{shareFeedback}</div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {docs.map((doc) => (
          <div key={doc.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
            {/* Doc header */}
            <div style={{ padding: "1rem 1.25rem", cursor: "pointer" }} onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    <Badge variant="primary">{doc.subject}</Badge>
                    <Badge>{doc.yearLevel}</Badge>
                    {doc.aitslBadge && <Badge variant="success">AITSL Aligned</Badge>}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{doc.title}</div>
                </div>
                <span style={{ color: "var(--text-secondary)", fontSize: 10, transition: "transform 0.2s ease", transform: expandedDoc === doc.id ? "rotate(180deg)" : "none" }}>&#9660;</span>
              </div>
            </div>

            {/* Expanded: version timeline */}
            {expandedDoc === doc.id && (
              <div style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Version History</h4>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button size="sm" variant="secondary" onClick={() => handleShare(doc.id)}>Share</Button>
                    <Button size="sm" variant="secondary">Export</Button>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {doc.versions.map((version, idx) => (
                    <div key={version.id} style={{ display: "flex", gap: 12, position: "relative" }}>
                      {/* Timeline line */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: version.current ? "var(--primary)" : "var(--border)",
                          border: `2px solid ${version.current ? "var(--primary)" : "var(--border)"}`,
                          flexShrink: 0,
                          marginTop: 2,
                        }} />
                        {idx < doc.versions.length - 1 && (
                          <div style={{ width: 2, flex: 1, minHeight: 24, background: "var(--border)", marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingBottom: idx < doc.versions.length - 1 ? 16 : 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: version.current ? "var(--primary)" : "var(--text)" }}>
                              {version.label}
                              {version.current && <span style={{ fontSize: 10, marginLeft: 6, color: "var(--primary)" }}>Current</span>}
                            </span>
                            <span style={{ color: "var(--text-secondary)", fontSize: 12, marginLeft: 8 }}>{version.author}</span>
                          </div>
                          <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>{version.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
