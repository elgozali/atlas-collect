import { Component, type ReactNode } from "react";
import { Button } from "@mui/material";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="empty">
        <h1>Let’s try that again.</h1>
        <p>This page could not be displayed.</p>
        <Button onClick={() => window.location.reload()}>
          Reload the prototype
        </Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
