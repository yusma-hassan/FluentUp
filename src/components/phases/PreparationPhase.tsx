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
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8 sm:py-12 fu-fade-up">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--navy)]">
          Preparation Time
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Get ready. You’ve got this.
        </p>
      </div>

      {/* Circular Timer */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-44 w-44 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E1DB" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={urgent ? 'var(--error)' : warning ? 'var(--warning)' : 'var(--coral)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
              className="transition-all duration-1000 linear"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center">
            <span className={`fu-timer ${urgent ? 'urgent' : warning ? 'warning' : ''}`}>
              {remaining}
            </span>
            <span className="text-xs font-bold text-[var(--text-muted)] -mt-1">seconds</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => { addTime(ADD_SECONDS); dispatch({ type: 'ADD_PREPARATION_TIME' }); }} className="fu-btn-secondary text-sm">
            +{ADD_SECONDS}s
          </button>
          <button type="button" onClick={skip} className="fu-btn-tertiary text-sm">
            Skip
          </button>
        </div>
      </div>

      {/* Topic */}
      <div
        className="rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-4 shadow-[var(--shadow)]"
        style={{ background: 'var(--yellow)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--navy)] mb-1">Topic</p>
        <p className="text-sm font-bold text-[var(--navy)] leading-snug">{selectedTopic.text}</p>
      </div>

      {/* Framework steps */}
      <div
        className="rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-4 shadow-[var(--shadow)]"
        style={{ background: 'var(--teal)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">
          {selectedFramework.name}
        </p>
        <ol className="space-y-2">
          {selectedFramework.structuralSteps.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white">
              <span className="font-bold shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}