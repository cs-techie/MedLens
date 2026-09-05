"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export function ErrorCard({
  title = "Processing Encountered An Issue",
  message = "The diagnostic report or view could not be rendered due to an unexpected state. Your health data remains safely in volatile client memory and was not compromised.",
  onReset,
}: {
  title?: string;
  message?: string;
  onReset?: () => void;
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-xl shadow-rose-500/5 text-center"
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
        {message}
      </p>
      <div className="flex items-center justify-center gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Stage
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Reload Application
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Clinical ErrorBoundary Exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorCard
          title={this.props.fallbackTitle || "Processing Failed"}
          message={
            this.props.fallbackMessage ||
            (this.state.error?.message
              ? `Report couldn't be processed: ${this.state.error.message}`
              : "Report couldn't be processed.")
          }
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
