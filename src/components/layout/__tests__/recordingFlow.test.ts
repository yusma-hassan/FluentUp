/**
 * @jest-environment jsdom
 *
 * Tests for the automatic recording flow behavior.
 *
 * Verifies:
 * - RECORDING_TIMER_COMPLETE stores the audioBlob and transitions to ANALYZING.
 * - ADD_PREPARATION_TIME is a reducer no-op (time is managed by useCountdown).
 * - The normal flow CONFIRM_TOPIC → CHALLENGE_SCREEN → (PREP_COMPLETE) →
 *   RECORDING → (RECORDING_TIMER_COMPLETE) → ANALYZING is valid.
 * - No manual Submit action is required — RECORDING_TIMER_COMPLETE → ANALYZING.
 */

import { challengeFlowReducer } from '../ChallengeContext';
import type {
  ChallengeFlowAction,
  ChallengeFlowState,
  Framework,
  GeneratedTopic,
} from '@/types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockFramework: Framework = {
  id: 'prep',
  name: 'PREP',
  description: 'Point, Reason, Example, Point.',
  structuralSteps: ['Point', 'Reason', 'Example', 'Restate'],
  evaluationCriteria: [{ id: 'prep_point', label: 'Clear Point', description: 'Opens with a clear point.' }],
  preparationTimeSeconds: 15,
  speakingTimeSeconds: 60,
};

const mockTopic: GeneratedTopic = {
  id: 'generated-1',
  text: 'Should social media be regulated?',
};

const baseState: ChallengeFlowState = {
  phase: 'RECORDING',
  frameworkSlots: [],
  topicSlots: [],
  selectedFramework: mockFramework,
  selectedTopic: mockTopic,
  audioBlob: null,
  evaluationResult: null,
  topicGenerationError: null,
  phaseError: null,
};

const audioBlob = new Blob([new Uint8Array(100)], { type: 'audio/webm' });

// ── RECORDING_TIMER_COMPLETE ──────────────────────────────────────────────────

describe('RECORDING_TIMER_COMPLETE action', () => {
  it('stores the audioBlob and transitions directly to ANALYZING', () => {
    const result = challengeFlowReducer(baseState, {
      type: 'RECORDING_TIMER_COMPLETE',
      audioBlob,
    });

    expect(result.phase).toBe('ANALYZING');
    expect(result.audioBlob).toBe(audioBlob);
    expect(result.phaseError).toBeNull();
  });

  it('does NOT stop at RECORDING — no separate SUBMIT_FOR_ANALYSIS needed', () => {
    // Verify the transition skips RECORDING and goes straight to ANALYZING.
    const result = challengeFlowReducer(baseState, {
      type: 'RECORDING_TIMER_COMPLETE',
      audioBlob,
    });

    // Must be ANALYZING, not RECORDING.
    expect(result.phase).toBe('ANALYZING');
    // Must not be anything else.
    expect(result.phase).not.toBe('RECORDING');
    expect(result.phase).not.toBe('FEEDBACK');
  });

  it('preserves selectedFramework and selectedTopic through the transition', () => {
    const result = challengeFlowReducer(baseState, {
      type: 'RECORDING_TIMER_COMPLETE',
      audioBlob,
    });

    expect(result.selectedFramework).toBe(mockFramework);
    expect(result.selectedTopic).toBe(mockTopic);
  });
});

// ── ADD_PREPARATION_TIME ──────────────────────────────────────────────────────

describe('ADD_PREPARATION_TIME action', () => {
  const prepState: ChallengeFlowState = {
    ...baseState,
    phase: 'PREPARATION',
  };

  it('is a reducer no-op — phase remains PREPARATION', () => {
    const result = challengeFlowReducer(prepState, { type: 'ADD_PREPARATION_TIME' });
    expect(result.phase).toBe('PREPARATION');
  });

  it('does not modify any other state fields', () => {
    const result = challengeFlowReducer(prepState, { type: 'ADD_PREPARATION_TIME' });
    expect(result).toEqual(prepState);
  });
});

// ── Full automatic flow sequence ──────────────────────────────────────────────

describe('Automatic challenge flow — state transitions', () => {
  it('CONFIRM_TOPIC → TOPIC_DISPLAY (5-second read window, not PREPARATION)', () => {
    const s0: ChallengeFlowState = {
      ...baseState,
      phase: 'TOPIC_SELECTION',
      selectedTopic: mockTopic,
    };
    const s1 = challengeFlowReducer(s0, { type: 'CONFIRM_TOPIC' });
    expect(s1.phase).toBe('TOPIC_DISPLAY');
  });

  it('TOPIC_DISPLAY_COMPLETE → PREPARATION (prep timer starts here, not during read window)', () => {
    const s0: ChallengeFlowState = { ...baseState, phase: 'TOPIC_DISPLAY' };
    const s1 = challengeFlowReducer(s0, { type: 'TOPIC_DISPLAY_COMPLETE' });
    expect(s1.phase).toBe('PREPARATION');
  });

  it('PREP_COMPLETE → RECORDING', () => {
    const s0: ChallengeFlowState = { ...baseState, phase: 'PREPARATION' };
    const s1 = challengeFlowReducer(s0, { type: 'PREP_COMPLETE' });
    expect(s1.phase).toBe('RECORDING');
  });

  it('SKIP_PREP → RECORDING', () => {
    const s0: ChallengeFlowState = { ...baseState, phase: 'PREPARATION' };
    const s1 = challengeFlowReducer(s0, { type: 'SKIP_PREP' });
    expect(s1.phase).toBe('RECORDING');
  });

  it('RECORDING_TIMER_COMPLETE → ANALYZING (no manual submit needed)', () => {
    const result = challengeFlowReducer(baseState, {
      type: 'RECORDING_TIMER_COMPLETE',
      audioBlob,
    });
    expect(result.phase).toBe('ANALYZING');
  });

  it('full sequence from TOPIC_SELECTION to ANALYZING matches expected phases', () => {
    let state: ChallengeFlowState = {
      ...baseState,
      phase: 'TOPIC_SELECTION',
      selectedTopic: mockTopic,
      selectedFramework: mockFramework,
    };

    // CONFIRM_TOPIC → TOPIC_DISPLAY (5-second read window)
    state = challengeFlowReducer(state, { type: 'CONFIRM_TOPIC' });
    expect(state.phase).toBe('TOPIC_DISPLAY');

    // TOPIC_DISPLAY_COMPLETE → PREPARATION (30-second prep timer starts)
    state = challengeFlowReducer(state, { type: 'TOPIC_DISPLAY_COMPLETE' });
    expect(state.phase).toBe('PREPARATION');

    // PREP_COMPLETE → RECORDING
    state = challengeFlowReducer(state, { type: 'PREP_COMPLETE' });
    expect(state.phase).toBe('RECORDING');

    // RECORDING_TIMER_COMPLETE → ANALYZING (blob stored atomically)
    state = challengeFlowReducer(state, { type: 'RECORDING_TIMER_COMPLETE', audioBlob });
    expect(state.phase).toBe('ANALYZING');

    // audioBlob is stored
    expect(state.audioBlob).toBe(audioBlob);
  });

  it('preparation Add Time + Skip → RECORDING', () => {
    let state: ChallengeFlowState = { ...baseState, phase: 'PREPARATION' };

    // ADD_PREPARATION_TIME is a no-op in the reducer
    state = challengeFlowReducer(state, { type: 'ADD_PREPARATION_TIME' });
    expect(state.phase).toBe('PREPARATION');

    // Skip immediately transitions to RECORDING
    state = challengeFlowReducer(state, { type: 'SKIP_PREP' });
    expect(state.phase).toBe('RECORDING');
  });
});

// ── No manual stop or submit path ─────────────────────────────────────────────

describe('No manual stop/submit path in normal flow', () => {
  it('RECORDING_TIMER_COMPLETE stores blob atomically without SUBMIT_FOR_ANALYSIS', () => {
    // In the new flow the UI never dispatches SUBMIT_FOR_ANALYSIS after recording.
    // RECORDING_TIMER_COMPLETE handles both blob storage and phase transition.
    const result = challengeFlowReducer(baseState, {
      type: 'RECORDING_TIMER_COMPLETE',
      audioBlob,
    });

    // Single action achieves: blob stored + phase = ANALYZING
    expect(result.audioBlob).toBe(audioBlob);
    expect(result.phase).toBe('ANALYZING');
  });
});

// ── Automatic topic → challenge transition ────────────────────────────────────

describe('Automatic topic-selection → challenge flow (no Start Challenge button)', () => {
  it('CONFIRM_TOPIC → TOPIC_DISPLAY (5-second read window), not PREPARATION directly', () => {
    const s0: ChallengeFlowState = {
      ...baseState,
      phase: 'TOPIC_SELECTION',
      selectedTopic: mockTopic,
    };
    const s1 = challengeFlowReducer(s0, { type: 'CONFIRM_TOPIC' });
    expect(s1.phase).toBe('TOPIC_DISPLAY');
    expect(s1.phase).not.toBe('PREPARATION');
    expect(s1.phase).not.toBe('RECORDING');
  });

  it('TOPIC_DISPLAY_COMPLETE → PREPARATION (two phases are distinct)', () => {
    const s0: ChallengeFlowState = { ...baseState, phase: 'TOPIC_DISPLAY' };
    const s1 = challengeFlowReducer(s0, { type: 'TOPIC_DISPLAY_COMPLETE' });
    expect(s1.phase).toBe('PREPARATION');
    expect(s1.phase).not.toBe('RECORDING');
  });

  it('PREP_COMPLETE from PREPARATION → RECORDING', () => {
    const s0: ChallengeFlowState = { ...baseState, phase: 'PREPARATION' };
    const s1 = challengeFlowReducer(s0, { type: 'PREP_COMPLETE' });
    expect(s1.phase).toBe('RECORDING');
  });

  it('full no-button flow: TOPIC_SELECTION → CHALLENGE_SCREEN → RECORDING → ANALYZING', () => {
    let state: ChallengeFlowState = {
      ...baseState,
      phase: 'TOPIC_SELECTION',
      selectedTopic: mockTopic,
      selectedFramework: mockFramework,
    };

    // 1. Topic reveal auto-dispatches CONFIRM_TOPIC → TOPIC_DISPLAY (5s read).
    state = challengeFlowReducer(state, { type: 'CONFIRM_TOPIC' });
    expect(state.phase).toBe('TOPIC_DISPLAY');

    // 2. ChallengeScreen 5-second countdown fires TOPIC_DISPLAY_COMPLETE → PREPARATION.
    state = challengeFlowReducer(state, { type: 'TOPIC_DISPLAY_COMPLETE' });
    expect(state.phase).toBe('PREPARATION');

    // 3. PreparationPhase 30-second countdown fires PREP_COMPLETE → RECORDING.
    state = challengeFlowReducer(state, { type: 'PREP_COMPLETE' });
    expect(state.phase).toBe('RECORDING');

    // 4. RecordingPhase 60-second countdown fires RECORDING_TIMER_COMPLETE → ANALYZING.
    state = challengeFlowReducer(state, { type: 'RECORDING_TIMER_COMPLETE', audioBlob });
    expect(state.phase).toBe('ANALYZING');
    expect(state.audioBlob).toBe(audioBlob);

    // No manual "Start Challenge", "Start Recording", or "Submit" action dispatched.
  });
});


// ── SILENCE_DETECTED — reducer behaviour ─────────────────────────────────────

describe('SILENCE_DETECTED action', () => {
  const recordingState: ChallengeFlowState = {
    ...baseState,
    phase: 'RECORDING',
    audioBlob,
    phaseError: null,
  };

  it('stays in RECORDING phase — does NOT advance to ANALYZING', () => {
    const result = challengeFlowReducer(recordingState, { type: 'SILENCE_DETECTED' });
    expect(result.phase).toBe('RECORDING');
    expect(result.phase).not.toBe('ANALYZING');
  });

  it('clears audioBlob so the silent recording is not re-submitted', () => {
    const result = challengeFlowReducer(recordingState, { type: 'SILENCE_DETECTED' });
    expect(result.audioBlob).toBeNull();
  });

  it('sets phaseError to the expected user-facing message', () => {
    const result = challengeFlowReducer(recordingState, { type: 'SILENCE_DETECTED' });
    expect(result.phaseError).toBe(
      'No speech detected. Please try again and make sure your microphone is working.',
    );
  });

  it('RE_RECORD after SILENCE_DETECTED resets phaseError and stays in RECORDING', () => {
    const afterSilence = challengeFlowReducer(recordingState, { type: 'SILENCE_DETECTED' });
    const afterReRecord = challengeFlowReducer(afterSilence, { type: 'RE_RECORD' });
    expect(afterReRecord.phase).toBe('RECORDING');
    expect(afterReRecord.phaseError).toBeNull();
    expect(afterReRecord.audioBlob).toBeNull();
  });
});

// ── Integration: silence detection gate ──────────────────────────────────────
//
// These tests prove the architectural contract:
//   silent recording  → SILENCE_DETECTED → phase stays RECORDING, blob cleared
//   active recording  → RECORDING_TIMER_COMPLETE → phase = ANALYZING, blob stored
//
// They test the reducer directly (the source of truth for what happens) and
// also verify that RECORDING_TIMER_COMPLETE is the only path to ANALYZING
// (i.e. a silent recording can never reach ANALYZING through the reducer).

describe('Integration: silence detection prevents /api/evaluate call', () => {
  it('SILENCE_DETECTED never transitions to ANALYZING — /api/evaluate cannot be reached', () => {
    // Contract: the context's useEffect that calls /api/evaluate only fires
    // when phase === ANALYZING. SILENCE_DETECTED keeps phase === RECORDING,
    // so the fetch side-effect never runs.
    const s0: ChallengeFlowState = { ...baseState, phase: 'RECORDING', audioBlob };
    const s1 = challengeFlowReducer(s0, { type: 'SILENCE_DETECTED' });
    expect(s1.phase).not.toBe('ANALYZING');
    // The blob is also cleared so a retry can't inadvertently re-use it.
    expect(s1.audioBlob).toBeNull();
  });

  it('only RECORDING_TIMER_COMPLETE (speech detected) advances to ANALYZING', () => {
    // Prove that the path to /api/evaluate requires a non-silence result.
    const s0: ChallengeFlowState = { ...baseState, phase: 'RECORDING', audioBlob };

    // Silence path → stays in RECORDING
    const silenced = challengeFlowReducer(s0, { type: 'SILENCE_DETECTED' });
    expect(silenced.phase).toBe('RECORDING');

    // Speech path → advances to ANALYZING
    const active = challengeFlowReducer(s0, {
      type: 'RECORDING_TIMER_COMPLETE',
      audioBlob,
    });
    expect(active.phase).toBe('ANALYZING');
    expect(active.audioBlob).toBe(audioBlob);
  });

  it('silent recording → SILENCE_DETECTED → RE_RECORD → new recording can succeed', () => {
    let state: ChallengeFlowState = { ...baseState, phase: 'RECORDING', audioBlob };

    // First attempt: silence detected
    state = challengeFlowReducer(state, { type: 'SILENCE_DETECTED' });
    expect(state.phase).toBe('RECORDING');
    expect(state.phaseError).not.toBeNull();

    // User clicks "Record Again"
    state = challengeFlowReducer(state, { type: 'RE_RECORD' });
    expect(state.phase).toBe('RECORDING');
    expect(state.phaseError).toBeNull();
    expect(state.audioBlob).toBeNull();

    // Second attempt: speech detected → proceeds to analysis
    state = challengeFlowReducer(state, {
      type: 'RECORDING_TIMER_COMPLETE',
      audioBlob,
    });
    expect(state.phase).toBe('ANALYZING');
    expect(state.audioBlob).toBe(audioBlob);
  });

  it('ANALYZING is only reachable via RECORDING_TIMER_COMPLETE or RETRY_SUBMISSION', () => {
    // Exhaustive check: none of the other recording-phase actions reach ANALYZING.
    const recordingState: ChallengeFlowState = { ...baseState, phase: 'RECORDING', audioBlob };
    const nonAnalyzingActions: ChallengeFlowAction[] = [
      { type: 'SILENCE_DETECTED' },
      { type: 'RE_RECORD' },
      { type: 'RECORDING_COMPLETE', audioBlob },
    ];
    for (const action of nonAnalyzingActions) {
      const next = challengeFlowReducer(recordingState, action);
      expect(next.phase).not.toBe('ANALYZING');
    }
  });
});

// ── NO_SPEECH_DETECTED from FEEDBACK → RE_RECORD (not RETRY_SUBMISSION) ───────

describe('Retry behavior: NO_SPEECH_DETECTED must discard old blob, not resubmit', () => {
  const feedbackStateNoSpeech: ChallengeFlowState = {
    ...baseState,
    phase: 'FEEDBACK',
    audioBlob,   // stale silent blob
    evaluationResult: {
      success: false,
      error: { type: 'NO_SPEECH_DETECTED', message: 'No speech detected.' },
    },
    phaseError: null,
  };

  it('RE_RECORD from FEEDBACK transitions to RECORDING and clears the blob', () => {
    const result = challengeFlowReducer(feedbackStateNoSpeech, { type: 'RE_RECORD' });
    expect(result.phase).toBe('RECORDING');
    expect(result.audioBlob).toBeNull();
    expect(result.phaseError).toBeNull();
  });

  it('RETRY_SUBMISSION from FEEDBACK keeps the blob — only correct for non-speech errors', () => {
    // RETRY_SUBMISSION is correct for network/timeout errors (where blob is valid).
    // The FeedbackScreen must NOT offer this for NO_SPEECH_DETECTED.
    const result = challengeFlowReducer(feedbackStateNoSpeech, { type: 'RETRY_SUBMISSION' });
    expect(result.phase).toBe('ANALYZING');
    // blob is retained — this is why NO_SPEECH_DETECTED must use RE_RECORD instead
    expect(result.audioBlob).toBe(audioBlob);
  });

  it('START_NEW_CHALLENGE from FEEDBACK resets all state', () => {
    const result = challengeFlowReducer(feedbackStateNoSpeech, { type: 'START_NEW_CHALLENGE' });
    expect(result.phase).toBe('FRAMEWORK_SELECTION');
    expect(result.audioBlob).toBeNull();
    expect(result.evaluationResult).toBeNull();
  });
});
