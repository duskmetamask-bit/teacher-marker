"use client";

import { useState, useRef } from "react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: "uploading" | "done" | "error";
}

export default function AssessmentsTab() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recentFiles: UploadedFile[] = files.length > 0 ? files : [
    { id: "1", name: "Year 4 Narrative Assessment - Term 2.pdf", size: 245000, uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: "done" },
    { id: "2", name: "Science Rubric - Chemical Sciences.pdf", size: 128000, uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(), status: "done" },
  ];

  function handleFile(file: File) {
    setUploading(true);
    setFeedback(null);
    const uploadFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: "uploading",
    };
    setFiles((prev) => [uploadFile, ...prev]);

    setTimeout(() => {
      setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, status: "done" } : f));
      setUploading(false);
      setFeedback({ type: "success", message: `"${file.name}" uploaded successfully.` });
    }, 1500);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text)" }}>Assessments</h2>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: dragOver ? "var(--surface)" : "var(--card)",
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "var(--radius)",
          padding: "2.5rem 2rem",
          textAlign: "center",
          boxShadow: dragOver ? "var(--shadow-md)" : "var(--shadow)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          marginBottom: "1rem",
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 20 }}>
          [ ]
        </div>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>Upload Student Work</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: "1.25rem" }}>Drag and drop or click to upload</div>
        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Select File</Button>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg" onChange={handleFileInput} style={{ display: "none" }} />
      </div>

      {uploading && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow)" }}>
          <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Uploading...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {feedback && (
        <div style={{
          background: feedback.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${feedback.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: feedback.type === "success" ? "var(--success)" : "var(--error)",
          borderRadius: "var(--radius-sm)",
          padding: "0.75rem 1rem",
          fontSize: 13,
          marginBottom: "1rem",
        }}>
          {feedback.message}
        </div>
      )}

      {/* Grading preview */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem", boxShadow: "var(--shadow)", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Rubric Builder</h3>
          <Badge variant="warning">Coming Soon</Badge>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Auto-grading and rubric builder are being developed. Upload student work and get AI-powered feedback soon.</p>
      </div>

      {/* Recent uploads */}
      {recentFiles.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>Recent Uploads</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {recentFiles.map((file) => (
              <div key={file.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.875rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-secondary)" }}>[ ]</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, color: "var(--text)" }}>{file.name}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>{formatSize(file.size)} &middot; {new Date(file.uploadedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button size="sm" variant="secondary">View</Button>
                  <Button size="sm" variant="ghost">Grade</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
