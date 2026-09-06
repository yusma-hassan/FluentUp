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
  const [revealedTopic, setRevealedTopic] = useState<GeneratedTopic | null>(null);
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
    <section className="mx-auto flex w-full max-w-lg flex-col gap-7 px-5 py-8 sm:py-12 fu-fade-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--navy)]">
          Pick a Topic
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose a number. The challenge begins automatically.
        </p>
      </div>

      <NumberedGrid
        count={topicSlots.length}
        onSelect={handleSelect}
        selectedSlot={selectedSlot}
        revealedLabel={null}
        disabled={selectedSlot !== null}
      />

      {revealedTopic && (
        <div
          className="fu-fade-up rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-5 shadow-[var(--shadow)]"
          style={{ background: 'var(--yellow)' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--navy)] mb-1">
            Your topic
          </p>
          <p className="text-base font-bold text-[var(--navy)] leading-snug">
            {revealedTopic.text}
          </p>
          <p className="mt-3 text-xs font-semibold text-[var(--navy)]/70">
            Starting preparation shortly…
          </p>
        </div>
      )}
    </section>
  );
}