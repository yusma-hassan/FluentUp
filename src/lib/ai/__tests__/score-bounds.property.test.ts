// Feature: fluentup-mvp, Property 4: Score bounds
//
// Property 4: Server-side score bounds are always in range
//
// For any Evaluation object returned by the AI Service, the overallScore and
// every categoryScore.score value SHALL be a number in the closed interval
// [0, 100].
//
// Validates: Requirements 7.4, 7.5

import * as fc from 'fast-check';
import type { Evaluation, CategoryScore } from '@/types/index';
import { validateScoreBounds } from '../score-validator';

// ── Arbitraries ───────────────────────────────────────────────────────────────

const nonEmptyStringArb: fc.Arbitrary<string> = fc.lorem({ maxCount: 5 });
const identifierArb: fc.Arbitrary<string> = fc.lorem({ maxCount: 1 });

/**
 * A CategoryScore arbitrary with score values that may fall anywhere in the
 * integer range, including negative numbers and values > 100, so the property
 * tests can distinguish in-range from out-of-range entries.
 */
const categoryScoreAnyArb: fc.Arbitrary<CategoryScore> = fc.record({
  criterionId: identifierArb,
  label: nonEmptyStringArb,
  score: fc.integer({ min: -1000, max: 1000 }),
});

/** CategoryScore constrained to the valid [0, 100] range. */
const categoryScoreValidArb: fc.Arbitrary<CategoryScore> = fc.record({
  criterionId: identifierArb,
  label: nonEmptyStringArb,
  score: fc.integer({ min: 0, max: 100 }),
});

/** CategoryScore with score guaranteed to be out of [0, 100]. */
const categoryScoreOutOfRangeArb: fc.Arbitrary<CategoryScore> = fc.record({
  criterionId: identifierArb,
  label: nonEmptyStringArb,
  score: fc.oneof(
    fc.integer({ min: -1000, max: -1 }),
    fc.integer({ min: 101, max: 1000 }),
  ),
});

/**
 * A fully populated Evaluation with all numeric scores in [0, 100].
 */
const evaluationInRangeArb: fc.Arbitrary<Evaluation> = fc.record({
  overallScore: fc.integer({ min: 0, max: 100 }),
  categoryScores: fc.array(categoryScoreValidArb, {
    minLength: 1,
    maxLength: 10,
  }),
  strengths: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 }),
  weaknesses: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 }),
  frameworkFeedback: nonEmptyStringArb,
  suggestions: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 3 }),
  exampleResponse: nonEmptyStringArb,
});

/**
 * An Evaluation where overallScore is out of range (negative or > 100).
 */
const evaluationOverallOutOfRangeArb: fc.Arbitrary<Evaluation> = fc
  .record({
    overallScore: fc.oneof(
      fc.integer({ min: -1000, max: -1 }),
      fc.integer({ min: 101, max: 1000 }),
    ),
    categoryScores: fc.array(categoryScoreValidArb, {
      minLength: 1,
      maxLength: 10,
    }),
    strengths: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 }),
    weaknesses: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 }),
    frameworkFeedback: nonEmptyStringArb,
    suggestions: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 3 }),
    exampleResponse: nonEmptyStringArb,
  });

/**
 * An Evaluation where at least one categoryScore.score is out of range.
 */
const evaluationCategoryOutOfRangeArb: fc.Arbitrary<Evaluation> = fc.record({
  overallScore: fc.integer({ min: 0, max: 100 }),
  // At least one out-of-range entry guaranteed.
  categoryScores: fc
    .tuple(
      categoryScoreOutOfRangeArb,
      fc.array(categoryScoreAnyArb, { minLength: 0, maxLength: 9 }),
    )
    .map(([bad, rest]) => [bad, ...rest]),
  strengths: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 }),
  weaknesses: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 }),
  frameworkFeedback: nonEmptyStringArb,
  suggestions: fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 3 }),
  exampleResponse: nonEmptyStringArb,
});

// ── Property tests ────────────────────────────────────────────────────────────

describe('P4: Score bounds (property tests)', () => {

  // ── P4a: validateScoreBounds returns true for in-range Evaluations ────────
  it(
    'P4a: validateScoreBounds returns true when overallScore and all categoryScores are in [0, 100]',
    () => {
      fc.assert(
        fc.property(evaluationInRangeArb, (evaluation) => {
          expect(validateScoreBounds(evaluation)).toBe(true);
        }),
        { numRuns: 100 },
      );
    },
  );

  // ── P4b: overallScore out of range → validateScoreBounds returns false ────
  it(
    'P4b: validateScoreBounds returns false when overallScore is outside [0, 100]',
    () => {
      fc.assert(
        fc.property(evaluationOverallOutOfRangeArb, (evaluation) => {
          expect(validateScoreBounds(evaluation)).toBe(false);
        }),
        { numRuns: 100 },
      );
    },
  );

  // ── P4c: any categoryScore out of range → validateScoreBounds returns false
  it(
    'P4c: validateScoreBounds returns false when any categoryScore.score is outside [0, 100]',
    () => {
      fc.assert(
        fc.property(evaluationCategoryOutOfRangeArb, (evaluation) => {
          expect(validateScoreBounds(evaluation)).toBe(false);
        }),
        { numRuns: 100 },
      );
    },
  );

  // ── P4d: boundary values (0 and 100) are accepted ────────────────────────
  it(
    'P4d: boundary scores of exactly 0 and 100 are both accepted as valid',
    () => {
      const boundaryEvaluation: Evaluation = {
        overallScore: 0,
        categoryScores: [
          { criterionId: 'c1', label: 'Zero Score', score: 0 },
          { criterionId: 'c2', label: 'Max Score', score: 100 },
        ],
        strengths: ['good'],
        weaknesses: ['needs work'],
        frameworkFeedback: 'feedback',
        suggestions: ['improve'],
        exampleResponse: 'example',
      };
      expect(validateScoreBounds(boundaryEvaluation)).toBe(true);

      const maxEvaluation: Evaluation = {
        ...boundaryEvaluation,
        overallScore: 100,
      };
      expect(validateScoreBounds(maxEvaluation)).toBe(true);
    },
  );

  // ── P4e: scores just outside boundaries are rejected ─────────────────────
  it(
    'P4e: overallScore of -1 or 101 is rejected',
    () => {
      const base: Evaluation = {
        overallScore: 50,
        categoryScores: [{ criterionId: 'c1', label: 'L1', score: 50 }],
        strengths: ['ok'],
        weaknesses: ['ok'],
        frameworkFeedback: 'feedback',
        suggestions: ['ok'],
        exampleResponse: 'example',
      };

      expect(validateScoreBounds({ ...base, overallScore: -1 })).toBe(false);
      expect(validateScoreBounds({ ...base, overallScore: 101 })).toBe(false);
    },
  );

  it(
    'P4f: categoryScore.score of -1 or 101 is rejected',
    () => {
      const base: Evaluation = {
        overallScore: 50,
        categoryScores: [{ criterionId: 'c1', label: 'L1', score: 50 }],
        strengths: ['ok'],
        weaknesses: ['ok'],
        frameworkFeedback: 'feedback',
        suggestions: ['ok'],
        exampleResponse: 'example',
      };

      const tooLow: Evaluation = {
        ...base,
        categoryScores: [{ criterionId: 'c1', label: 'L1', score: -1 }],
      };
      const tooHigh: Evaluation = {
        ...base,
        categoryScores: [{ criterionId: 'c1', label: 'L1', score: 101 }],
      };

      expect(validateScoreBounds(tooLow)).toBe(false);
      expect(validateScoreBounds(tooHigh)).toBe(false);
    },
  );

  // ── P4g: empty categoryScores array — only overallScore matters ───────────
  it(
    'P4g: an Evaluation with no categoryScores passes when overallScore is in [0, 100]',
    () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 100 }), (overallScore) => {
          const evaluation: Evaluation = {
            overallScore,
            categoryScores: [],
            strengths: ['ok'],
            weaknesses: ['ok'],
            frameworkFeedback: 'feedback',
            suggestions: ['ok'],
            exampleResponse: 'example',
          };
          expect(validateScoreBounds(evaluation)).toBe(true);
        }),
        { numRuns: 100 },
      );
    },
  );
});
