import type { CategoryScore } from '@/types';

export function ScoreCard({ score }: { score: CategoryScore }) {
  const v = Math.min(100, Math.max(0, score.score));
  const fill = v >= 75 ? 'var(--teal)' : v >= 50 ? 'var(--yellow)' : 'var(--coral)';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--navy)] truncate">{score.label}</span>
        <span className="text-sm font-extrabold tabular-nums" style={{ color: fill }}>
          {v}<span className="text-xs font-medium text-[var(--text-muted)]">/100</span>
        </span>
      </div>
      <div className="fu-score-track">
        <div className="fu-score-fill" style={{ width: `${v}%`, background: fill }} />
      </div>
    </div>
  );
}