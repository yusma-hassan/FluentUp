'use client';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      className="fu-fade-up rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-5 shadow-[var(--shadow)]"
      style={{ background: 'var(--error-light)' }}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2px] border-[var(--navy)]"
          style={{ background: 'var(--coral)' }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--navy)] leading-snug">
            Something went wrong
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="fu-btn-primary mt-4 text-sm px-4 py-2"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}