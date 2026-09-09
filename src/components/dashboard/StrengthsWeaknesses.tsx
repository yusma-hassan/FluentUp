'use client';

/**
 * StrengthsWeaknesses — aggregates strengths and weaknesses
 * across all stored attempts and displays frequency-ranked lists.
 *
 * Purely presentational — receives pre-computed frequency maps.
 */

import { motion } from 'motion/react';
import { varFadeUp, varStagger } from '@/lib/motion';

export interface FrequencyItem {
  text: string;
  count: number;
}

interface StrengthsWeaknessesProps {
  strengths: FrequencyItem[];
  weaknesses: FrequencyItem[];
}

function FrequencyList({
  items,
  label,
  accentColor,
  labelColor,
  bg,
  bulletColor,
}: {
  items: FrequencyItem[];
  label: string;
  accentColor: string;
  labelColor: string;
  bg: string;
  bulletColor: string;
}) {
  return (
    <motion.div
      variants={varFadeUp}
      className="flex flex-col gap-3 rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-4"
      style={{ background: bg, boxShadow: 'var(--shadow-sm)' }}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: labelColor }}>
        {label}
      </p>

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Not enough data yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map(({ text, count }) => (
            <li key={text} className="flex items-start gap-2">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--navy)]/20 text-[10px] font-bold"
                style={{ background: bulletColor, color: 'white' }}
              >
                {count}
              </span>
              <span className="text-sm leading-snug" style={{ color: 'var(--navy)' }}>
                {text}
              </span>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <p className="text-[10px] font-medium" style={{ color: accentColor, opacity: 0.7 }}>
          Number shows how often this appeared across your challenges.
        </p>
      )}
    </motion.div>
  );
}

export function StrengthsWeaknesses({ strengths, weaknesses }: StrengthsWeaknessesProps) {
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2"
      variants={varStagger(0.1)}
      initial="hidden"
      animate="show"
    >
      <FrequencyList
        items={strengths}
        label="Top Strengths"
        accentColor="var(--teal-dark)"
        labelColor="var(--teal-dark)"
        bg="var(--success-light)"
        bulletColor="var(--teal)"
      />
      <FrequencyList
        items={weaknesses}
        label="Areas to Improve"
        accentColor="var(--error)"
        labelColor="var(--error)"
        bg="var(--error-light)"
        bulletColor="var(--error)"
      />
    </motion.div>
  );
}
