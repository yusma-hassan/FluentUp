// 'use client';

// import { useCallback } from 'react';
// import { useChallengeFlow } from '@/components/layout/ChallengeContext';
// import { ErrorMessage } from '@/components/ui/ErrorMessage';
// import { useCountdown } from '@/hooks/useCountdown';

// const ADD_SECONDS = 15;

// export function PreparationPhase() {
//   const { state, dispatch } = useChallengeFlow();
//   const { selectedFramework, selectedTopic } = state;

//   const handlePrepComplete = useCallback(() => {
//     dispatch({ type: 'PREP_COMPLETE' });
//   }, [dispatch]);

//   const { remaining, skip, addTime } = useCountdown(
//     selectedFramework?.preparationTimeSeconds ?? 30,
//     handlePrepComplete,
//   );

//   if (!selectedFramework || !selectedTopic) {
//     return (
//       <section className="mx-auto w-full max-w-lg px-5 py-10">
//         <ErrorMessage
//           message="Challenge details are missing. Please start a new challenge."
//           onRetry={() => dispatch({ type: 'START_NEW_CHALLENGE' })}
//         />
//       </section>
//     );
//   }

//   const total = selectedFramework.preparationTimeSeconds ?? 30;
//   const progress = Math.max(0, Math.min(100, (remaining / total) * 100));
//   const urgent = remaining <= 8;
//   const warning = remaining <= 15;

//   return (
//     <section className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8 sm:py-12 fu-fade-up">
//       <div className="flex flex-col gap-1 text-center">
//         <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--navy)]">
//           Preparation Time
//         </h1>
//         <p className="text-sm text-[var(--text-secondary)]">
//           Get ready. You’ve got this.
//         </p>
//       </div>

//       {/* Circular Timer */}
//       <div className="flex flex-col items-center gap-5">
//         <div className="relative flex h-44 w-44 items-center justify-center">
//           <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
//             <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E1DB" strokeWidth="8" />
//             <circle
//               cx="60"
//               cy="60"
//               r="52"
//               fill="none"
//               stroke={urgent ? 'var(--error)' : warning ? 'var(--warning)' : 'var(--coral)'}
//               strokeWidth="8"
//               strokeLinecap="round"
//               strokeDasharray={`${2 * Math.PI * 52}`}
//               strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
//               className="transition-all duration-1000 linear"
//             />
//           </svg>
//           <div className="relative z-10 flex flex-col items-center">
//             <span className={`fu-timer ${urgent ? 'urgent' : warning ? 'warning' : ''}`}>
//               {remaining}
//             </span>
//             <span className="text-xs font-bold text-[var(--text-muted)] -mt-1">seconds</span>
//           </div>
//         </div>

//         <div className="flex flex-wrap justify-center gap-3">
//           <button type="button" onClick={() => { addTime(ADD_SECONDS); dispatch({ type: 'ADD_PREPARATION_TIME' }); }} className="fu-btn-secondary text-sm">
//             +{ADD_SECONDS}s
//           </button>
//           <button type="button" onClick={skip} className="fu-btn-tertiary text-sm">
//             Skip
//           </button>
//         </div>
//       </div>

//       {/* Topic */}
//       <div
//         className="rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-4 shadow-[var(--shadow)]"
//         style={{ background: 'var(--yellow)' }}
//       >
//         <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--navy)] mb-1">Topic</p>
//         <p className="text-sm font-bold text-[var(--navy)] leading-snug">{selectedTopic.text}</p>
//       </div>

//       {/* Framework steps */}
//       <div
//         className="rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-4 shadow-[var(--shadow)]"
//         style={{ background: 'var(--teal)' }}
//       >
//         <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">
//           {selectedFramework.name}
//         </p>
//         <ol className="space-y-2">
//           {selectedFramework.structuralSteps.map((step, i) => (
//             <li key={i} className="flex gap-2.5 text-sm text-white">
//               <span className="font-bold shrink-0">{i + 1}.</span>
//               <span>{step}</span>
//             </li>
//           ))}
//         </ol>
//       </div>
//     </section>
//   );
// }



'use client';

import { useCallback } from 'react';
import { useChallengeFlow } from '@/components/layout/ChallengeContext';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useCountdown } from '@/hooks/useCountdown';

const ADD_SECONDS = 15;

export function PreparationPhase() {
  const { state, dispatch } = useChallengeFlow();
  const { selectedFramework, selectedTopic } = state;

  const handlePrepComplete = useCallback(() => {
    dispatch({ type: 'PREP_COMPLETE' });
  }, [dispatch]);

  const { remaining, skip, addTime } = useCountdown(
    selectedFramework?.preparationTimeSeconds ?? 30,
    handlePrepComplete,
  );

  if (!selectedFramework || !selectedTopic) {
    return (
      <section className="mx-auto w-full max-w-lg px-5 py-10">
        <ErrorMessage
          message="Challenge details are missing. Please start a new challenge."
          onRetry={() => dispatch({ type: 'START_NEW_CHALLENGE' })}
        />
      </section>
    );
  }

  const total = selectedFramework.preparationTimeSeconds ?? 30;
  const progress = Math.max(0, Math.min(100, (remaining / total) * 100));
  const urgent = remaining <= 8;
  const warning = remaining <= 15;

  return (
    <>
      <style jsx>{`

        /* ============================================================
           MAIN PREPARATION SCREEN
        ============================================================ */

        .prep-screen {
          position: relative;
          min-height: calc(100vh - 64px);
          overflow: hidden;
          background: #f7f2e8;
          isolation: isolate;
        }

        .prep-content {
          position: relative;
          z-index: 10;
          width: min(100%, 700px);
          margin-left: clamp(24px, 8vw, 120px);
          margin-right: 0;
        }


        /* ============================================================
           LARGE RIGHT SIDE PURPLE SHAPE
        ============================================================ */

        .prep-shelf-decoration {
          position: absolute;
          z-index: 0;
          top: 0;
          right: 0;
          width: min(67vw, 1050px);
          height: 100%;
          pointer-events: none;
          overflow: visible;
        }

        .prep-shelf-decoration svg {
          display: block;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .prep-shelf-purple {
          position: absolute;
          inset: 0;
        }

        .prep-shelf-purple path {
          fill: #30203d;
          filter:
            drop-shadow(-18px 18px 26px rgba(48, 32, 61, 0.16));
        }


        /* ============================================================
           QUOTATION ON PURPLE SHAPE
        ============================================================ */

.prep-quote {
  position: absolute;
  z-index: 5;

  top: 7%;
  right: 7%;

  width: min(34vw, 430px);
  height: 86%;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 25px;

  color: #f5c518;

  font-size: clamp(2.5rem, 4.5vw, 4.8rem);
  line-height: 1.35;
  font-weight: 900;
  letter-spacing: -0.025em;

  text-align: center;
}


        /* ============================================================
           ROTATING RINGS
        ============================================================ */

        .prep-ring {
          position: absolute;
          z-index: 3;
          pointer-events: none;
          border: 2px solid rgba(245, 197, 24, 0.82);
          border-radius: 9999px;
          animation: prepRingRotate 18s linear infinite;
          box-shadow:
            0 0 0 1px rgba(245, 197, 24, 0.08),
            0 0 14px rgba(245, 197, 24, 0.16);
        }

        .prep-ring::before,
        .prep-ring::after {
          content: '';
          position: absolute;
          border-radius: 9999px;
          border: 1.5px solid rgba(245, 197, 24, 0.68);
        }

        .prep-ring::before {
          inset: 10%;
        }

        .prep-ring::after {
          inset: 20%;
          border-style: dashed;
          border-color: rgba(245, 197, 24, 0.76);
        }

        .prep-ring-one {
          width: clamp(110px, 14vw, 190px);
          height: clamp(110px, 14vw, 190px);
          top: 18%;
          left: 13%;
        }

        .prep-ring-two {
          width: clamp(140px, 18vw, 240px);
          height: clamp(140px, 18vw, 240px);
          right: 12%;
          bottom: 20%;
          animation-duration: 24s;
          animation-direction: reverse;
        }

        .prep-ring-three {
          width: clamp(75px, 9vw, 125px);
          height: clamp(75px, 9vw, 125px);
          left: 19%;
          bottom: 17%;
          border-style: dashed;
          border-width: 1.5px;
          animation-duration: 14s;
        }


        /* ============================================================
           ROTATING CIRCLES WITH ORBITS
        ============================================================ */

        .prep-orbit {
          position: absolute;
          z-index: 4;
          pointer-events: none;
          border: 2px solid rgba(245, 197, 24, 0.86);
          border-radius: 9999px;
          animation: prepOrbitRotate 15s linear infinite;
          box-shadow:
            0 0 12px rgba(245, 197, 24, 0.15);
        }

        .prep-orbit::before {
          content: '';
          position: absolute;
          width: 11px;
          height: 11px;
          top: 50%;
          left: -6px;
          transform: translateY(-50%);
          border: 2px solid #f5c518;
          border-radius: 9999px;
          background: #f7f2e8;
          box-shadow:
            0 0 8px rgba(245, 197, 24, 0.28);
        }

        .prep-orbit::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          right: 8%;
          top: 12%;
          border-radius: 9999px;
          background: #f5c518;
          box-shadow:
            0 0 8px rgba(245, 197, 24, 0.35);
        }

        .prep-orbit-one {
          width: clamp(70px, 9vw, 115px);
          height: clamp(70px, 9vw, 115px);
          top: 11%;
          right: 25%;
        }

        .prep-orbit-two {
          width: clamp(85px, 11vw, 145px);
          height: clamp(85px, 11vw, 145px);
          left: 7%;
          bottom: 27%;
          animation-duration: 19s;
          animation-direction: reverse;
        }

        .prep-orbit-three {
          width: clamp(65px, 8vw, 105px);
          height: clamp(65px, 8vw, 105px);
          right: 6%;
          bottom: 10%;
          animation-duration: 13s;
        }


        /* ============================================================
           SMALL FLOATING CIRCLES
        ============================================================ */

        .prep-dot {
          position: absolute;
          z-index: 4;
          pointer-events: none;
          border-radius: 9999px;
          border: 2px solid #f5c518;
          animation: prepDotFloat 7s ease-in-out infinite;
          box-shadow:
            0 0 10px rgba(245, 197, 24, 0.25);
        }

        .prep-dot-one {
          width: 18px;
          height: 18px;
          top: 20%;
          left: 31%;
          background: #f5c518;
        }

        .prep-dot-two {
          width: 13px;
          height: 13px;
          top: 32%;
          right: 28%;
          background: #f7f2e8;
          animation-delay: -2s;
        }

        .prep-dot-three {
          width: 15px;
          height: 15px;
          bottom: 22%;
          right: 32%;
          background: #f5c518;
          animation-delay: -4s;
        }


        /* ============================================================
           TIMER
        ============================================================ */

        .prep-timer-wrapper {
          position: relative;
          width: clamp(230px, 34vw, 330px);
          height: clamp(230px, 34vw, 330px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prep-timer-card {
          position: relative;
          width: 76%;
          height: 76%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2.5px solid var(--navy);
          border-radius: 34% 66% 58% 42% / 42% 40% 60% 58%;
          background: var(--yellow);
          box-shadow:
            8px 8px 0 var(--navy),
            14px 14px 28px rgba(26, 26, 46, 0.12);
          animation: prepTimerMorph 8s ease-in-out infinite;
        }

        .prep-progress-ring {
          position: absolute;
          inset: 3%;
          width: 94%;
          height: 94%;
          transform: rotate(-90deg);
          pointer-events: none;
        }

        .prep-timer-number {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .prep-timer-digits {
          font-size: clamp(5rem, 11vw, 8rem) !important;
          line-height: 0.82;
          font-weight: 950;
          letter-spacing: -0.09em;
          color: var(--navy);
          text-shadow:
            4px 4px 0 rgba(255, 255, 255, 0.55),
            7px 7px 0 rgba(26, 26, 46, 0.13);
        }

        .prep-timer-digits.warning {
          color: var(--navy);
        }

        .prep-timer-digits.urgent {
          color: var(--navy);
          animation: prepTimerPulse 0.8s ease-in-out infinite;
        }

        .prep-timer-label {
          margin-top: 10px;
          padding: 4px 9px;
          border: 2px solid var(--navy);
          background: #f7f2e8;
          color: var(--navy);
          font-size: 9px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0.18em;
          box-shadow: 3px 3px 0 var(--navy);
        }


        /* ============================================================
           TIMER DECORATIVE RINGS
        ============================================================ */

        .prep-timer-ring {
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
        }

        .prep-timer-ring-outer {
          width: 100%;
          height: 100%;
          border: 2px dashed rgba(26, 26, 46, 0.25);
          animation: prepTimerOrbit 20s linear infinite;
        }

        .prep-timer-ring-outer::before,
        .prep-timer-ring-outer::after {
          content: '';
          position: absolute;
          width: 13px;
          height: 13px;
          border: 2px solid var(--navy);
          border-radius: 9999px;
          background: #f7f2e8;
        }

        .prep-timer-ring-outer::before {
          top: 8%;
          left: 17%;
        }

        .prep-timer-ring-outer::after {
          right: 11%;
          bottom: 15%;
          background: var(--coral);
        }

        .prep-timer-ring-inner {
          width: 88%;
          height: 88%;
          border: 1.5px solid rgba(26, 26, 46, 0.16);
          animation: prepTimerOrbitReverse 15s linear infinite;
        }

        .prep-timer-ring-inner::before {
          content: '';
          position: absolute;
          width: 9px;
          height: 9px;
          top: 18%;
          right: 10%;
          border-radius: 9999px;
          background: var(--navy);
        }


        /* ============================================================
           TIMER ACCENTS
        ============================================================ */

        .prep-timer-accent {
          position: absolute;
          pointer-events: none;
          border: 2px solid var(--navy);
        }

        .prep-timer-accent-one {
          width: 52px;
          height: 52px;
          top: -18px;
          right: 26px;
          border-radius: 50%;
          background: var(--coral);
          transform: rotate(18deg);
        }

        .prep-timer-accent-two {
          width: 42px;
          height: 42px;
          bottom: -13px;
          left: 30px;
          border-radius: 48% 52% 45% 55%;
          background: #c9b6e4;
          transform: rotate(-16deg);
        }


        /* ============================================================
           FRAMEWORK LIST
           
           The numbers are supplied manually by i + 1.
           Removing the browser's default list markers prevents
           duplicated numbering.
        ============================================================ */

        .prep-steps-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .prep-steps-list li {
          list-style: none;
        }


        /* ============================================================
           ANIMATIONS
        ============================================================ */

        @keyframes prepTimerMorph {
          0%,
          100% {
            border-radius: 34% 66% 58% 42% / 42% 40% 60% 58%;
          }

          50% {
            border-radius: 54% 46% 40% 60% / 54% 58% 42% 46%;
          }
        }

        @keyframes prepTimerOrbit {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes prepTimerOrbitReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes prepTimerPulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.06);
          }
        }

        @keyframes prepRingRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes prepOrbitRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes prepDotFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }
        }


        /* ============================================================
           TABLET
        ============================================================ */

        @media (max-width: 900px) {

          .prep-content {
            width: min(100%, 600px);
            margin-left: clamp(24px, 5vw, 60px);
          }

          .prep-shelf-decoration {
            width: 62vw;
          }

          .prep-ring-two {
            right: 7%;
          }

          .prep-orbit-one {
            right: 16%;
          }

          .prep-quote {
            right: clamp(20px, 4vw, 50px);
            width: min(27vw, 280px);
            font-size: clamp(1.25rem, 2.8vw, 2rem);
          }
        }


        /* ============================================================
           MOBILE
        ============================================================ */

        @media (max-width: 640px) {

          .prep-screen {
            min-height: calc(100vh - 64px);
          }

          .prep-content {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 32px;
            padding-bottom: 40px;
          }

          .prep-shelf-decoration {
            width: 72vw;
            min-width: 250px;
          }

          .prep-quote {
            top: 30%;
            right: 16px;
            width: 43%;
            font-size: clamp(1.05rem, 4.8vw, 1.55rem);
            line-height: 1.05;
          }

          .prep-timer-wrapper {
            width: min(76vw, 300px);
            height: min(76vw, 300px);
          }

          .prep-timer-card {
            box-shadow:
              6px 6px 0 var(--navy),
              10px 10px 22px rgba(26, 26, 46, 0.12);
          }

          .prep-timer-digits {
            font-size: clamp(4.8rem, 23vw, 6.5rem) !important;
          }

          .prep-timer-accent-one {
            width: 42px;
            height: 42px;
            right: 20px;
          }

          .prep-timer-accent-two {
            width: 34px;
            height: 34px;
            left: 22px;
          }

          .prep-ring-one {
            top: 15%;
            left: 3%;
          }

          .prep-ring-two {
            right: -8%;
            bottom: 18%;
          }

          .prep-ring-three {
            left: 5%;
            bottom: 13%;
          }

          .prep-orbit-one {
            right: 7%;
            top: 12%;
          }

          .prep-orbit-two {
            left: -4%;
            bottom: 28%;
          }

          .prep-orbit-three {
            right: -3%;
            bottom: 8%;
          }

          .prep-dot-one {
            left: 18%;
            top: 22%;
          }

          .prep-dot-two {
            right: 16%;
            top: 29%;
          }

          .prep-dot-three {
            right: 19%;
            bottom: 20%;
          }
        }


        /* ============================================================
           SMALL PHONES
        ============================================================ */

        @media (max-width: 380px) {

          .prep-content {
            padding-left: 16px;
            padding-right: 16px;
          }

          .prep-shelf-decoration {
            width: 76vw;
            min-width: 230px;
          }

          .prep-timer-wrapper {
            width: min(78vw, 280px);
            height: min(78vw, 280px);
          }

          .prep-shelf-purple path {
            filter:
              drop-shadow(-10px 12px 18px rgba(48, 32, 61, 0.13));
          }

          .prep-quote {
            right: 12px;
            width: 44%;
            font-size: 1rem;
          }
        }


        /* ============================================================
           REDUCED MOTION
        ============================================================ */

        @media (prefers-reduced-motion: reduce) {

          .prep-ring,
          .prep-orbit,
          .prep-dot,
          .prep-timer-ring-outer,
          .prep-timer-ring-inner,
          .prep-timer-card,
          .prep-timer-digits.urgent {
            animation: none;
          }
        }

      `}</style>

      <section className="prep-screen">

        {/* ==========================================================
            LARGE PURPLE RIGHT SIDE SHAPE
        =========================================================== */}

        <div className="prep-shelf-decoration" aria-hidden="true">

          <div className="prep-shelf-purple">
            <svg
              viewBox="0 0 700 1000"
              preserveAspectRatio="none"
            >
              <path
                d="
                  M 420 0

                  L 700 0
                  L 700 1000
                  L 0 1000

                  L 0 925

                  C 0 875, 35 850, 82 850
                  L 190 850

                  C 238 850, 258 818, 258 780
                  C 258 742, 238 710, 190 710
                  L 115 710

                  C 62 710, 30 680, 30 635
                  C 30 590, 62 560, 115 560
                  L 225 560

                  C 274 560, 298 528, 298 488
                  C 298 448, 274 416, 225 416
                  L 150 416

                  C 97 416, 68 384, 68 340
                  C 68 296, 97 264, 150 264
                  L 265 264

                  C 315 264, 340 232, 340 190
                  C 340 148, 315 116, 265 116
                  L 205 116

                  C 155 116, 132 82, 132 48
                  C 132 18, 145 0, 170 0

                  Z
                "
              />
            </svg>
          </div>

          <div className="prep-quote">
            Words are small,but their impact is not.Choose them wisely.
          </div>

        </div>


        {/* ==========================================================
            ROTATING BACKGROUND DETAILS
        =========================================================== */}

        <div
          className="prep-ring prep-ring-one"
          aria-hidden="true"
        />

        <div
          className="prep-ring prep-ring-two"
          aria-hidden="true"
        />

        <div
          className="prep-ring prep-ring-three"
          aria-hidden="true"
        />

        <div
          className="prep-orbit prep-orbit-one"
          aria-hidden="true"
        />

        <div
          className="prep-orbit prep-orbit-two"
          aria-hidden="true"
        />

        <div
          className="prep-orbit prep-orbit-three"
          aria-hidden="true"
        />

        <div
          className="prep-dot prep-dot-one"
          aria-hidden="true"
        />

        <div
          className="prep-dot prep-dot-two"
          aria-hidden="true"
        />

        <div
          className="prep-dot prep-dot-three"
          aria-hidden="true"
        />


        {/* ==========================================================
            MAIN UI
        =========================================================== */}

        <div className="prep-content mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8 sm:py-12 fu-fade-up">

          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--navy)] sm:text-3xl">
              Preparation Time
            </h1>

            <p className="text-sm text-[var(--text-secondary)]">
              Get ready. You’ve got this.
            </p>
          </div>


          {/* ========================================================
              CIRCULAR TIMER
          ========================================================= */}

          <div className="flex flex-col items-center gap-6">

            <div className="prep-timer-wrapper">

              <div className="prep-timer-ring prep-timer-ring-outer" />

              <div className="prep-timer-ring prep-timer-ring-inner" />

              <div className="prep-timer-card">

                <div className="prep-timer-accent prep-timer-accent-one" />

                <div className="prep-timer-accent prep-timer-accent-two" />

                <svg
                  className="prep-progress-ring"
                  viewBox="0 0 120 120"
                  aria-hidden="true"
                >

                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(26, 26, 46, 0.10)"
                    strokeWidth="3"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={
                      urgent
                        ? 'var(--error)'
                        : warning
                          ? 'var(--warning)'
                          : 'var(--coral)'
                    }
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 linear"
                  />

                </svg>

                <div className="prep-timer-number">

                  <span
                    className={`fu-timer prep-timer-digits ${
                      urgent
                        ? 'urgent'
                        : warning
                          ? 'warning'
                          : ''
                    }`}
                  >
                    {remaining}
                  </span>

                  <span className="prep-timer-label">
                    SECONDS
                  </span>

                </div>

              </div>

            </div>


            <div className="flex flex-wrap justify-center gap-3">

              <button
                type="button"
                onClick={() => {
                  addTime(ADD_SECONDS);
                  dispatch({
                    type: 'ADD_PREPARATION_TIME',
                  });
                }}
                className="fu-btn-secondary text-sm"
              >
                +{ADD_SECONDS}s
              </button>

              <button
                type="button"
                onClick={skip}
                className="fu-btn-tertiary text-sm"
              >
                Skip
              </button>

            </div>

          </div>


         {/* ========================================================
    FRAMEWORK STEPS
========================================================= */}

<div
  className="rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-4 shadow-[var(--shadow)]"
  style={{ background: 'var(--teal)' }}
>
  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white">
    {selectedFramework.name}
  </p>

  <div className="space-y-2">
    {selectedFramework.structuralSteps.map((step, i) => (
      <div
        key={i}
        className="text-sm text-white"
      >
        {step}
      </div>
    ))}
  </div>
</div>

          </div>



      </section>
    </>
  );
}