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
    <section className="mx-auto flex w-full max-w-lg flex-col gap-7 px-5 py-8 sm:py-12 fu-fade-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--navy)]">
          Choose Your Framework
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Pick a number to reveal your communication framework.
        </p>
      </div>

      <NumberedGrid
        count={frameworkSlots.length}
        onSelect={handleSelect}
        selectedSlot={selectedSlot}
        revealedLabel={null}
        disabled={false}
      />

      {revealedFramework && (
        <div
          className="fu-fade-up rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-5 shadow-[var(--shadow)]"
          style={{ background: 'var(--teal)' }}
        >
          <h2 className="text-lg font-extrabold text-white mb-1">
            {revealedFramework.name}
          </h2>
          <p className="text-sm text-white/90 leading-relaxed">
            {truncateToWords(revealedFramework.description, 40)}
          </p>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleProceed}
          disabled={!selectedFramework}
          className="fu-btn-primary w-full sm:w-auto"
        >
          Continue →
        </button>
      </div>
    </section>
  );
}