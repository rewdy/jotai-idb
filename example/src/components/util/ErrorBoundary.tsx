import type { ReactNode } from "react";
import React from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  error: Error | null;
}

const RED = "#c31b45";

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error("ErrorBoundary caught:", error);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        this.props.fallback?.(this.state.error) ?? (
          <article style={{ border: `1px solid ${RED}`, padding: "1rem" }}>
            <header>
              <h2 style={{ color: RED, fontSize: "1rem", margin: 0 }}>
                Error boundary caught an error...
              </h2>
            </header>
            <p>The error message is:</p>
            <pre
              style={{ whiteSpace: "pre-wrap", padding: "0.5rem", color: RED }}
            >
              {this.state.error.message}
            </pre>
          </article>
        )
      );
    }

    return this.props.children;
  }
}
