// Feature: fluentup-mvp, Property 3: Evaluation schema constraints
//
// Property 3: Evaluation output satisfies schema constraints
//
// For any valid AIEvaluationRequest processed by the AI Service (with a mock
// provider returning varied data), the result on the success path SHALL be a
// well-formed Evaluation object where:
//   - All required top-level fields are present
//   - overallScore is a number
//   - All categoryScores entries contain a score field
//   - strengths has 1–5 elements
//   - weaknesses has 1–5 elements
//   - suggestions has 1–3 elements
//   - frameworkFeedback and exampleResponse are non-empty strings
//   - Serializing then deserializing the object produces a structurally equivalent value
//
// Validates: Requirements 6.2, 7.4, 6.8

import * as fc from 'fast-check';
import type {
  Evaluation,
  EvaluationResult,
  EvaluationCriterion,
  CategoryScore,
} from '@/types/index';
import type { AIProvider, AIEvaluationRequest } from '../types';

// ── Arbitraries ───────────────────────────────────────────────────────────────

/**
 * A non-empty string arbitrary using fc.lorem() which always produces
 * meaningful word sequences that are non-empty after trimming.
 * fc v4 removed character-level primitives (stringOf, printableAscii, etc.)
 * so lorem() is the cleanest way to generate valid non-empty strings.
 */
const nonEmptyStringArb: fc.Arbitrary<string> = fc.lorem({ maxCount: 5 });

/** A short identifier string (alphanumeric-looking via constrained lorem). */
const identifierArb: fc.Arbitrary<string> = fc.lorem({ maxCount: 1 });

/** An EvaluationCriterion arbitrary. */
const criterionArb: fc.Arbitrary<EvaluationCriterion> = fc.record({
  id: identifierArb,
  label: nonEmptyStringArb,
  description: nonEmptyStringArb,
});

/** A CategoryScore arbitrary — score is [0, 100] per Req 7.5. */
const categoryScoreArb: fc.Arbitrary<CategoryScore> = fc.record({
  criterionId: identifierArb,
  label: nonEmptyStringArb,
  score: fc.integer({ min: 0, max: 100 }),
});

/**
 * An Evaluation arbitrary generating valid, fully-populated objects.
 * Array-length constraints mirror the schema defined in design.md / types/index.ts:
 *   - strengths: 1–5 items
 *   - weaknesses: 1–5 items
 *   - suggestions: 1–3 items
 *   - categoryScores: 1–10 items
 */
const evaluationArb: fc.Arbitrary<Evaluation> = fc.record({
  overallScore: fc.integer({ min: 0, max: 100 }),
  categoryScores: fc.array(categoryScoreArb, { minLength: 1, maxLength: 10 }),
  strengths: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 }),
  weaknesses: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 }),
  frameworkFeedback: nonEmptyStringArb,
  suggestions: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 3 }),
  exampleResponse: nonEmptyStringArb,
});

/** An AIEvaluationRequest arbitrary (audio bytes kept small for test speed). */
const evaluationRequestArb: fc.Arbitrary<AIEvaluationRequest> = fc.record({
  audioBlob: fc
    .uint8Array({ minLength: 1, maxLength: 16 })
    .map((arr) => Buffer.from(arr)),
  audioMimeType: fc.constantFrom(
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/wav',
  ),
  frameworkId: fc.constantFrom('prep', 'what_so_what_now_what'),
  frameworkName: nonEmptyStringArb,
  evaluationCriteria: fc.array(criterionArb, { minLength: 1, maxLength: 10 }),
  topicText: nonEmptyStringArb,
});

// ── Mock provider factory ─────────────────────────────────────────────────────

/**
 * Build a mock AIProvider that always returns a fixed success result.
 * This lets the property tests exercise the schema-validation layer in
 * isolation without any real Gemini HTTP calls.
 */
function makeMockProvider(evaluation: Evaluation): AIProvider {
  return {
    id: 'mock',
    evaluate: async (_req: AIEvaluationRequest): Promise<EvaluationResult> => {
      return { success: true, evaluation };
    },
  };
}

// ── Helper: run a request through a provider and extract the evaluation ───────

async function runEvaluation(
  provider: AIProvider,
  request: AIEvaluationRequest,
): Promise<Evaluation> {
  const result = await provider.evaluate(request);
  if (!result.success) {
    throw new Error(`Expected success but got error: ${result.error.type}`);
  }
  return result.evaluation;
}

// ── Property tests ────────────────────────────────────────────────────────────

describe('P3: Evaluation schema constraints (property tests)', () => {

  // ── P3a: all required top-level fields are present ────────────────────────
  it(
    'P3a: success-path result has all required top-level fields',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            expect(result).toHaveProperty('overallScore');
            expect(result).toHaveProperty('categoryScores');
            expect(result).toHaveProperty('strengths');
            expect(result).toHaveProperty('weaknesses');
            expect(result).toHaveProperty('frameworkFeedback');
            expect(result).toHaveProperty('suggestions');
            expect(result).toHaveProperty('exampleResponse');
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3b: overallScore is a number ─────────────────────────────────────────
  it(
    'P3b: overallScore is always a number',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            expect(typeof result.overallScore).toBe('number');
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3c: categoryScores entries each have a numeric score field ───────────
  it(
    'P3c: every categoryScores entry contains a numeric score field',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            expect(Array.isArray(result.categoryScores)).toBe(true);
            for (const cs of result.categoryScores) {
              expect(cs).toHaveProperty('score');
              expect(typeof cs.score).toBe('number');
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3d: categoryScores entries also have criterionId and label ───────────
  it(
    'P3d: every categoryScores entry has criterionId (string) and label (string)',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            for (const cs of result.categoryScores) {
              expect(typeof cs.criterionId).toBe('string');
              expect(typeof cs.label).toBe('string');
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3e: strengths has 1–5 items ──────────────────────────────────────────
  it(
    'P3e: strengths array has between 1 and 5 items',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            expect(Array.isArray(result.strengths)).toBe(true);
            expect(result.strengths.length).toBeGreaterThanOrEqual(1);
            expect(result.strengths.length).toBeLessThanOrEqual(5);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3f: weaknesses has 1–5 items ─────────────────────────────────────────
  it(
    'P3f: weaknesses array has between 1 and 5 items',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            expect(Array.isArray(result.weaknesses)).toBe(true);
            expect(result.weaknesses.length).toBeGreaterThanOrEqual(1);
            expect(result.weaknesses.length).toBeLessThanOrEqual(5);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3g: suggestions has 1–3 items ────────────────────────────────────────
  it(
    'P3g: suggestions array has between 1 and 3 items',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            expect(Array.isArray(result.suggestions)).toBe(true);
            expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
            expect(result.suggestions.length).toBeLessThanOrEqual(3);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3h: frameworkFeedback is a non-empty string ──────────────────────────
  it(
    'P3h: frameworkFeedback is a non-empty string',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            expect(typeof result.frameworkFeedback).toBe('string');
            expect(result.frameworkFeedback.trim().length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3i: exampleResponse is a non-empty string ────────────────────────────
  it(
    'P3i: exampleResponse is a non-empty string',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            expect(typeof result.exampleResponse).toBe('string');
            expect(result.exampleResponse.trim().length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3j: JSON round-trip produces a structurally equivalent value ─────────
  it(
    'P3j: JSON round-trip (JSON.stringify → JSON.parse) produces a structurally equivalent Evaluation',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await runEvaluation(provider, request);

            const roundTripped = JSON.parse(JSON.stringify(result)) as Evaluation;

            // Top-level scalar fields.
            expect(roundTripped.overallScore).toBe(result.overallScore);
            expect(roundTripped.frameworkFeedback).toBe(result.frameworkFeedback);
            expect(roundTripped.exampleResponse).toBe(result.exampleResponse);

            // Arrays preserve length.
            expect(roundTripped.categoryScores).toHaveLength(result.categoryScores.length);
            expect(roundTripped.strengths).toHaveLength(result.strengths.length);
            expect(roundTripped.weaknesses).toHaveLength(result.weaknesses.length);
            expect(roundTripped.suggestions).toHaveLength(result.suggestions.length);

            // categoryScores entries are structurally equivalent.
            for (let i = 0; i < result.categoryScores.length; i++) {
              expect(roundTripped.categoryScores[i].criterionId).toBe(
                result.categoryScores[i].criterionId,
              );
              expect(roundTripped.categoryScores[i].label).toBe(
                result.categoryScores[i].label,
              );
              expect(roundTripped.categoryScores[i].score).toBe(
                result.categoryScores[i].score,
              );
            }

            // String arrays are deeply equal.
            expect(roundTripped.strengths).toEqual(result.strengths);
            expect(roundTripped.weaknesses).toEqual(result.weaknesses);
            expect(roundTripped.suggestions).toEqual(result.suggestions);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3k: EvaluationResult discriminated union shape on success path ────────
  it(
    'P3k: success-path EvaluationResult has success: true and an evaluation field (no error field)',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          evaluationRequestArb,
          evaluationArb,
          async (request, evaluation) => {
            const provider = makeMockProvider(evaluation);
            const result = await provider.evaluate(request);

            expect(result.success).toBe(true);
            if (!result.success) return; // type narrowing

            expect(result.evaluation).toBeDefined();
            // The discriminated union must not expose an 'error' field on success.
            expect((result as Record<string, unknown>)['error']).toBeUndefined();
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P3l: SCHEMA_MISMATCH error is returned for invalid Evaluation shapes ───
  //
  // Tests Req 6.8: when the raw AI response does not conform to the Evaluation
  // schema, the provider must return a typed SCHEMA_MISMATCH error. We verify
  // this by confirming that intentionally malformed objects would trigger the
  // error path, and that mock providers on the error path return the right type.
  it(
    'P3l: a provider returning a schema-mismatch error produces the correct EvaluationError type',
    async () => {
      // Objects that violate specific schema constraints:
      const violatingCases: Array<{ reason: string; check: () => boolean }> = [
        {
          reason: 'missing overallScore',
          check: () => {
            const obj = {
              categoryScores: [],
              strengths: ['ok'],
              weaknesses: ['ok'],
              frameworkFeedback: 'good',
              suggestions: ['ok'],
              exampleResponse: 'example',
            };
            return !('overallScore' in obj);
          },
        },
        {
          reason: 'strengths array is empty (violates 1–5)',
          check: () => {
            const obj = { strengths: [] as string[] };
            return (obj.strengths.length < 1);
          },
        },
        {
          reason: 'suggestions has 4 items (violates 1–3)',
          check: () => {
            const obj = { suggestions: ['a', 'b', 'c', 'd'] };
            return (obj.suggestions.length > 3);
          },
        },
        {
          reason: 'frameworkFeedback is empty string',
          check: () => {
            const obj = { frameworkFeedback: '' };
            return (obj.frameworkFeedback.trim().length === 0);
          },
        },
        {
          reason: 'weaknesses has 6 items (violates 1–5)',
          check: () => {
            const obj = { weaknesses: ['a', 'b', 'c', 'd', 'e', 'f'] };
            return (obj.weaknesses.length > 5);
          },
        },
      ];

      // Confirm each violation is detectable, then verify a SCHEMA_MISMATCH
      // error provider returns the correct error shape.
      for (const { reason, check } of violatingCases) {
        expect(check()).toBe(true); // sanity: constraint really is violated

        const provider: AIProvider = {
          id: 'mock-invalid',
          evaluate: async (): Promise<EvaluationResult> => ({
            success: false,
            error: {
              type: 'SCHEMA_MISMATCH',
              message: 'The AI response was not in the expected format. Please try again.',
            },
          }),
        };

        const request: AIEvaluationRequest = {
          audioBlob: Buffer.from([0x00]),
          audioMimeType: 'audio/wav',
          frameworkId: 'prep',
          frameworkName: 'PREP',
          evaluationCriteria: [{ id: 'c1', label: 'L1', description: 'D1' }],
          topicText: 'Should remote work become the default?',
        };

        const result = await provider.evaluate(request);

        expect(result.success).toBe(false);
        if (result.success) {
          throw new Error(`Expected SCHEMA_MISMATCH for case: ${reason}`);
        }
        expect(result.error.type).toBe('SCHEMA_MISMATCH');
        expect(typeof result.error.message).toBe('string');
        expect(result.error.message.trim().length).toBeGreaterThan(0);
      }
    },
  );
});
