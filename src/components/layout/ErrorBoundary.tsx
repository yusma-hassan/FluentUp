'use client';

// Requirements: 11.8 (phase error handling), 9.7 (no internal details exposed)
// React error boundaries must be class components — hooks cannot catch render errors.

import React from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches any unhandled render error that escapes the challenge flow.
 * Renders a generic full-page fallback with a "Start Over" link — no raw
 * error details are exposed to the user (Req 9.7).
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    // Update state so next render shows the fallback UI.
    // The actual error object is intentionally not stored or displayed.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log to the console (server logs / browser devtools) without
    // surfacing raw details to the user.
    console.error('[FluentUp] Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="flex flex-col items-center gap-4">
            {/* Generic error icon */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950"
              aria-hidden="true"
            >
              <svg
                className="h-8 w-8 text-red-500 dark:text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              Something went wrong
            </h1>

            <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
              An unexpected error occurred. Your session data has been cleared.
              Starting over will take you back to the beginning.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Start Over
          </Link>
        </main>
      );
    }

    return this.props.children;
  }
}
