'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { FloatingBackground } from '@/components/ui/FloatingBackground';
import { StaticDecorations } from '@/components/ui/StaticDecorations';
import { varFadeUp, varScaleIn, varStagger, EASE_OUT } from '@/lib/motion';
import { SiteNav } from '@/components/layout/SiteNav';

// ── How it works steps ────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Pick a Framework',
    body: 'Choose proven structures like PREP or What–So What–Now What.',
    color: '#FF5C3A',
    textColor: '#FFFFFF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-4 3v-3H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Select Your Topic',
    body: 'AI generates 10 diverse topics tailored to your framework.',
    color: '#F5C518',
    textColor: '#1A1A2E',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2"/>
        <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Prepare & Speak',
    body: 'Use prep time wisely, then record your spoken response.',
    color: '#1A9B8F',
    textColor: '#FFFFFF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/>
        <path d="M7 11a5 5 0 0 0 10 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Get AI Feedback',
    body: 'Detailed score, strengths, and clear suggestions to improve.',
    color: '#7C5CFF',
    textColor: '#FFFFFF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 7.2H22l-6 4.8 2.3 7.2L12 16.8 5.7 21.2 8 14 2 9.2h7.6L12 2z" fill="currentColor"/>
      </svg>
    ),
  },
];

// ── Feature highlights ────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    bg: 'var(--coral)',
    label: 'Voice Recording',
    desc: 'Speak naturally — your browser records directly, no installs needed.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="8" width="3" height="8" rx="1.5" fill="white" />
        <rect x="7" y="5" width="3" height="14" rx="1.5" fill="white" />
        <rect x="12" y="2" width="3" height="20" rx="1.5" fill="white" />
        <rect x="17" y="5" width="3" height="14" rx="1.5" fill="white" />
      </svg>
    ),
    bg: 'var(--teal)',
    label: 'AI Evaluation',
    desc: 'Gemini multimodal AI scores every dimension of your response instantly.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-4 3v-3H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="white" fillOpacity="0.9" />
      </svg>
    ),
    bg: 'var(--purple)',
    label: 'Structured Frameworks',
    desc: 'Practice with PREP, What–So What–Now What, and more proven frameworks.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
        <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bg: 'var(--amber)',
    label: 'Actionable Feedback',
    desc: 'Clear strengths, areas to improve, and a model example response every time.',
  },
];

// ── Animated sound-wave decoration ───────────────────────────────────────────

function SoundWaveDecoration() {
  const heights = [28, 44, 64, 52, 72, 48, 36, 56, 44, 32];
  return (
    <div className="flex items-center gap-[3px]" aria-hidden="true">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: 4, height: h, background: 'var(--coral)', opacity: 0.7 }}
          animate={{ scaleY: [1, 0.35, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Main animated body ────────────────────────────────────────────────────────

export function HomeContent() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[var(--bg-page)]"
     style={{ background: 'var(--bg-page)' }}
    > 
      <FloatingBackground />
      <StaticDecorations />
      <SiteNav />

      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">

        {/* ── Hero ── */}
        <motion.section
          className="pt-16 pb-20 sm:pt-24 sm:pb-28 flex flex-col lg:flex-row items-center gap-14 lg:gap-20"
          variants={varStagger()}
          initial="hidden"
          animate="show"
        >
          {/* Left — headline */}
          <div className="flex flex-col gap-7 flex-1 min-w-0">
            <motion.div variants={varFadeUp} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="fu-badge"
                  style={{ background: 'var(--amber-light)', color: 'var(--mustard)', borderColor: 'var(--amber)' }}
                >
                  AI-powered speaking coach
                </span>
              </div>

              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.0]"
                style={{ color: 'var(--navy)' }}
              >
                Speak with<br />
                <span style={{ color: 'var(--coral)' }}>confidence.</span>
              </h1>

              <p
                className="text-lg sm:text-xl font-medium leading-relaxed max-w-md"
                style={{ color: 'var(--text-secondary)' }}
              >
                Practice real-world communication with structured frameworks.
                Get instant AI feedback on your delivery, clarity, and structure.
              </p>
            </motion.div>

            <motion.div variants={varFadeUp}>
              <SoundWaveDecoration />
            </motion.div>

            <motion.div variants={varFadeUp} className="flex flex-wrap items-center gap-3">
              <Link href="/challenge" className="fu-btn-primary text-base px-7 py-3.5">
                Start a Challenge →
              </Link>
              <a href="#how-it-works" className="fu-btn-ghost text-sm">
                How it works
              </a>
            </motion.div>

            <motion.div variants={varFadeUp} className="flex flex-wrap gap-2">
              {['Frameworks', 'AI Scoring', 'Instant Feedback'].map((tag) => (
                <span key={tag} className="fu-chip">{tag}</span>
              ))}
            </motion.div>
          </div>

          {/* Right — feature cards stack */}
          <motion.div
            variants={varStagger()}
            className="flex flex-col gap-4 w-full max-w-sm lg:max-w-xs xl:max-w-sm flex-shrink-0"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.label}
                variants={varScaleIn}
                whileHover={{ x: -3, y: -3, boxShadow: '6px 6px 0px #1A1A2E' }}
                className="flex items-center gap-4 rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] px-4 py-3.5 cursor-default"
                style={{ background: f.bg, boxShadow: 'var(--shadow-sm)' }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[2px] border-white/30"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{f.label}</p>
                  <p className="text-xs text-white/85 mt-0.5 leading-snug">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        

{/* ── How it works ── */}
<section id="how-it-works" className="py-20 sm:py-28">
  <motion.div
  initial={{ opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.5, ease: EASE_OUT }}
  className="text-center mb-14"
>
  {/* Small label */}
  <div className="inline-flex items-center gap-2 mb-3">
    <span
      className="px-3 py-1 text-xs font-bold rounded-full border-2 border-[var(--navy)]"
      style={{ background: '#F5C518', color: 'var(--navy)' }}
    >
      Process
    </span>
  </div>

  {/* Main heading */}
  <h2 className="relative inline-block text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--navy)' }}>
    <span className="relative z-10">How it works</span>
    <span
      className="absolute bottom-1 left-0 right-0 h-3 -z-0 opacity-90"
      style={{ background: '#F5C518' }}
    />
  </h2>

  <p className="mt-4 text-base max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
    Four clear steps from choosing a framework to receiving your AI score.
  </p>

  {/* Animated wave – fills the empty space */}
  <div className="mt-8 flex justify-center">
    <SoundWaveDecoration />
  </div>
</motion.div>

  <div className="relative max-w-2xl mx-auto px-4">
    <div className="relative flex flex-col gap-16">

{/* ========== STEP 1 - Left ========== */}
<div className="relative flex justify-start">
  <motion.div
    whileHover={{ x: -4, y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="relative flex items-center"
  >
    {/* Circle Icon */}
    <div
      className="absolute -left-8 z-20 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[var(--navy)] shadow-[3px_3px_0_#1A1A2E]"
      style={{ background: '#FF5C3A' }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M4 4h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-4 3v-3H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"/>
      </svg>
    </div>

    {/* Card */}
    <div
      className="ml-10 rounded-2xl border-[3px] border-[var(--navy)] px-6 py-5 shadow-[4px_4px_0_#1A1A2E] max-w-[280px] cursor-default"
      style={{ background: '#FF5C3A' }}
    >
      <p className="font-extrabold text-white text-lg">Pick a Framework</p>
      <p className="text-white/90 text-sm mt-1">PREP, What-So What-Now What...</p>
    </div>
  </motion.div>
</div>


{/* ========== STEP 2 - Right ========== */}
<div className="relative flex justify-end">
  <motion.div
    whileHover={{ x: -4, y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="relative flex items-center"
  >
    {/* Card */}
    <div
      className="mr-10 rounded-2xl border-[3px] border-[var(--navy)] px-6 py-5 shadow-[4px_4px_0_#1A1A2E] max-w-[280px] cursor-default"
      style={{ background: '#F5C518' }}
    >
      <p className="font-extrabold text-[var(--navy)] text-lg">Select Your Topic</p>
      <p className="text-[var(--navy)]/85 text-sm mt-1">AI generates 10 diverse topics</p>
    </div>

    {/* Circle Icon */}
    <div
      className="absolute -right-8 z-20 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[var(--navy)] shadow-[3px_3px_0_#1A1A2E]"
      style={{ background: '#F5C518' }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2.2">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 8v4l3 2" strokeLinecap="round"/>
      </svg>
    </div>
  </motion.div>
</div>


{/* ========== STEP 3 - Left ========== */}
<div className="relative flex justify-start">
  <motion.div
    whileHover={{ x: -4, y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="relative flex items-center"
  >
    {/* Circle Icon */}
    <div
      className="absolute -left-8 z-20 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[var(--navy)] shadow-[3px_3px_0_#1A1A2E]"
      style={{ background: '#1A9B8F' }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <rect x="9" y="3" width="6" height="11" rx="3"/>
        <path d="M7 11a5 5 0 0 0 10 0" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="12" y1="16" x2="12" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>

    {/* Card */}
    <div
      className="ml-10 rounded-2xl border-[3px] border-[var(--navy)] px-6 py-5 shadow-[4px_4px_0_#1A1A2E] max-w-[280px] cursor-default"
      style={{ background: '#1A9B8F' }}
    >
      <p className="font-extrabold text-white text-lg">Prepare & Speak</p>
      <p className="text-white/90 text-sm mt-1">Record your spoken response</p>
    </div>
  </motion.div>
</div>


{/* ========== STEP 4 - Right ========== */}
<div className="relative flex justify-end">
  <motion.div
    whileHover={{ x: -4, y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="relative flex items-center"
  >
    {/* Card */}
    <div
      className="mr-10 rounded-2xl border-[3px] border-[var(--navy)] px-6 py-5 shadow-[4px_4px_0_#1A1A2E] max-w-[280px] cursor-default"
      style={{ background: '#7C5CFF' }}
    >
      <p className="font-extrabold text-white text-lg">Get AI Feedback</p>
      <p className="text-white/90 text-sm mt-1">Score + clear suggestions</p>
    </div>

    {/* Circle Icon */}
    <div
      className="absolute -right-8 z-20 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[var(--navy)] shadow-[3px_3px_0_#1A1A2E]"
      style={{ background: '#7C5CFF' }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l2.4 7.2H22l-6 4.8 2.3 7.2L12 16.8 5.7 21.2 8 14 2 9.2h7.6L12 2z"/>
      </svg>
    </div>
  </motion.div>
</div>

      {/* ========== YOUR EXISTING ANIMATED DOTTED ARROWS ========== */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 500 600"
        fill="none"
      >
        {/* Arrow 1 → 2 */}
        <path
          d="M180 90 C180 140, 320 140, 320 190"
          stroke="#1A1A2E"
          strokeWidth="2.8"
          strokeDasharray="7 5"
          strokeLinecap="round"
          className="animate-dash"
        />
        <path d="M314 182 L320 192 L326 182" stroke="#1A1A2E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Arrow 2 → 3 */}
        <path
          d="M320 250 C320 300, 180 300, 180 350"
          stroke="#1A1A2E"
          strokeWidth="2.8"
          strokeDasharray="7 5"
          strokeLinecap="round"
          className="animate-dash"
        />
        <path d="M174 342 L180 352 L186 342" stroke="#1A1A2E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Arrow 3 → 4 */}
        <path
          d="M180 410 C180 460, 320 460, 320 510"
          stroke="#1A1A2E"
          strokeWidth="2.8"
          strokeDasharray="7 5"
          strokeLinecap="round"
          className="animate-dash"
        />
        <path d="M314 502 L320 512 L326 502" stroke="#1A1A2E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>
</section>

        {/* ── Bottom CTA banner ── */}
        <motion.section
          className="pb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <div
            className="rounded-[var(--radius-lg)] border-[2.5px] border-[var(--navy)] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ background: 'var(--navy)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Ready to level up your speaking?
              </h3>
              <p className="mt-2 text-white/70 text-sm">
                No account required. Start your first challenge in seconds.
              </p>
            </div>
            <Link
              href="/challenge"
              className="shrink-0 fu-btn-secondary text-base px-8 py-3.5 whitespace-nowrap"
            >
              Start Now →
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}


