'use client';

/**
 * OverviewCards — four stat cards at the top of the dashboard.
 *
 * Purely presentational — receives pre-computed values from the
 * dashboard page Server Component.
 */

import { motion } from 'motion/react';
import { varFadeUp, varStagger } from '@/lib/motion';

interface OverviewCardsProps {
  totalChallenges: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  bg: string;
  textColor?: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, bg, textColor = 'var(--navy)', icon }: StatCardProps) {
  return (
    <motion.div
      variants={varFadeUp}
      whileHover={{ y: -3, boxShadow: '6px 6px 0px #1A1A2E' }}
      className="flex flex-col gap-3 rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-5 cursor-default"
      style={{ background: bg, boxShadow: 'var(--shadow)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: textColor, opacity: 0.7 }}>
          {label}
        </p>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--navy)]/20"
          style={{ background: 'rgba(255,255,255,0.22)' }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-4xl font-extrabold tabular-nums leading-none" style={{ color: textColor }}>
          {value}
        </p>
        {sub && (
          <p className="mt-1 text-xs font-medium" style={{ color: textColor, opacity: 0.65 }}>
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function OverviewCards({
  totalChallenges,
  averageScore,
  bestScore,
  latestScore,
}: OverviewCardsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      variants={varStagger(0.07)}
      initial="hidden"
      animate="show"
    >
      <StatCard
        label="Challenges"
        value={totalChallenges}
        sub="completed total"
        bg="var(--coral)"
        textColor="white"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M4 4h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-4 3v-3H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" />
          </svg>
        }
      />
      <StatCard
        label="Average Score"
        value={averageScore}
        sub="out of 100"
        bg="var(--teal)"
        textColor="white"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="2"  y="10" width="3" height="10" rx="1" fill="white" />
            <rect x="8"  y="6"  width="3" height="14" rx="1" fill="white" />
            <rect x="14" y="2"  width="3" height="18" rx="1" fill="white" />
            <rect x="20" y="6"  width="3" height="14" rx="1" fill="white" />
          </svg>
        }
      />
      <StatCard
        label="Best Score"
        value={bestScore}
        sub="personal best"
        bg="var(--yellow)"
        textColor="var(--navy)"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="var(--navy)" stroke="var(--navy)" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        }
      />
      <StatCard
        label="Latest Score"
        value={latestScore}
        sub="most recent"
        bg="var(--navy)"
        textColor="white"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
            <polyline points="12 6 12 12 16 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        }
      />
    </motion.div>
  );
}
