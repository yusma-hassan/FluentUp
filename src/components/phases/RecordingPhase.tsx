'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useChallengeFlow } from '@/components/layout/ChallengeContext';

import { CountdownTimer } from '@/components/ui/CountdownTimer';

import { ErrorMessage } from '@/components/ui/ErrorMessage';

import { useAudioRecorder } from '@/hooks/useAudioRecorder';

import { detectSpeech } from '@/lib/audio/detectSpeech';

export function RecordingPhase() {
  // TEMPORARY UI PREVIEW MODE
  // Set this to false when you are finished designing the UI.
  const UI_PREVIEW = false;

  const { state, dispatch } = useChallengeFlow();

  const { selectedFramework, selectedTopic, phaseError } = state;

  const {
    state: recState,
    startRecording,
    stopRecording,
    audioBlob,
    error: recError,
  } = useAudioRecorder();

  const submittedRef = useRef(false);

  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // In preview mode, do not request microphone access.
    if (UI_PREVIEW) return;

    startRecording();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimerComplete = useCallback(() => {
    // In preview mode, do not stop recording.
    if (UI_PREVIEW) return;

    stopRecording();
  }, [stopRecording]);

  useEffect(() => {
    if (recState !== 'stopped' || !audioBlob || submittedRef.current) return;

    let cancelled = false;

    setChecking(true);

    detectSpeech(audioBlob)
      .then((result) => {
        if (cancelled) return;

        setChecking(false);
        submittedRef.current = true;

        if (!result.hasSpeech) {
          dispatch({ type: 'SILENCE_DETECTED' });
        } else {
          dispatch({ type: 'RECORDING_TIMER_COMPLETE', audioBlob });
        }
      })
      .catch(() => {
        if (cancelled) return;

        setChecking(false);
        submittedRef.current = true;

        dispatch({ type: 'SILENCE_DETECTED' });
      });

    return () => {
      cancelled = true;
    };
  }, [recState, audioBlob, dispatch]);

  const isDenied =
    (recError?.toLowerCase().includes('denied') ||
      recError?.toLowerCase().includes('allow')) ??
    false;

  const silenceError = phaseError;

  // Keeps the enhanced recording UI visible during UI development.
  const showRecordingUI = UI_PREVIEW || recState === 'recording';

  return (
    <>
    
      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12 fu-fade-up">

        {/* Heading */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border-2 border-[var(--amber)] bg-white px-4 py-1.5 shadow-[3px_3px_0_var(--navy)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--coral)]" />

            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--navy)]">
              Speaking Challenge
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--navy)] sm:text-4xl lg:text-5xl">
            Speak Now
          </h1>
        </div>

        {/* Selected Topic */}
        {selectedTopic && (
          <div className="mx-auto w-full max-w-4xl">
            <div className="group relative overflow-hidden rounded-3xl border-2 border-[var(--navy)] bg-[var(--amber)] shadow-[7px_7px_0_var(--navy)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[9px_9px_0_var(--navy)]">

              {/* Decorative shapes */}
              <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[var(--coral)] opacity-35" />

              <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[var(--teal)] opacity-30" />

              <div className="relative flex flex-col gap-3 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--navy)] bg-[var(--navy)] shadow-[3px_3px_0_rgba(255,255,255,0.45)]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="text-left">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--navy)]/70">
                      Your Topic
                    </p>

                    <p className="text-base font-extrabold text-[var(--navy)] sm:text-lg">
                      Speak about the topic below
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-[var(--navy)] bg-white px-4 py-4 shadow-[4px_4px_0_var(--navy)] sm:px-6 sm:py-5">
                  <p className="text-base font-bold leading-relaxed text-[var(--navy)] sm:text-lg lg:text-xl">
                    {selectedTopic.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Silence error */}
        {silenceError && recState !== 'recording' && !UI_PREVIEW && (
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
            <div className="w-full rounded-3xl border-2 border-[var(--navy)] bg-white p-5 shadow-[6px_6px_0_var(--navy)] sm:p-6">
              <ErrorMessage message={silenceError} />
            </div>

            <button
              type="button"
              onClick={async () => {
                submittedRef.current = false;
                dispatch({ type: 'RE_RECORD' });
                await startRecording();
              }}
              className="rounded-xl border-2 border-[var(--navy)] bg-[var(--coral)] px-6 py-3 text-sm font-extrabold text-white shadow-[4px_4px_0_var(--navy)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--navy)] active:translate-y-0 active:shadow-[2px_2px_0_var(--navy)]"
            >
              Record Again
            </button>
          </div>
        )}

        {/* Microphone error */}
        {recState === 'error' && !silenceError && !UI_PREVIEW && (
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
            <div className="w-full rounded-3xl border-2 border-[var(--navy)] bg-white p-5 shadow-[6px_6px_0_var(--navy)] sm:p-6">
              <ErrorMessage
                message={recError ?? 'Microphone error occurred.'}
                onRetry={
                  isDenied
                    ? undefined
                    : () => dispatch({ type: 'RE_RECORD' })
                }
              />
            </div>

            {!isDenied && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'RE_RECORD' })}
                className="rounded-xl border-2 border-[var(--navy)] bg-[var(--coral)] px-6 py-3 text-sm font-extrabold text-white shadow-[4px_4px_0_var(--navy)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--navy)] active:translate-y-0 active:shadow-[2px_2px_0_var(--navy)]"
              >
                Re record
              </button>
            )}
          </div>
        )}

        {/* Requesting microphone */}
        {recState === 'requesting' && !UI_PREVIEW && (
          <div className="mx-auto w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl border-2 border-[var(--navy)] bg-white px-5 py-12 shadow-[7px_7px_0_var(--navy)] sm:px-8 sm:py-16">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--teal)] opacity-15" />
              <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[var(--amber)] opacity-20" />

              <div className="relative flex flex-col items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--navy)] bg-[var(--coral)] shadow-[5px_5px_0_var(--navy)] fu-breathe">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="9"
                      y="3"
                      width="6"
                      height="11"
                      rx="3"
                      fill="white"
                    />
                    <path
                      d="M7 11a5 5 0 0 0 10 0"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 16v5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 21h6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="text-center">
                  <p className="text-lg font-extrabold text-[var(--navy)]">
                    Ready to speak?
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                    Requesting microphone access…
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recording */}
        {showRecordingUI && (
          <div className="mx-auto w-full max-w-4xl">
            <div className="group relative overflow-hidden rounded-3xl border-2 border-[var(--navy)] bg-white shadow-[8px_8px_0_var(--navy)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--navy)]">

              {/* Decorative card gradients */}
              <div
                className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-30"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,92,58,0.45) 0%, transparent 70%)',
                }}
              />

              <div
                className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full opacity-30"
                style={{
                  background:
                    'radial-gradient(circle, rgba(26,155,143,0.38) 0%, transparent 70%)',
                }}
              />

              <div className="relative flex flex-col items-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">

                {/* Recording status */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[var(--coral)] bg-[#fff5f2] px-4 py-2 shadow-[3px_3px_0_var(--navy)]">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inset-0 rounded-full bg-[var(--coral)] opacity-50 fu-record-ping" />
                    <span className="relative h-3 w-3 rounded-full bg-[var(--coral)]" />
                  </span>

                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--coral)]">
                    Recording
                  </span>
                </div>

                {/* Wave and microphone */}
                <div className="relative flex h-64 w-full max-w-3xl items-center justify-center overflow-hidden sm:h-72 lg:h-80">

                  {/* Large glowing wave */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <svg
                      className="recording-wave h-full w-full"
                      viewBox="0 0 800 240"
                      preserveAspectRatio="none"
                      fill="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient
                          id="recordingWaveGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#FF8068"
                            stopOpacity="0.08"
                          />
                          <stop
                            offset="30%"
                            stopColor="#FF5C3A"
                            stopOpacity="0.55"
                          />
                          <stop
                            offset="50%"
                            stopColor="#FF5C3A"
                            stopOpacity="0.9"
                          />
                          <stop
                            offset="70%"
                            stopColor="#FF8068"
                            stopOpacity="0.55"
                          />
                          <stop
                            offset="100%"
                            stopColor="#FF8068"
                            stopOpacity="0.08"
                          />
                        </linearGradient>
                      </defs>

                      <path
                        className="wave-line wave-line-one"
                        d="M0 120 C45 120 55 70 90 70 C125 70 135 170 170 170 C205 170 215 45 250 45 C285 45 295 195 330 195 C365 195 375 25 410 25 C445 25 455 215 490 215 C525 215 535 45 570 45 C605 45 615 170 650 170 C685 170 695 70 730 70 C765 70 775 120 800 120"
                        stroke="url(#recordingWaveGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />

                      <path
                        className="wave-line wave-line-two"
                        d="M0 120 C50 120 65 90 100 90 C135 90 150 150 185 150 C220 150 235 65 270 65 C305 65 320 175 355 175 C390 175 405 40 440 40 C475 40 490 200 525 200 C560 200 575 65 610 65 C645 65 660 150 695 150 C730 150 750 90 800 90"
                        stroke="#FF8068"
                        strokeOpacity="0.35"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Soft wave glow */}
                  <div
                    className="pointer-events-none absolute h-44 w-44 rounded-full blur-3xl"
                    style={{
                      background: 'rgba(255,92,58,0.25)',
                    }}
                  />

                  {/* Outer microphone pulse */}
                  <div className="absolute h-40 w-40 rounded-full border-2 border-[var(--coral)] opacity-20 fu-record-ping sm:h-48 sm:w-48" />

                  <div className="absolute h-32 w-32 rounded-full bg-[var(--coral)] opacity-10 fu-record-ping sm:h-40 sm:w-40" />

                  {/* Microphone */}
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[var(--navy)] bg-[var(--coral)] shadow-[7px_7px_0_var(--navy)] transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32">
                    <svg
                      width="52"
                      height="52"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="8"
                        y="2"
                        width="8"
                        height="13"
                        rx="4"
                        fill="white"
                      />

                      <path
                        d="M5.5 11.5a6.5 6.5 0 0 0 13 0"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <path
                        d="M12 18v4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <path
                        d="M9 22h6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Timer */}
                <div className="mt-1 flex flex-col items-center">
                  <div className="rounded-2xl border-2 border-[var(--navy)] bg-[#faf9f6] px-8 py-3 shadow-[4px_4px_0_var(--teal)] sm:px-10">
                    <CountdownTimer
                      totalSeconds={
                        selectedFramework?.speakingTimeSeconds ?? 60
                      }
                      onComplete={handleTimerComplete}
                      running={!UI_PREVIEW}
                    />
                  </div>

                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    Keep speaking naturally
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Finalising / checking */}
        {(recState === 'stopped' || checking) &&
          !silenceError &&
          !UI_PREVIEW && (
            <div className="mx-auto w-full max-w-3xl">
              <div className="relative overflow-hidden rounded-3xl border-2 border-[var(--navy)] bg-white px-5 py-12 shadow-[7px_7px_0_var(--navy)] sm:px-8 sm:py-16">

                <div
                  className="absolute -left-16 -top-20 h-48 w-48 rounded-full opacity-20"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,92,58,0.7) 0%, transparent 70%)',
                  }}
                />

                <div
                  className="absolute -bottom-20 -right-16 h-48 w-48 rounded-full opacity-20"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(26,155,143,0.7) 0%, transparent 70%)',
                  }}
                />

                <div className="relative flex flex-col items-center gap-5">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--navy)] bg-[var(--teal)] shadow-[5px_5px_0_var(--navy)]">
                    <div className="h-9 w-9 rounded-full border-[4px] border-white border-t-transparent animate-spin" />
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-extrabold text-[var(--navy)]">
                      {checking
                        ? 'Checking your speech'
                        : 'Finalising your response'}
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                      {checking
                        ? 'Making sure your recording contains speech…'
                        : 'Preparing your results…'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Remember card */}
        {recState !== 'error' &&
          !silenceError &&
          selectedFramework && (
            <div className="mx-auto w-full max-w-4xl">
              <div className="group relative overflow-hidden rounded-3xl border-2 border-[var(--navy)] bg-white shadow-[6px_6px_0_var(--navy)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--navy)]">

                {/* Colored header */}
                <div className="flex flex-col gap-2 bg-[var(--teal)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">
                      Remember
                    </p>

                    <p className="text-lg font-extrabold text-white">
                      {selectedFramework.name}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/40 bg-white/20">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 3v18M5 7h14M5 17h14"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Framework steps */}
                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">

                  {selectedFramework.structuralSteps.map((step, i) => {
                    const stepColors = [
                      'bg-[var(--coral)]',
                      'bg-[var(--teal)]',
                      'bg-[var(--purple)]',
                      'bg-[var(--amber)]',
                    ];

                    return (
                      <div
                        key={i}
                        className={`flex min-w-0 gap-3 rounded-2xl border-2 border-[var(--navy)] p-4 shadow-[4px_4px_0_var(--navy)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--navy)] ${stepColors[i % stepColors.length]}`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--navy)] bg-white text-sm font-extrabold text-[var(--navy)] shadow-[2px_2px_0_var(--navy)]">
                          {i + 1}
                        </span>

                        <span className="pt-1 text-sm font-bold leading-relaxed text-white sm:text-[15px]">
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
      </section>

      {/* Recording animation styles */}
      <style jsx>{`
        .recording-wave {
          animation: waveFloat 3.5s ease-in-out infinite;
        }

        .wave-line {
          transform-origin: center;
          transform-box: fill-box;
        }

        .wave-line-one {
          animation: waveMoveOne 2.4s ease-in-out infinite;
        }

        .wave-line-two {
          animation: waveMoveTwo 2.1s ease-in-out infinite;
        }

        @keyframes waveFloat {
          0%,
          100% {
            transform: scaleY(0.82) scaleX(0.96);
            opacity: 0.75;
          }

          50% {
            transform: scaleY(1.08) scaleX(1.02);
            opacity: 1;
          }
        }

        @keyframes waveMoveOne {
          0%,
          100% {
            transform: translateX(-12px) scaleY(0.82);
          }

          50% {
            transform: translateX(12px) scaleY(1.12);
          }
        }

        @keyframes waveMoveTwo {
          0%,
          100% {
            transform: translateX(12px) scaleY(1);
          }

          50% {
            transform: translateX(-12px) scaleY(0.75);
          }
        }
      `}</style>
    </>
  );
}