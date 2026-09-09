/**
 * Shared Motion animation variants and transition presets.
 *
 * Motion 13 requires cubic-bezier ease arrays to be typed as
 * [number, number, number, number] — plain number[] is rejected by the
 * Variants index signature. All shared presets are defined here so the
 * correct tuple types are inferred once and re-used everywhere.
 */

import type { Variants, Transition } from 'motion/react';

// ── Easing presets ────────────────────────────────────────────────────────────

/** Standard ease-out curve — smooth deceleration. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Spring-like overshoot — bouncy entrance. */
export const EASE_SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/** Soft spring without full overshoot — score ring / bar fills. */
export const EASE_SOFT_SPRING: [number, number, number, number] = [0.34, 1.2, 0.64, 1];

// ── Transition presets ────────────────────────────────────────────────────────

export const TRANS_FADE_UP: Transition = {
  duration: 0.4,
  ease: EASE_OUT,
};

export const TRANS_SCALE_IN: Transition = {
  duration: 0.4,
  ease: EASE_SPRING,
};

// ── Variant presets ───────────────────────────────────────────────────────────

/** Fade + slide up. Use with stagger parent. */
export const varFadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: TRANS_FADE_UP },
};

/** Fade + scale in with bounce. Use with stagger parent. */
export const varScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show:   { opacity: 1, scale: 1, transition: TRANS_SCALE_IN },
};

/** Stagger container — children inherit hidden/show. */
export const varStagger = (staggerSeconds = 0.08): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: staggerSeconds } },
});

/** Stagger container with delayChildren. */
export const varStaggerDelayed = (staggerSeconds = 0.1, delaySeconds = 0.2): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: staggerSeconds, delayChildren: delaySeconds } },
});

/** fadeUp with custom delay injected via factory — needed for FeedbackScreen sections. */
export const varFadeUpDelayed = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT, delay },
  },
});
