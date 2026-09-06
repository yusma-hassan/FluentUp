'use client';

// TOPIC_DISPLAY phase — invisible pass-through.
//
// By the time the state machine enters TOPIC_DISPLAY the user has already
// seen their topic on the TopicSelection screen for 5 seconds (via an
// internal setTimeout). This component simply dispatches TOPIC_DISPLAY_COMPLETE
// on mount so the state machine moves immediately to PREPARATION.
//
// Nothing is rendered during TOPIC_DISPLAY — the transition is instantaneous
// from the user's perspective. The only visible timers in the challenge flow
// are the 30-second preparation timer and the 60-second recording timer.

import { useEffect, useRef } from 'react';

import { useChallengeFlow } from '@/components/layout/ChallengeContext';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function ChallengeScreen() {
  const { state, dispatch } = useChallengeFlow();
  const { selectedFramework, selectedTopic } = state;

  const dispatched = useRef(false);

  useEffect(() => {
    if (dispatched.current) return;
    if (!selectedFramework || !selectedTopic) return;
    dispatched.current = true;
    dispatch({ type: 'TOPIC_DISPLAY_COMPLETE' });
  }, [selectedFramework, selectedTopic, dispatch]);

  // Error state — should not occur in normal flow.
  if (!selectedFramework || !selectedTopic) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
        <ErrorMessage
          message="Challenge details could not be loaded. Please start a new challenge."
          onRetry={() => dispatch({ type: 'START_NEW_CHALLENGE' })}
        />
      </section>
    );
  }

  // Return null — this phase is invisible. The useEffect above immediately
  // advances to PREPARATION, so this render is never visible to the user.
  return null;
}
