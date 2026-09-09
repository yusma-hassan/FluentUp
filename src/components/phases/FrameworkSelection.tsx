
'use client';

import { useState } from 'react';
import { useChallengeFlow } from '@/components/layout/ChallengeContext';
import { NumberedGrid } from '@/components/ui/NumberedGrid';
import type { Framework } from '@/types';

export function truncateToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + '…';
}

export function FrameworkSelection() {
  const { state, dispatch } = useChallengeFlow();
  const { frameworkSlots, selectedFramework } = state;

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const revealedFramework: Framework | null =
    selectedSlot !== null
      ? (frameworkSlots.find((s) => s.slot === selectedSlot)?.item ?? null)
      : null;

  function handleSelect(slot: number) {
    if (selectedSlot !== null) return;
    const entry = frameworkSlots.find((s) => s.slot === slot);
    if (!entry) return;
    setSelectedSlot(slot);
    dispatch({ type: 'SELECT_FRAMEWORK', framework: entry.item });
  }

  function handleProceed() {
    if (!selectedFramework) return;
    dispatch({ type: 'CONFIRM_FRAMEWORK' });
  }

  return (
    <>
      <section className="framework-screen relative mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-6xl flex-col overflow-hidden px-5 py-10 sm:px-10 sm:py-14">

        {/* ============================================================
            DECORATIVE BACKGROUND
            ============================================================ */}

        {/* Big left zig-zag */}
<svg
  className="framework-zigzag framework-zigzag-left"
  viewBox="0 0 100 700"
  fill="none"
  aria-hidden="true"
>
  <path
    d="M55 0 L15 70 L75 145 L20 220 L80 295 L18 370 L78 445 L20 520 L72 590 L30 700"
    stroke="#D8C9F0"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

        {/* Big right zig-zag */}
<svg
  className="framework-zigzag framework-zigzag-right"
  viewBox="0 0 100 700"
  fill="none"
  aria-hidden="true"
>
  <path
    d="M45 0 L85 70 L25 145 L80 220 L20 295 L82 370 L22 445 L80 520 L28 590 L70 700"
    stroke="#D8C9F0"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>
{/* Big dotted zig-zag - left */}
<svg
  className="framework-dotted-zigzag framework-dotted-zigzag-left"
  viewBox="0 0 100 700"
  fill="none"
  aria-hidden="true"
>
  <path
    d="M55 0 L15 70 L75 145 L20 220 L80 295 L18 370 L78 445 L20 520 L72 590 L30 700"
    stroke="#000"
    strokeWidth="4"
    strokeDasharray="2 12"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

{/* Big dotted zig-zag - right */}
<svg
  className="framework-dotted-zigzag framework-dotted-zigzag-right"
  viewBox="0 0 100 700"
  fill="none"
  aria-hidden="true"
>
  <path
    d="M45 0 L85 70 L25 145 L80 220 L20 295 L82 370 L22 445 L80 520 L28 590 L70 700"
    stroke="#000"
    strokeWidth="4"
    strokeDasharray="2 12"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

        {/* Animated dotted swirl - left */}
<svg
  className="framework-swirl framework-swirl-left"
  viewBox="0 0 180 180"
  fill="none"
  aria-hidden="true"
>
  <path
    className="framework-swirl-path"
    d="M145 35 C100 5 35 20 22 75 C10 125 48 160 94 151 C132 144 151 111 133 84 C119 63 88 62 73 80"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeDasharray="2 9"
    strokeLinecap="round"
  />

  <path
    className="framework-swirl-arrow"
    d="M67 73 L73 80 L66 86"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

        {/* Animated dotted swirl - right */}
<svg
  className="framework-swirl framework-swirl-right"
  viewBox="0 0 180 180"
  fill="none"
  aria-hidden="true"
>
  <path
    className="framework-swirl-path"
    d="M35 145 C80 175 145 160 158 105 C170 55 132 20 86 29 C48 36 29 69 47 96 C61 117 92 118 107 100"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeDasharray="2 9"
    strokeLinecap="round"
  />

  <path
    className="framework-swirl-arrow"
    d="M113 107 L107 100 L114 94"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

        {/* ============================================================
            FLOATING STARS / SPARKLES
            ============================================================ */}

        <span className="framework-sparkle sparkle-1">✦</span>
        <span className="framework-sparkle sparkle-2">✧</span>
        <span className="framework-sparkle sparkle-3">✦</span>
        <span className="framework-sparkle sparkle-4">✧</span>
        <span className="framework-sparkle sparkle-5">✦</span>
        <span className="framework-sparkle sparkle-6">✧</span>

        {/* Small hand-drawn stars */}
        <svg
          className="framework-star star-1"
          viewBox="0 0 60 60"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M30 4 L35 24 L56 30 L35 36 L30 56 L24 36 L4 30 L24 24 Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>

        <svg
          className="framework-star star-2"
          viewBox="0 0 60 60"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M30 5 L34 25 L55 30 L34 35 L30 55 L26 35 L5 30 L26 25 Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>

        {/* Tiny dots */}
        <span className="framework-dot dot-1" />
        <span className="framework-dot dot-2" />
        <span className="framework-dot dot-3" />
        <span className="framework-dot dot-4" />
        <span className="framework-dot dot-5" />
        <span className="framework-dot dot-6" />

        {/* Little plus signs */}
        <span className="framework-plus plus-1">+</span>
        <span className="framework-plus plus-2">+</span>
        <span className="framework-plus plus-3">+</span>
        <span className="framework-plus plus-4">+</span>

        {/* ============================================================
            MAIN CONTENT
            ============================================================ */}

        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-8">

          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--navy)] sm:text-4xl">
              Choose Your Framework
            </h1>

            <p className="text-sm text-[var(--text-secondary)] sm:text-base">
              Pick a number to reveal your communication framework.
            </p>
          </div>

          {/* ==========================================================
              FRAMEWORK CARDS
              ========================================================== */}

          <div className="framework-grid mx-auto w-full max-w-xl">
            <NumberedGrid
              count={frameworkSlots.length}
              onSelect={handleSelect}
              selectedSlot={selectedSlot}
              revealedLabel={null}
              disabled={false}
            />
          </div>

          {/* ==========================================================
              REVEALED FRAMEWORK
              ========================================================== */}

          {revealedFramework && (
            <div
              className="fu-fade-up rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-5 shadow-[var(--shadow)]"
              style={{ background: 'var(--teal)' }}
            >
              <h2 className="mb-1 text-lg font-extrabold text-white">
                {revealedFramework.name}
              </h2>

              <p className="text-sm leading-relaxed text-white/90">
                {truncateToWords(revealedFramework.description, 40)}
              </p>
            </div>
          )}

          {/* ==========================================================
              CONTINUE
              ========================================================== */}

          <div className="flex justify-center pt-1 sm:justify-end">
            <button
              type="button"
              onClick={handleProceed}
              disabled={!selectedFramework}
              className="fu-btn-primary w-full sm:w-auto"
            >
              Continue →
            </button>
          </div>

        </div>
      </section>

      {/* ==============================================================
          DECORATION + CARD STYLES
          ============================================================== */}

      <style jsx global>{`
        /* ------------------------------------------------------------
           SCREEN
           ------------------------------------------------------------ */

        .framework-screen {
          color: #000;
           background: #F5F0E8;
        }

        /* ------------------------------------------------------------
           ZIG-ZAGS
           ------------------------------------------------------------ */

        .framework-zigzag {
          position: absolute;
          width: 100px;
          height: 700px;
          color: #000;
          opacity: 0.85;
          pointer-events: none;
          z-index: 1;
        }
          /* ------------------------------------------------------------
   DOTTED ZIG-ZAGS
   ------------------------------------------------------------ */

.framework-dotted-zigzag {
  position: absolute;
  width: 100px;
  height: 700px;
  color: #000;
  opacity: 0.32;
  pointer-events: none;
  z-index: 1;
}

.framework-dotted-zigzag-left {
  left: 8px;
  top: 55px;
}

.framework-dotted-zigzag-right {
  right: 8px;
  top: 95px;
}

        .framework-zigzag-left {
          left: -20px;
          top: 40px;
        }

        .framework-zigzag-right {
          right: -20px;
          top: 80px;
        }

        /* ------------------------------------------------------------
           SWIRLY DOTTED ARROWS
           ------------------------------------------------------------ */

        .framework-swirl {
  position: absolute;
  width: 150px;
  height: 150px;
  color: #000;
  opacity: 0.72;
  pointer-events: none;
  z-index: 2;
}

.framework-swirl-left {
  left: 5%;
  top: 30%;
}

.framework-swirl-right {
  right: 5%;
  top: 58%;
}

/* The dotted trail pulses forward, like an animated flow-chart path */
.framework-swirl-path {
  animation: flowPulse 2.4s linear infinite;
}

.framework-swirl-right .framework-swirl-path {
  animation-delay: -1.2s;
}

.framework-swirl-arrow {
  animation: arrowPulse 2.4s ease-in-out infinite;
}

.framework-swirl-right .framework-swirl-arrow {
  animation-delay: -1.2s;
}

@keyframes flowPulse {
  0% {
    stroke-dashoffset: 0;
    opacity: 0.35;
  }

  35% {
    opacity: 0.95;
  }

  70% {
    opacity: 0.95;
  }

  100% {
    stroke-dashoffset: -44;
    opacity: 0.35;
  }
}

@keyframes arrowPulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.92);
  }

  45%,
  65% {
    opacity: 1;
    transform: scale(1.08);
  }
}

        .framework-swirl-left {
          left: 5%;
          top: 30%;
        }

        .framework-swirl-right {
          right: 5%;
          top: 58%;
          animation-delay: -2.5s;
        }

        @keyframes swirlFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-12px) rotate(5deg);
          }
        }

        /* ------------------------------------------------------------
           SPARKLES
           ------------------------------------------------------------ */

        .framework-sparkle {
          position: absolute;
          z-index: 3;
          color: #000;
          pointer-events: none;
          line-height: 1;
          animation: sparklePulse 2.8s ease-in-out infinite;
        }

        .sparkle-1 {
          left: 13%;
          top: 17%;
          font-size: 30px;
        }

        .sparkle-2 {
          left: 22%;
          top: 68%;
          font-size: 22px;
          animation-delay: -1s;
        }

        .sparkle-3 {
          right: 14%;
          top: 19%;
          font-size: 34px;
          animation-delay: -1.7s;
        }

        .sparkle-4 {
          right: 23%;
          top: 73%;
          font-size: 25px;
          animation-delay: -0.6s;
        }

        .sparkle-5 {
          left: 8%;
          top: 53%;
          font-size: 18px;
          animation-delay: -2s;
        }

        .sparkle-6 {
          right: 8%;
          top: 42%;
          font-size: 19px;
          animation-delay: -1.2s;
        }

        @keyframes sparklePulse {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.8) rotate(0deg);
          }

          50% {
            opacity: 1;
            transform: scale(1.15) rotate(15deg);
          }
        }

        /* ------------------------------------------------------------
           LARGE HAND-DRAWN STARS
           ------------------------------------------------------------ */

        .framework-star {
          position: absolute;
          width: 55px;
          height: 55px;
          color: #000;
          pointer-events: none;
          z-index: 2;
          animation: starDrift 4s ease-in-out infinite;
        }

        .star-1 {
          left: 8%;
          top: 78%;
        }

        .star-2 {
          right: 9%;
          top: 27%;
          width: 45px;
          height: 45px;
          animation-delay: -2s;
        }

        @keyframes starDrift {
          0%,
          100% {
            transform: translateY(0) rotate(-4deg);
          }

          50% {
            transform: translateY(-8px) rotate(5deg);
          }
        }

        /* ------------------------------------------------------------
           DOTS
           ------------------------------------------------------------ */

        .framework-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #000;
          z-index: 2;
          pointer-events: none;
          animation: dotMove 3s ease-in-out infinite;
        }

        .dot-1 {
          left: 18%;
          top: 31%;
        }

        .dot-2 {
          left: 29%;
          top: 81%;
          animation-delay: -1s;
        }

        .dot-3 {
          right: 19%;
          top: 34%;
          animation-delay: -2s;
        }

        .dot-4 {
          right: 29%;
          top: 82%;
          animation-delay: -0.5s;
        }

        .dot-5 {
          left: 6%;
          top: 43%;
          width: 4px;
          height: 4px;
        }

        .dot-6 {
          right: 6%;
          top: 65%;
          width: 4px;
          height: 4px;
        }

        @keyframes dotMove {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        /* ------------------------------------------------------------
           PLUS SIGNS
           ------------------------------------------------------------ */

        .framework-plus {
          position: absolute;
          z-index: 2;
          color: #000;
          font-size: 25px;
          font-weight: 500;
          pointer-events: none;
          animation: plusFloat 3.5s ease-in-out infinite;
        }

        .plus-1 {
          left: 17%;
          top: 48%;
        }

        .plus-2 {
          left: 31%;
          top: 20%;
          animation-delay: -1s;
        }

        .plus-3 {
          right: 17%;
          top: 50%;
          animation-delay: -2s;
        }

        .plus-4 {
          right: 30%;
          top: 21%;
          animation-delay: -0.5s;
        }

        @keyframes plusFloat {
          0%,
          100% {
            opacity: 0.45;
            transform: translateY(0) rotate(0deg);
          }

          50% {
            opacity: 1;
            transform: translateY(-5px) rotate(8deg);
          }
        }




        /* ------------------------------------------------------------
           FRAMEWORK CARDS
           
           These selectors style the existing NumberedGrid buttons.
           No NumberedGrid logic is changed.
           ------------------------------------------------------------ */

           
        .framework-grid button {
          position: relative;
          width:100%;
          min-height: 125px;
          min-width: 0;
          border: 2.5px solid #000 !important;
          border-radius: 18px !important;
        
          color: #000 !important;
          
          box-shadow: 6px 6px 0 #000 !important;
          font-size: 22px !important;
          font-weight: 800 !important;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            background 180ms ease;
        }
            /* Bright playful card colors */
.framework-grid button:nth-child(1) {
  background: #FFD166 !important;
}

.framework-grid button:nth-child(2) {
  background: #FF8FA3 !important;
}

.framework-grid button:nth-child(3) {
  background: #7BDFF2 !important;
}

.framework-grid button:nth-child(4) {
  background: #B8E986 !important;
}

.framework-grid button:nth-child(5) {
  background: #CDB4DB !important;
}

.framework-grid button:nth-child(6) {
  background: #FFB997 !important;
}

.framework-grid button:nth-child(7) {
  background: #A0E7E5 !important;
}

.framework-grid button:nth-child(8) {
  background: #F7A072 !important;
}

        .framework-grid button:hover:not(:disabled) {
          transform: translate(-3px, -3px) rotate(-1deg);
          box-shadow: 9px 9px 0 #000 !important;
          filter:brightness(1.08) saturate(1.08);
        }

        .framework-grid button:active:not(:disabled) {
          transform: translate(3px, 3px);
          box-shadow: 3px 3px 0 #000 !important;
        }

        /* Selected card */
        .framework-grid button[aria-selected='true'],
        .framework-grid button[data-selected='true'] {
          background: #ff5c3a !important;
          color: #fff !important;
        }

        /* ------------------------------------------------------------
           MOBILE
           ------------------------------------------------------------ */

        @media (max-width: 640px) {
          .framework-zigzag {
            opacity: 0.1;
          }

          .framework-swirl {
            width: 100px;
            height: 100px;
          }

          .framework-swirl-left {
            left: -15px;
          }

          .framework-swirl-right {
            right: -15px;
          }

          .framework-sparkle {
            transform: scale(0.75);
          }

          .framework-grid button {
            min-height: 100px;
            min-width: 100px;
          }
            .framework-dotted-zigzag {
  opacity: 0.22;
}
        }

        /* ------------------------------------------------------------
           REDUCE MOTION
           ------------------------------------------------------------ */

        @media (prefers-reduced-motion: reduce) {
          .framework-swirl,
          .framework-sparkle,
          .framework-star,
          .framework-dot,
          .framework-plus {
            animation: none !important;
          }

          .framework-grid button {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}