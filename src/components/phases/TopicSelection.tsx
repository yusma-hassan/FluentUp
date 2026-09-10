


'use client';

import { useEffect, useRef, useState } from 'react';

import { useChallengeFlow } from '@/components/layout/ChallengeContext';

import { NumberedGrid } from '@/components/ui/NumberedGrid';

import type { GeneratedTopic } from '@/types';

const TOPIC_READ_DELAY_MS = 5000;

export function TopicSelection() {
  const { state, dispatch } = useChallengeFlow();

  const { topicSlots } = state;

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const [revealedTopic, setRevealedTopic] = useState<GeneratedTopic | null>(
    null,
  );

  const dispatched = useRef(false);

  function handleSelect(slot: number) {
    if (selectedSlot !== null) return;

    const entry = topicSlots.find((s) => s.slot === slot);

    if (!entry) return;

    setSelectedSlot(slot);

    setRevealedTopic(entry.item);

    dispatch({ type: 'SELECT_TOPIC', topic: entry.item });
  }

  useEffect(() => {
    if (!revealedTopic || dispatched.current) return;

    const timer = setTimeout(() => {
      dispatched.current = true;

      dispatch({ type: 'CONFIRM_TOPIC' });
    }, TOPIC_READ_DELAY_MS);

    return () => clearTimeout(timer);
  }, [revealedTopic, dispatch]);

  return (
    <>
      <section className="topic-screen relative mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-6xl flex-col overflow-hidden px-5 py-8 sm:px-10 sm:py-12 fu-fade-up">

        {/* ============================================================
            COLORFUL PARTY BANNER
            ============================================================ */}

        {/* <div className="topic-banner" aria-hidden="true">
          <svg
            className="topic-banner-rope-svg"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
          >
            <path
              d="M10 20 C250 20 350 82 600 82 C850 82 950 20 1190 20"
              fill="none"
              stroke="#1a1a2e"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <div className="topic-banner-flag flag-1" />
          <div className="topic-banner-flag flag-2" />
          <div className="topic-banner-flag flag-3" />
          <div className="topic-banner-flag flag-4" />
          <div className="topic-banner-flag flag-5" />
          <div className="topic-banner-flag flag-6" />
          <div className="topic-banner-flag flag-7" />
          <div className="topic-banner-flag flag-8" />
          <div className="topic-banner-flag flag-9" />
          <div className="topic-banner-flag flag-10" />
          <div className="topic-banner-flag flag-11" />
          <div className="topic-banner-flag flag-12" />
        </div> */}

        {/* ============================================================
            GLASS LIGHT BULB
            ============================================================ */}

        {/* <div className="topic-bulb" aria-hidden="true">
          <div className="bulb-glow" />

          <div className="bulb-rays">
            <span className="ray ray-1" />
            <span className="ray ray-2" />
            <span className="ray ray-3" />
            <span className="ray ray-4" />
            <span className="ray ray-5" />
            <span className="ray ray-6" />
            <span className="ray ray-7" />
            <span className="ray ray-8" />
          </div>

          <div className="bulb-glass">
            <div className="bulb-filament">
              <span />
              <span />
            </div>

            <div className="bulb-inner-wire" />
          </div>

          <div className="bulb-neck">
            <span />
            <span />
            <span />
          </div>

          <div className="bulb-base" />
        </div> */}

        {/* ============================================================
            PAPER NOTES
            ============================================================ */}

        <div className="topic-note note-yellow" aria-hidden="true">
          <span>IDEAS</span>
          <div className="note-fold" />
        </div>

        <div className="topic-note note-pink" aria-hidden="true">
          <span>THINK</span>
          <div className="note-fold" />
        </div>

        <div className="topic-note note-blue" aria-hidden="true">
          <span>SPEAK</span>
        </div>

        {/* ============================================================
            LARGE PINNED PAPER
            ============================================================ */}

        <div className="topic-pinned-paper" aria-hidden="true">
          <div className="paper-lines">
            <span />
            <span />
            <span />
          </div>

          <div className="thumbtack">
            <div className="pin-head" />
            <div className="pin-neck" />
            <div className="pin-point" />
          </div>
        </div>

        {/* ============================================================
            PAPER STACK + PAPER CLIP
            ============================================================ */}

        <div className="topic-paper-stack" aria-hidden="true">
          <div className="paper-sheet sheet-back" />
          <div className="paper-sheet sheet-middle" />
          <div className="paper-sheet sheet-front">
            <span />
            <span />
            <span />
          </div>

          <div className="paper-clip">
            <div className="clip-inner" />
          </div>
        </div>

        {/* ============================================================
            BLACK DECORATIVE ELEMENTS
            ============================================================ */}

        {/* Swirly dotted arrow - left */}
        <svg
          className="topic-swirl topic-swirl-left"
          viewBox="0 0 180 180"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="topic-swirl-path"
            d="M145 35 C100 5 35 20 22 75 C10 125 48 160 94 151 C132 144 151 111 133 84 C119 63 88 62 73 80"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="2 9"
            strokeLinecap="round"
          />

          <path
            className="topic-swirl-arrow"
            d="M67 73 L73 80 L66 86"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Swirly dotted arrow - right */}
        <svg
          className="topic-swirl topic-swirl-right"
          viewBox="0 0 180 180"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="topic-swirl-path"
            d="M35 145 C80 175 145 160 158 105 C170 55 132 20 86 29 C48 36 29 69 47 96 C61 117 92 118 107 100"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="2 9"
            strokeLinecap="round"
          />

          <path
            className="topic-swirl-arrow"
            d="M113 107 L107 100 L114 94"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Sparkles */}
        <span className="topic-sparkle sparkle-1">✦</span>
        <span className="topic-sparkle sparkle-2">✧</span>
        <span className="topic-sparkle sparkle-3">✦</span>
        <span className="topic-sparkle sparkle-4">✧</span>
        <span className="topic-sparkle sparkle-5">✦</span>

        {/* Hand-drawn stars */}
        <svg
          className="topic-star topic-star-1"
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
          className="topic-star topic-star-2"
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

        {/* Floating dots */}
        <span className="topic-dot dot-1" />
        <span className="topic-dot dot-2" />
        <span className="topic-dot dot-3" />
        <span className="topic-dot dot-4" />
        <span className="topic-dot dot-5" />

        {/* Plus signs */}
        <span className="topic-plus plus-1">+</span>
        <span className="topic-plus plus-2">+</span>
        <span className="topic-plus plus-3">+</span>

        {/* ============================================================
            LARGE ANIMATED SPRING
            ============================================================ */}

        <div className="topic-spring" aria-hidden="true">
          <svg viewBox="0 0 700 90" fill="none">
            <path
              className="spring-path"
              d="M5 45 C25 45 25 15 45 15 C65 15 65 75 85 75 C105 75 105 15 125 15 C145 15 145 75 165 75 C185 75 185 15 205 15 C225 15 225 75 245 75 C265 75 265 15 285 15 C305 15 305 75 325 75 C345 75 345 15 365 15 C385 15 385 75 405 75 C425 75 425 15 445 15 C465 15 465 75 485 75 C505 75 505 15 525 15 C545 15 545 75 565 75 C585 75 585 15 605 15 C625 15 625 45 695 45"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* ============================================================
            MAIN CONTENT
            ============================================================ */}

        <div className="relative z-20 mx-auto mt-16 flex w-full max-w-2xl flex-col gap-7">

          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--navy)] sm:text-3xl">
  <span className="topic-highlight">Pick a Topic</span>
</h1>

            <p className="text-sm text-[var(--text-secondary)] sm:text-base">
              Choose a number. The challenge begins automatically.
            </p>
          </div>

          {/* ==========================================================
              TOPIC CARDS
              ========================================================== */}

          <div className="framework-grid mx-auto w-full max-w-xl">
            <NumberedGrid
              count={topicSlots.length}
              onSelect={handleSelect}
              selectedSlot={selectedSlot}
              revealedLabel={null}
              disabled={selectedSlot !== null}
            />
          </div>

          {/* ==========================================================
              REVEALED TOPIC
              ========================================================== */}

          {revealedTopic && (
            <div
              className="fu-fade-up rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-5 shadow-[var(--shadow)]"
              style={{ background: 'var(--yellow)' }}
            >
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
                Your topic
              </p>

              <p className="text-base font-bold leading-snug text-[var(--navy)]">
                {revealedTopic.text}
              </p>

              <p className="mt-3 text-xs font-semibold text-[var(--navy)]/70">
                Starting preparation shortly…
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ==============================================================
          TOPIC SCREEN STYLES
          ============================================================== */}

      <style jsx global>{`
        /* ============================================================
           SCREEN
           ============================================================ */

        
        .topic-screen {
  position: relative;
  min-height: calc(100vh - 64px);
  overflow: hidden;
  background: #F7F2E8;
}
  .topic-highlight {
  position: relative;
  display: inline-block;
  z-index: 1;
}

.topic-highlight::before {
  content: '';
  position: absolute;
  z-index: -1;
  left: -7px;
  right: -7px;
  bottom: 2px;
  height: 45%;
  background: #f5c518;
  opacity: 0.75;
  transform: rotate(-1.5deg);
  border-radius: 3px;
}

        // /* ============================================================
        //    PARTY BANNER
        //    ============================================================ */

        // .topic-banner {
        //   position: absolute;
        //   top: 2px;
        //   left: 4%;
        //   right: 4%;
        //   height: 108px;
        //   z-index: 4;
        //   pointer-events: none;
        // }

        // .topic-banner-rope-svg {
        //   position: absolute;
        //   top: 0;
        //   left: 0;
        //   width: 100%;
        //   height: 70px;
        //   overflow: visible;
        // }

        // .topic-banner-flag {
        //   position: absolute;
        //   width: 46px;
        //   height: 58px;
        //   clip-path: polygon(0 0, 100% 0, 50% 100%);
        //   border: 2px solid #1a1a2e;
        //   transform-origin: top center;
        //   animation: flagSway 3.5s ease-in-out infinite;
        // }

        // /*
        //  * The flags follow the same U-shaped curve as the rope.
        //  * This makes the whole banner visually hang instead of
        //  * appearing as a straight horizontal strip.
        //  */

        // .flag-1 {
        //   left: 1%;
        //   top: 14px;
        //   background: #ff5c3a;
        // }

        // .flag-2 {
        //   left: 9%;
        //   top: 16px;
        //   background: #f5c518;
        //   animation-delay: -0.3s;
        // }

        // .flag-3 {
        //   left: 17%;
        //   top: 26px;
        //   background: #7bdff2;
        //   animation-delay: -0.6s;
        // }

        // .flag-4 {
        //   left: 25%;
        //   top: 37px;
        //   background: #b8e986;
        //   animation-delay: -0.9s;
        // }

        // .flag-5 {
        //   left: 33%;
        //   top: 49px;
        //   background: #cdb4db;
        //   animation-delay: -1.2s;
        // }

        // .flag-6 {
        //   left: 41%;
        //   top: 55px;
        //   background: #ffb997;
        //   animation-delay: -1.5s;
        // }

        // .flag-7 {
        //   left: 49%;
        //   top: 55px;
        //   background: #a0e7e5;
        //   animation-delay: -1.8s;
        // }

        // .flag-8 {
        //   left: 57%;
        //   top: 53px;
        //   background: #ff8fa3;
        //   animation-delay: -2.1s;
        // }

        // .flag-9 {
        //   left: 65%;
        //   top: 46.8px;
        //   background: #ffd166;
        //   animation-delay: -2.4s;
        // }

        // .flag-10 {
        //   left: 73%;
        //   top: 34.6px;
        //   background: #caffbf;
        //   animation-delay: -2.7s;
        // }

        // .flag-11 {
        //   left: 81%;
        //   top: 23px;
        //   background: #f7a072;
        //   animation-delay: -3s;
        // }

        // .flag-12 {
        //   left: 89%;
        //   top:16px;
        //   background: #7c5cff;
        //   animation-delay: -3.3s;
        // }

        // @keyframes flagSway {
        //   0%,
        //   100% {
        //     transform: rotate(-2deg);
        //   }

        //   50% {
        //     transform: rotate(2deg);
        //   }
        // }

        // /* ============================================================
        //    GLASS LIGHT BULB
        //    ============================================================ */

        // .topic-bulb {
        //   position: absolute;
        //   z-index: 5;
        //   top: 115px;
        //   right: 7%;
        //   width: 105px;
        //   height: 145px;
        //   pointer-events: none;
        //   animation: bulbFloat 4s ease-in-out infinite;
        // }

        // .bulb-glow {
        //   position: absolute;
        //   top: 0;
        //   left: 4px;
        //   width: 98px;
        //   height: 98px;
        //   border-radius: 50%;
        //   background: rgba(245, 197, 24, 0.3);
        //   filter: blur(16px);
        //   animation: bulbGlow 2s ease-in-out infinite;
        // }

        // .bulb-glass {
        //   position: absolute;
        //   top: 15px;
        //   left: 18px;
        //   width: 69px;
        //   height: 78px;
        //   border: 3px solid rgba(26, 26, 46, 0.5);
        //   border-radius: 52% 52% 48% 48%;
        //   background: rgba(255, 255, 255, 0.34);
        //   backdrop-filter: blur(4px);
        //   box-shadow:
        //     inset 8px 5px 12px rgba(255, 255, 255, 0.7),
        //     0 0 22px rgba(245, 197, 24, 0.4);
        // }

        // .bulb-filament {
        //   position: absolute;
        //   left: 22px;
        //   top: 31px;
        //   width: 24px;
        //   height: 28px;
        //   border-bottom: 3px solid #f5c518;
        //   border-left: 3px solid transparent;
        //   border-right: 3px solid transparent;
        //   transform: rotate(180deg);
        //   filter: drop-shadow(0 0 4px #f5c518);
        // }

        // .bulb-filament span:first-child {
        //   position: absolute;
        //   left: -2px;
        //   top: -7px;
        //   width: 3px;
        //   height: 17px;
        //   background: #f5c518;
        //   transform: rotate(16deg);
        // }

        // .bulb-filament span:last-child {
        //   position: absolute;
        //   right: -2px;
        //   top: -7px;
        //   width: 3px;
        //   height: 17px;
        //   background: #f5c518;
        //   transform: rotate(-16deg);
        // }

        // .bulb-inner-wire {
        //   position: absolute;
        //   left: 32px;
        //   top: 18px;
        //   width: 3px;
        //   height: 47px;
        //   background: rgba(26, 26, 46, 0.45);
        //   border-radius: 5px;
        // }

        // .bulb-neck {
        //   position: absolute;
        //   left: 27px;
        //   top: 86px;
        //   width: 52px;
        //   height: 27px;
        //   border-left: 3px solid #1a1a2e;
        //   border-right: 3px solid #1a1a2e;
        //   background: rgba(255, 255, 255, 0.45);
        //   overflow: hidden;
        // }

        // .bulb-neck span {
        //   display: block;
        //   height: 4px;
        //   margin: 3px 0;
        //   background: #f5c518;
        //   opacity: 0.85;
        // }

        // .bulb-base {
        //   position: absolute;
        //   left: 30px;
        //   top: 111px;
        //   width: 46px;
        //   height: 25px;
        //   border: 3px solid #1a1a2e;
        //   border-radius: 5px 5px 11px 11px;
        //   background: #c9c3b8;
        // }

        // .bulb-rays {
        //   position: absolute;
        //   inset: 0;
        //   animation: raysPulse 2s ease-in-out infinite;
        // }

        // .ray {
        //   position: absolute;
        //   left: 50%;
        //   top: 52px;
        //   width: 20px;
        //   height: 3px;
        //   background: #f5c518;
        //   border-radius: 10px;
        //   transform-origin: 0 50%;
        //   box-shadow: 0 0 7px rgba(245, 197, 24, 0.8);
        // }

        // .ray-1 {
        //   transform: translate(-50%, -50%) rotate(0deg) translateX(57px);
        // }

        // .ray-2 {
        //   transform: translate(-50%, -50%) rotate(45deg) translateX(57px);
        // }

        // .ray-3 {
        //   transform: translate(-50%, -50%) rotate(90deg) translateX(57px);
        // }

        // .ray-4 {
        //   transform: translate(-50%, -50%) rotate(135deg) translateX(57px);
        // }

        // .ray-5 {
        //   transform: translate(-50%, -50%) rotate(180deg) translateX(57px);
        // }

        // .ray-6 {
        //   transform: translate(-50%, -50%) rotate(225deg) translateX(57px);
        // }

        // .ray-7 {
        //   transform: translate(-50%, -50%) rotate(270deg) translateX(57px);
        // }

        // .ray-8 {
        //   transform: translate(-50%, -50%) rotate(315deg) translateX(57px);
        // }

        // @keyframes bulbFloat {
        //   0%,
        //   100% {
        //     transform: translateY(0) rotate(-2deg);
        //   }

        //   50% {
        //     transform: translateY(-8px) rotate(2deg);
        //   }
        // }

        // @keyframes bulbGlow {
        //   0%,
        //   100% {
        //     opacity: 0.45;
        //     transform: scale(0.9);
        //   }

        //   50% {
        //     opacity: 0.9;
        //     transform: scale(1.1);
        //   }
        // }

        // @keyframes raysPulse {
        //   0%,
        //   100% {
        //     opacity: 0.45;
        //     transform: scale(0.95);
        //   }

        //   50% {
        //     opacity: 1;
        //     transform: scale(1.05);
        //   }
        // }

        /* ============================================================
           STICKY NOTES
           ============================================================ */

        .topic-note {
          position: absolute;
          z-index: 6;
          width: 105px;
          height: 95px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #1a1a2e;
          box-shadow: 5px 5px 0 rgba(26, 26, 46, 0.22);
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: #1a1a2e;
          pointer-events: none;
        }

        .note-yellow {
          left: 9%;
          top: 25%;
          background: #ffd166;
          transform: rotate(-7deg);
        }

        .note-pink {
          left: 1%;
          top: 50%;
          background: #ff8fa3;
          transform: rotate(5deg);
        }

        .note-blue {
          right: 4%;
          top: 25%;
          background: #7bdff2;
          transform: rotate(7deg);
        }

        .note-fold {
          position: absolute;
          right: -1px;
          top: -1px;
          width: 25px;
          height: 25px;
          background: #fff;
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          border-left: 2px solid rgba(26, 26, 46, 0.35);
          border-bottom: 2px solid rgba(26, 26, 46, 0.35);
        }

        /* ============================================================
           PINNED PAPER
           ============================================================ */

        .topic-pinned-paper {
          position: absolute;
          z-index: 5;
          right: 1%;
          top: 72%;
          width: 135px;
          height: 115px;
          background: #fffdf5;
          border: 2.5px solid #1a1a2e;
          box-shadow: 6px 6px 0 rgba(26, 26, 46, 0.2);
          transform: rotate(-5deg);
          pointer-events: none;
        }

        .paper-lines {
          position: absolute;
          left: 18px;
          right: 18px;
          top: 55px;
        }

        .paper-lines span {
          display: block;
          height: 2px;
          margin-bottom: 11px;
          background: #c9c3b8;
        }

        .thumbtack {
          position: absolute;
          left: 50%;
          top: -17px;
          width: 36px;
          height: 48px;
          transform: translateX(-50%);
        }

        .pin-head {
          position: absolute;
          top: 0;
          left: 2px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ff5c3a;
          border: 3px solid #1a1a2e;
          box-shadow: 3px 3px 0 #1a1a2e;
        }

        .pin-neck {
          position: absolute;
          left: 15px;
          top: 29px;
          width: 7px;
          height: 11px;
          background: #1a1a2e;
        }

        .pin-point {
          position: absolute;
          left: 12px;
          top: 38px;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 13px solid #1a1a2e;
        }

        /* ============================================================
           PAPER STACK
           ============================================================ */

        .topic-paper-stack {
          position: absolute;
          z-index: 5;
          left: 2%;
          top: 75%;
          width: 150px;
          height: 105px;
          pointer-events: none;
          transform: rotate(-5deg);
        }

        .paper-sheet {
          position: absolute;
          width: 125px;
          height: 82px;
          border: 2px solid #1a1a2e;
          box-shadow: 4px 4px 0 rgba(26, 26, 46, 0.16);
        }

        .sheet-back {
          left: 14px;
          top: 12px;
          background: #cdb4db;
          transform: rotate(8deg);
        }

        .sheet-middle {
          left: 8px;
          top: 6px;
          background: #7bdff2;
          transform: rotate(3deg);
        }

        .sheet-front {
          left: 0;
          top: 0;
          background: #fffdf5;
          padding: 25px 18px 10px;
        }

        .sheet-front span {
          display: block;
          width: 75%;
          height: 2px;
          margin-bottom: 8px;
          background: #9b9488;
        }

        .paper-clip {
          position: absolute;
          right: 7px;
          top: -8px;
          width: 25px;
          height: 65px;
          border: 3px solid #1a1a2e;
          border-radius: 13px;
          transform: rotate(8deg);
        }

        .clip-inner {
          position: absolute;
          left: 5px;
          top: 7px;
          width: 12px;
          height: 55px;
          border-left: 2px solid #1a1a2e;
          border-bottom: 2px solid #1a1a2e;
          border-radius: 0 0 0 8px;
        }

        /* ============================================================
           BLACK SWIRLS
           ============================================================ */

        .topic-swirl {
          position: absolute;
          width: 150px;
          height: 150px;
          z-index: 8;
          color: #000;
          opacity: 0.76;
          pointer-events: none;
        }

        .topic-swirl-left {
          left: 12%;
          top: 35%;
        }

        .topic-swirl-right {
          right: 12%;
          top: 67%;
        }

        .topic-swirl-path {
          animation: topicFlowPulse 2.4s linear infinite;
        }

        .topic-swirl-right .topic-swirl-path {
          animation-delay: -1.2s;
        }

        .topic-swirl-arrow {
          animation: topicArrowPulse 2.4s ease-in-out infinite;
        }

        .topic-swirl-right .topic-swirl-arrow {
          animation-delay: -1.2s;
        }

        @keyframes topicFlowPulse {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.3;
          }

          35% {
            opacity: 1;
          }

          70% {
            opacity: 1;
          }

          100% {
            stroke-dashoffset: -44;
            opacity: 0.3;
          }
        }

        @keyframes topicArrowPulse {
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

        /* ============================================================
           SPARKLES + STARS
           ============================================================ */

        .topic-sparkle {
          position: absolute;
          z-index: 9;
          color: #000;
          pointer-events: none;
          line-height: 1;
          animation: topicSparklePulse 2.8s ease-in-out infinite;
        }

        .sparkle-1 {
          left: 22%;
          top: 25%;
          font-size: 30px;
        }

        .sparkle-2 {
          left: 28%;
          top: 59%;
          font-size: 22px;
          animation-delay: -1s;
        }

        .sparkle-3 {
          right: 23%;
          top: 34%;
          font-size: 34px;
          animation-delay: -1.7s;
        }

        .sparkle-4 {
          right: 27%;
          top: 72%;
          font-size: 25px;
          animation-delay: -0.6s;
        }

        .sparkle-5 {
          left: 13%;
          top: 79%;
          font-size: 18px;
          animation-delay: -2s;
        }

        @keyframes topicSparklePulse {
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

        .topic-star {
          position: absolute;
          width: 55px;
          height: 55px;
          color: #000;
          pointer-events: none;
          z-index: 8;
          animation: topicStarDrift 4s ease-in-out infinite;
        }

        .topic-star-1 {
          left: 9%;
          top: 77%;
        }

        .topic-star-2 {
          right: 10%;
          top: 78%;
          width: 45px;
          height: 45px;
          animation-delay: -2s;
        }

        @keyframes topicStarDrift {
          0%,
          100% {
            transform: translateY(0) rotate(-4deg);
          }

          50% {
            transform: translateY(-8px) rotate(5deg);
          }
        }

        /* ============================================================
           DOTS + PLUS
           ============================================================ */

        .topic-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #000;
          z-index: 8;
          pointer-events: none;
          animation: topicDotMove 3s ease-in-out infinite;
        }

        .dot-1 {
          left: 18%;
          top: 36%;
        }

        .dot-2 {
          left: 30%;
          top: 83%;
          animation-delay: -1s;
        }

        .dot-3 {
          right: 20%;
          top: 50%;
          animation-delay: -2s;
        }

        .dot-4 {
          right: 29%;
          top: 83%;
          animation-delay: -0.5s;
        }

        .dot-5 {
          left: 7%;
          top: 58%;
          width: 4px;
          height: 4px;
        }

        @keyframes topicDotMove {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        .topic-plus {
          position: absolute;
          z-index: 8;
          color: #000;
          font-size: 25px;
          font-weight: 500;
          pointer-events: none;
          animation: topicPlusFloat 3.5s ease-in-out infinite;
        }

        .plus-1 {
          left: 17%;
          top: 46%;
        }

        .plus-2 {
          right: 29%;
          top: 26%;
          animation-delay: -1s;
        }

        .plus-3 {
          right: 18%;
          top: 59%;
          animation-delay: -2s;
        }

        @keyframes topicPlusFloat {
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

        /* ============================================================
           SPRING
           ============================================================ */

        .topic-spring {
          position: absolute;
          z-index: 7;
          left: 50%;
          bottom: 150px;
          width: min(700px, 72%);
          height: 90px;
          color: #000;
          transform: translateX(-50%);
          pointer-events: none;
          animation: springBounce 2.8s ease-in-out infinite;
        }

        .topic-spring svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .spring-path {
          stroke-dasharray: 4 3;
          transform-origin: center;
          animation: springPulse 1.8s ease-in-out infinite;
        }

        @keyframes springPulse {
          0%,
          100% {
            transform: scaleY(0.88);
          }

          50% {
            transform: scaleY(1.12);
          }
        }

        @keyframes springBounce {
          0%,
          100% {
            transform: translateX(-50%) translateY(0);
          }

          50% {
            transform: translateX(-50%) translateY(-5px);
          }
        }

        /* ============================================================
           MOBILE
           ============================================================ */

        @media (max-width: 768px) {
          .topic-banner {
            left: 2%;
            right: 2%;
            transform: scale(0.75);
            transform-origin: top center;
          }

          .topic-banner-flag {
            width: 38px;
            height: 48px;
          }

          .topic-bulb {
            right: 0;
            top: 125px;
            transform: scale(0.7);
            transform-origin: top right;
          }

          .topic-note {
            transform: scale(0.72) rotate(-5deg);
          }

          .note-yellow {
            left: -15px;
          }

          .note-pink {
            left: -15px;
          }

          .note-blue {
            right: -15px;
          }

          .topic-pinned-paper {
            right: -20px;
            top: 65%;
            transform: scale(0.7) rotate(-5deg);
            transform-origin: top right;
          }

          .topic-paper-stack {
            left: -20px;
            top: 74%;
            transform: scale(0.7) rotate(-5deg);
            transform-origin: bottom left;
          }

          .topic-swirl {
            width: 100px;
            height: 100px;
          }

          .topic-swirl-left {
            left: -15px;
          }

          .topic-swirl-right {
            right: -15px;
          }

          .topic-sparkle {
            transform: scale(0.75);
          }

          .topic-star {
            transform: scale(0.7);
          }

          .topic-spring {
            width: 90%;
            height: 65px;
            bottom: 4px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .topic-banner-flag,
          .topic-bulb,
          .bulb-glow,
          .bulb-rays,
          .topic-swirl-path,
          .topic-swirl-arrow,
          .topic-sparkle,
          .topic-star,
          .topic-dot,
          .topic-plus,
          .topic-spring,
          .spring-path {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}