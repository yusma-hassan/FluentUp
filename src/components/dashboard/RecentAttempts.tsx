'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { varFadeUp, varStagger, EASE_OUT } from '@/lib/motion';

/**
 * RecentAttempts — table/card list of the user's most recent challenges.
 */

export interface RecentAttempt {
  id: string;
  frameworkName: string;
  topicText: string;
  overallScore: number;
  completedAt: string; // ISO-8601
}

interface RecentAttemptsProps {
  attempts: RecentAttempt[];
}

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--teal)';
  if (score >= 50) return 'var(--amber)';
  return 'var(--coral)';
}

function scoreBg(score: number): string {
  if (score >= 75) return 'var(--teal-light)';
  if (score >= 50) return 'var(--amber-light)';
  return 'var(--error-light)';
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function truncate(text: string, maxWords = 12): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '…';
}

export function RecentAttempts({ attempts }: RecentAttemptsProps) {
  return (
    <motion.div
      className="fu-card flex flex-col gap-4"
      variants={varFadeUp}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Recent Challenges
        </p>
        <Link
          href="/challenge"
          className="text-xs font-bold hover:underline underline-offset-2"
          style={{ color: 'var(--coral)' }}
        >
          New Challenge →
        </Link>
      </div>

      {attempts.length === 0 ? (
        <p className="py-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          No challenges recorded yet.
        </p>
      ) : (
        <motion.ul
          className="flex flex-col divide-y-2 divide-[var(--grey-200)]"
          variants={varStagger(0.06)}
          initial="hidden"
          animate="show"
        >
          {attempts.map((a) => (
            <motion.li
              key={a.id}
              variants={{
                hidden: { opacity: 0, x: -8 },
                show:   { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE_OUT } },
              }}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              {/* Score badge */}
              <div
                className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[var(--radius-sm)] border-[2px] border-[var(--navy)]"
                style={{ background: scoreBg(a.overallScore) }}
              >
                <span className="text-base font-extrabold tabular-nums leading-none" style={{ color: scoreColor(a.overallScore) }}>
                  {a.overallScore}
                </span>
                <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>/100</span>
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>
                  {truncate(a.topicText)}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full border border-[var(--navy)]/20 px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'var(--grey-100)', color: 'var(--text-muted)' }}
                  >
                    {a.frameworkName}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(a.completedAt)}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </motion.div>
  );
}
