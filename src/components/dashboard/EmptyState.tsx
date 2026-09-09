'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { varFadeUp, varStagger } from '@/lib/motion';

/**
 * Shown on the dashboard when the user has no completed challenges yet.
 */
export function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 py-20 px-4 text-center"
      variants={varStagger(0.1)}
      initial="hidden"
      animate="show"
    >
      {/* Animated icon */}
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.8 },
          show:   { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] } },
        }}
        className="flex h-20 w-20 items-center justify-center rounded-full border-[2.5px] border-[var(--navy)]"
        style={{ background: 'var(--amber-light)', boxShadow: 'var(--shadow)' }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
            fill="var(--amber)"
            stroke="var(--navy)"
            strokeWidth="1.5"
          />
          <path
            d="M19 10v2a7 7 0 0 1-14 0v-2"
            stroke="var(--navy)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <line x1="12" y1="19" x2="12" y2="23" stroke="var(--navy)" strokeWidth="2" strokeLinecap="round" />
          <line x1="8"  y1="23" x2="16" y2="23" stroke="var(--navy)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>

      <motion.div variants={varFadeUp} className="flex flex-col gap-2 max-w-sm">
        <h2 className="text-xl font-extrabold" style={{ color: 'var(--navy)' }}>
          No challenges yet
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Complete your first challenge to start tracking your progress.
          Your scores, strengths, and improvement areas will appear here.
        </p>
      </motion.div>

      <motion.div variants={varFadeUp}>
        <Link href="/challenge" className="fu-btn-primary">
          Start Your First Challenge →
        </Link>
      </motion.div>
    </motion.div>
  );
}
