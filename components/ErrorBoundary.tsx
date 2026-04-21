"use client";

import { Component, ReactNode } from "react";
import Button from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            background: "#0d0f1a",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "#141627",
              border: "1px solid #f87171",
              borderRadius: 16,
              padding: "32px",
              maxWidth: 400,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(248,113,113,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 24,
              }}
            >
              ⚠️
            </div>
            <h2 style={{ color: "#f87171", fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
              {this.props.title ?? "Something went wrong"}
            </h2>
            <p style={{ color: "#99a3c7", fontSize: 13, margin: "0 0 20px", lineHeight: 1.6 }}>
              This section encountered an error. Try refreshing or return to the chat.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button size="sm" variant="ghost" onClick={() => this.reset()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
