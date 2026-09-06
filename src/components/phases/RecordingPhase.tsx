'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChallengeFlow } from '@/components/layout/ChallengeContext';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { detectSpeech } from '@/lib/audio/detectSpeech';

export function RecordingPhase() {
  const { state, dispatch } = useChallengeFlow();
  const { selectedFramework, selectedTopic, phaseError } = state;

  const { state: recState, startRecording, stopRecording, audioBlob, error: recError } = useAudioRecorder();
  const submittedRef = useRef(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimerComplete = useCallback(() => {
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

    return () => { cancelled = true; };
  }, [recState, audioBlob, dispatch]);

  const isDenied = (recError?.toLowerCase().includes('denied') || recError?.toLowerCase().includes('allow')) ?? false;
  const silenceError = phaseError;

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8 sm:py-12 fu-fade-up">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--navy)]">
          Speak Now
        </h1>
        {selectedTopic && (
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {selectedTopic.text}
          </p>
        )}
      </div>

      {silenceError && recState !== 'recording' && (
        <div className="flex flex-col gap-4 items-center">
          <ErrorMessage message={silenceError} />
          <button
            type="button"
            onClick={async () => {
              submittedRef.current = false;
              dispatch({ type: 'RE_RECORD' });
              await startRecording();
            }}
            className="fu-btn-primary"
          >
            Record Again
          </button>
        </div>
      )}

      {recState === 'error' && !silenceError && (
        <div className="flex flex-col gap-4 items-center">
          <ErrorMessage
            message={recError ?? 'Microphone error occurred.'}
            onRetry={isDenied ? undefined : () => dispatch({ type: 'RE_RECORD' })}
          />
          {!isDenied && (
            <button type="button" onClick={() => dispatch({ type: 'RE_RECORD' })} className="fu-btn-primary">
              Re-record
            </button>
          )}
        </div>
      )}

      {recState === 'requesting' && (
        <div className="fu-card flex flex-col items-center gap-4 py-12">
          <div className="h-12 w-12 rounded-full border-[3px] border-[var(--coral)] fu-breathe" />
          <p className="text-sm font-bold text-[var(--text-secondary)]">Requesting microphone…</p>
        </div>
      )}

      {recState === 'recording' && (
        <div className="fu-card flex flex-col items-center gap-7 py-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-[var(--coral)] opacity-20 fu-record-ping" />
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full border-[2.5px] border-[var(--navy)] shadow-[var(--shadow)]"
              style={{ background: 'var(--coral)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-[var(--error)] opacity-60 fu-record-ping" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--error)]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--error)]">Recording</span>
          </div>

          <CountdownTimer
            totalSeconds={selectedFramework?.speakingTimeSeconds ?? 60}
            onComplete={handleTimerComplete}
            running={true}
          />
        </div>
      )}

      {(recState === 'stopped' || checking) && !silenceError && (
        <div className="fu-card flex flex-col items-center gap-4 py-12">
          <div className="h-10 w-10 rounded-full border-[3px] border-[var(--coral)] fu-breathe" />
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            {checking ? 'Checking audio…' : 'Finalising…'}
          </p>
        </div>
      )}

      {recState !== 'error' && !silenceError && selectedFramework && (
        <div className="fu-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Remember · {selectedFramework.name}
          </p>
          <ol className="space-y-1.5">
            {selectedFramework.structuralSteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--coral)]">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}