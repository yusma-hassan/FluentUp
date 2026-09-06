// Feature: fluentup-mvp, Property 8: State machine phase validity

import * as fc from 'fast-check';
import { challengeFlowReducer } from '../ChallengeContext';
import type {
  ChallengeFlowAction,
  ChallengeFlowState,
  ChallengePhase,
  Framework,
  GeneratedTopic,
  TopicSlot,
  FrameworkSlot,
  Evaluation,
  EvaluationError,
  TopicGenerationError,
  CategoryScore,
} from '@/types';

// ── Valid phase set ────────────────────────────────────────────────────────────

const VALID_PHASES: ReadonlySet<ChallengePhase> = new Set([
  'FRAMEWORK_SELECTION',
  'GENERATING_TOPICS',
  'TOPIC_SELECTION',
  'TOPIC_DISPLAY',
  'CHALLENGE_SCREEN',
  'PREPARATION',
  'RECORDING',
  'ANALYZING',
  'FEEDBACK',
]);

// ── Arbitraries for domain types ───────────────────────────────────────────────

const arbNonEmptyString = fc.string({ minLength: 1, maxLength: 40 });

const arbEvaluationCriterion = fc.record({
  id: arbNonEmptyString,
  label: arbNonEmptyString,
  description: arbNonEmptyString,
});

const arbFramework: fc.Arbitrary<Framework> = fc.record({
  id: arbNonEmptyString,
  name: arbNonEmptyString,
  description: arbNonEmptyString,
  structuralSteps: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 5 }),
  evaluationCriteria: fc.array(arbEvaluationCriterion, { minLength: 1, maxLength: 6 }),
  preparationTimeSeconds: fc.integer({ min: 1, max: 60 }),
  speakingTimeSeconds: fc.integer({ min: 10, max: 120 }),
});

const arbGeneratedTopic: fc.Arbitrary<GeneratedTopic> = fc.record({
  id: arbNonEmptyString,
  text: arbNonEmptyString,
});

const arbTopicSlot: fc.Arbitrary<TopicSlot> = fc.record({
  slot: fc.integer({ min: 1, max: 10 }),
  item: arbGeneratedTopic,
});

const arbFrameworkSlot: fc.Arbitrary<FrameworkSlot> = fc.record({
  slot: fc.integer({ min: 1, max: 10 }),
  item: arbFramework,
});

const arbCategoryScore: fc.Arbitrary<CategoryScore> = fc.record({
  criterionId: arbNonEmptyString,
  label: arbNonEmptyString,
  score: fc.integer({ min: 0, max: 100 }),
});

const arbEvaluation: fc.Arbitrary<Evaluation> = fc.record({
  overallScore: fc.integer({ min: 0, max: 100 }),
  categoryScores: fc.array(arbCategoryScore, { minLength: 0, maxLength: 6 }),
  strengths: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 5 }),
  weaknesses: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 5 }),
  frameworkFeedback: arbNonEmptyString,
  suggestions: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 3 }),
  exampleResponse: arbNonEmptyString,
});

const arbEvaluationError: fc.Arbitrary<EvaluationError> = fc.record({
  type: fc.constantFrom('TIMEOUT', 'SCHEMA_MISMATCH', 'PROVIDER_ERROR', 'VALIDATION_ERROR'),
  message: arbNonEmptyString,
});

const arbTopicGenerationError: fc.Arbitrary<TopicGenerationError> = fc.record({
  type: fc.constantFrom(
    'TIMEOUT',
    'SCHEMA_MISMATCH',
    'PROVIDER_ERROR',
    'VALIDATION_ERROR',
    'INSUFFICIENT_TOPICS',
    'DUPLICATE_TOPICS'
  ),
  message: arbNonEmptyString,
});

// Build a Blob-like object that satisfies the type (jsdom environment provides Blob)
const arbBlob: fc.Arbitrary<Blob> = fc
  .uint8Array({ minLength: 0, maxLength: 16 })
  .map((bytes) => new Blob([bytes], { type: 'audio/webm' }));

// ── Arbitrary for all 15 action types ─────────────────────────────────────────

const arbAction: fc.Arbitrary<ChallengeFlowAction> = fc.oneof(
  arbFramework.map((framework) => ({ type: 'SELECT_FRAMEWORK' as const, framework })),
  fc.constant({ type: 'CONFIRM_FRAMEWORK' as const }),
  fc.array(arbTopicSlot, { minLength: 0, maxLength: 10 }).map((topicSlots) => ({
    type: 'TOPICS_GENERATED' as const,
    topicSlots,
  })),
  arbTopicGenerationError.map((error) => ({ type: 'TOPIC_GENERATION_ERROR' as const, error })),
  fc.constant({ type: 'RETRY_TOPIC_GENERATION' as const }),
  arbGeneratedTopic.map((topic) => ({ type: 'SELECT_TOPIC' as const, topic })),
  fc.constant({ type: 'CONFIRM_TOPIC' as const }),
  fc.constant({ type: 'PREP_COMPLETE' as const }),
  fc.constant({ type: 'SKIP_PREP' as const }),
  fc.constant({ type: 'TOPIC_DISPLAY_COMPLETE' as const }),
  fc.constant({ type: 'ADD_PREPARATION_TIME' as const }),
  arbBlob.map((audioBlob) => ({ type: 'RECORDING_COMPLETE' as const, audioBlob })),
  arbBlob.map((audioBlob) => ({ type: 'RECORDING_TIMER_COMPLETE' as const, audioBlob })),
  fc.constant({ type: 'SUBMIT_FOR_ANALYSIS' as const }),
  arbEvaluation.map((evaluation) => ({ type: 'ANALYSIS_SUCCESS' as const, evaluation })),
  arbEvaluationError.map((error) => ({ type: 'ANALYSIS_ERROR' as const, error })),
  fc.constant({ type: 'RETRY_SUBMISSION' as const }),
  fc.constant({ type: 'RE_RECORD' as const }),
  fc.constant({ type: 'START_NEW_CHALLENGE' as const }),
  fc.constant({ type: 'SILENCE_DETECTED' as const })
);

// ── Arbitrary for varied starting states covering all 8 phases ────────────────

const arbPhase: fc.Arbitrary<ChallengePhase> = fc.constantFrom(
  'FRAMEWORK_SELECTION',
  'GENERATING_TOPICS',
  'TOPIC_SELECTION',
  'CHALLENGE_SCREEN',
  'PREPARATION',
  'RECORDING',
  'ANALYZING',
  'FEEDBACK'
);

const arbState: fc.Arbitrary<ChallengeFlowState> = fc
  .tuple(
    arbPhase,
    fc.array(arbFrameworkSlot, { minLength: 0, maxLength: 10 }),
    fc.array(arbTopicSlot, { minLength: 0, maxLength: 10 }),
    fc.option(arbFramework, { nil: null }),
    fc.option(arbGeneratedTopic, { nil: null }),
    fc.option(arbBlob, { nil: null }),
    fc.option(
      fc.oneof(
        arbEvaluation.map((evaluation) => ({ success: true as const, evaluation })),
        arbEvaluationError.map((error) => ({ success: false as const, error }))
      ),
      { nil: null }
    ),
    fc.option(arbTopicGenerationError, { nil: null }),
    fc.option(arbNonEmptyString, { nil: null })
  )
  .map(
    ([
      phase,
      frameworkSlots,
      topicSlots,
      selectedFramework,
      selectedTopic,
      audioBlob,
      evaluationResult,
      topicGenerationError,
      phaseError,
    ]): ChallengeFlowState => ({
      phase,
      frameworkSlots,
      topicSlots,
      selectedFramework,
      selectedTopic,
      audioBlob,
      evaluationResult,
      topicGenerationError,
      phaseError,
    })
  );

// ── Property 8 ────────────────────────────────────────────────────────────────

describe('Property 8: State machine phase validity', () => {
  it('reducer always returns one of the 8 valid ChallengePhase values regardless of input', () => {
    fc.assert(
      fc.property(arbState, arbAction, (state, action) => {
        // Assert the reducer never throws
        let result: ChallengeFlowState;
        expect(() => {
          result = challengeFlowReducer(state, action);
        }).not.toThrow();

        // Assert the resulting phase is always a valid ChallengePhase literal
        expect(VALID_PHASES.has(result!.phase)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('reducer produces valid phase after every action in an arbitrary sequence', () => {
    fc.assert(
      fc.property(
        arbState,
        fc.array(arbAction, { minLength: 1, maxLength: 20 }),
        (initialState, actions) => {
          let current = initialState;

          for (const action of actions) {
            expect(() => {
              current = challengeFlowReducer(current, action);
            }).not.toThrow();

            expect(VALID_PHASES.has(current.phase)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('reducer is a total function — never throws for any state/action combination', () => {
    fc.assert(
      fc.property(arbState, arbAction, (state, action) => {
        expect(() => challengeFlowReducer(state, action)).not.toThrow();
      }),
      { numRuns: 200 }
    );
  });
});
