'use client';

export function LoadingIndicator({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-20 fu-fade-up">
      <div className="h-12 w-12 rounded-full border-[3px] border-[var(--navy)] border-t-[var(--coral)] animate-spin" />
      <p className="text-sm font-bold text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}