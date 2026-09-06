// Feature: fluentup-mvp, Property 2: Topic generation validation
//
// Property 2: Topic generation validation enforces exactly 10 distinct topics
//
// Validates: Requirements 2.1, 2.4, 2.5, 6.6, 6.7

import * as fc from 'fast-check';
import {
  generateTopics,
  validateAndAssignTopics,
  GeminiCaller,
} from '../topic-generation-service';
import { TopicGenerationRequest } from '@/types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** A minimal valid TopicGenerationRequest for driving the service. */
const baseRequest: TopicGenerationRequest = {
  frameworkId: 'prep',
  frameworkName: 'PREP',
  frameworkDescription: 'Point, Reason, Example, Point restatement.',
  structuralSteps: ['1. Point', '2. Reason', '3. Example', '4. Restate'],
  evaluationCriteria: [
    { id: 'prep_point', label: 'Clear Point', description: 'Opens with a clear, direct point.' },
  ],
};

/**
 * Build a stub GeminiCaller that resolves with the given raw JSON string.
 */
function makeStub(rawJson: string): GeminiCaller {
  return async (_prompt: string) => rawJson;
}

/**
 * Build a stub GeminiCaller that rejects with the given error.
 */
function makeErrorStub(err: Error): GeminiCaller {
  return async (_prompt: string) => {
    throw err;
  };
}

/**
 * fast-check arbitrary: generates an array of N unique non-empty topic-text strings.
 * Each string is a non-empty printable ASCII string up to 80 chars.
 */
const topicTextArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

/**
 * Generate an array of `count` distinct topic-text strings.
 */
function distinctTextsArb(count: number) {
  return fc
    .uniqueArray(topicTextArb, { minLength: count, maxLength: count })
    .filter((arr) => {
      // Extra guard: ensure case-insensitive uniqueness too.
      const lower = arr.map((s) => s.trim().toLowerCase());
      return new Set(lower).size === arr.length;
    });
}

/**
 * Build raw Gemini JSON from an array of text strings.
 */
function toRawJson(texts: string[]): string {
  return JSON.stringify({ topics: texts.map((text) => ({ text })) });
}

// ── Property tests ────────────────────────────────────────────────────────────

describe('P2: Topic generation validation (property tests)', () => {

  // ── P2a ────────────────────────────────────────────────────────────────────
  it(
    'P2a: when AI returns more than 10 valid distinct topics, result contains exactly the first 10',
    async () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      await fc.assert(
        fc.asyncProperty(
          // Generate between 11 and 20 distinct topic texts.
          fc.integer({ min: 11, max: 20 }).chain((n) =>
            distinctTextsArb(n).map((texts) => ({ n, texts })),
          ),
          async ({ texts }) => {
            const caller = makeStub(toRawJson(texts));
            const response = await generateTopics(baseRequest, caller);

            expect(response.success).toBe(true);
            if (!response.success) return; // type narrowing

            expect(response.result.topics).toHaveLength(10);

            // Must be the FIRST 10 texts (order preserved after trim).
            const expectedFirst10 = texts.slice(0, 10).map((t) => t.trim());
            const actualTexts = response.result.topics.map((t) => t.text);
            expect(actualTexts).toEqual(expectedFirst10);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P2b ────────────────────────────────────────────────────────────────────
  it(
    'P2b: when AI returns fewer than 10 topics, service returns failure with INSUFFICIENT_TOPICS',
    async () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      await fc.assert(
        fc.asyncProperty(
          // 0 to 9 valid distinct texts.
          fc.integer({ min: 0, max: 9 }).chain((n) =>
            n === 0
              ? fc.constant([] as string[])
              : distinctTextsArb(n),
          ),
          async (texts) => {
            const caller = makeStub(toRawJson(texts));
            const response = await generateTopics(baseRequest, caller);

            expect(response.success).toBe(false);
            if (response.success) return;

            expect(response.error.type).toBe('INSUFFICIENT_TOPICS');
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P2c ────────────────────────────────────────────────────────────────────
  it(
    'P2c: when AI returns duplicates that reduce distinct count below 10, service returns failure',
    async () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      await fc.assert(
        fc.asyncProperty(
          // Generate 5–9 distinct base texts, then repeat some to create duplicates,
          // ensuring total raw count is >= 10 but distinct count stays < 10.
          fc.integer({ min: 5, max: 9 }).chain((distinctCount) =>
            distinctTextsArb(distinctCount).chain((baseTexts) =>
              // Build a padded list with duplicates to reach at least 10 raw entries.
              fc
                .array(fc.integer({ min: 0, max: distinctCount - 1 }), {
                  minLength: 10 - distinctCount,
                  maxLength: 10,
                })
                .map((indices) => {
                  const extras = indices.map((i) => baseTexts[i]);
                  return [...baseTexts, ...extras];
                }),
            ),
          ),
          async (textsWithDuplicates) => {
            const caller = makeStub(toRawJson(textsWithDuplicates));
            const response = await generateTopics(baseRequest, caller);

            expect(response.success).toBe(false);
            if (response.success) return;

            // Service must report duplicate or insufficient — both are valid
            // classifications when duplicates exhaust the distinct count.
            expect(['DUPLICATE_TOPICS', 'INSUFFICIENT_TOPICS']).toContain(
              response.error.type,
            );
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P2d ────────────────────────────────────────────────────────────────────
  it(
    'P2d: on the success path, result always contains exactly 10 topics with IDs generated-1 through generated-10',
    async () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      await fc.assert(
        fc.asyncProperty(
          // Exactly 10 to 15 distinct texts — all should succeed and produce exactly 10.
          fc.integer({ min: 10, max: 15 }).chain((n) => distinctTextsArb(n)),
          async (texts) => {
            const caller = makeStub(toRawJson(texts));
            const response = await generateTopics(baseRequest, caller);

            expect(response.success).toBe(true);
            if (!response.success) return;

            const { topics } = response.result;

            // Exactly 10 topics.
            expect(topics).toHaveLength(10);

            // IDs must be generated-1 through generated-10.
            const expectedIds = Array.from({ length: 10 }, (_, i) => `generated-${i + 1}`);
            const actualIds = topics.map((t) => t.id);
            expect(actualIds).toEqual(expectedIds);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P2e ────────────────────────────────────────────────────────────────────
  it(
    'P2e: on the success path, all topic texts are non-empty strings',
    async () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10, max: 15 }).chain((n) => distinctTextsArb(n)),
          async (texts) => {
            const caller = makeStub(toRawJson(texts));
            const response = await generateTopics(baseRequest, caller);

            expect(response.success).toBe(true);
            if (!response.success) return;

            for (const topic of response.result.topics) {
              expect(typeof topic.text).toBe('string');
              expect(topic.text.trim().length).toBeGreaterThan(0);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P2f ────────────────────────────────────────────────────────────────────
  it(
    'P2f: service never pads — success result always has exactly 10, never more, never fewer',
    async () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      await fc.assert(
        fc.asyncProperty(
          // Cover the full range: 0 to 20 distinct texts.
          fc.integer({ min: 0, max: 20 }).chain((n) =>
            n === 0
              ? fc.constant([] as string[])
              : distinctTextsArb(n),
          ),
          async (texts) => {
            const caller = makeStub(toRawJson(texts));
            const response = await generateTopics(baseRequest, caller);

            if (response.success) {
              // Success path: exactly 10.
              expect(response.result.topics).toHaveLength(10);
              // Input must have had >= 10 distinct texts.
              expect(texts.length).toBeGreaterThanOrEqual(10);
            } else {
              // Failure path: no result topics to count — just verify no padding.
              expect(response.error.type).toBeDefined();
            }
          },
        ),
        { numRuns: 200 },
      );
    },
  );

  // ── Additional: validateAndAssignTopics unit-level property checks ──────────

  it(
    'P2-direct: validateAndAssignTopics trims whitespace and still produces non-empty topic texts',
    () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      fc.assert(
        fc.property(
          // Generate 10–15 topics where each has surrounding whitespace.
          fc.integer({ min: 10, max: 15 }).chain((n) =>
            fc
              .uniqueArray(
                topicTextArb.map((s) => `  ${s}  `),
                { minLength: n, maxLength: n },
              )
              .filter((arr) => {
                const lower = arr.map((s) => s.trim().toLowerCase());
                return new Set(lower).size === arr.length;
              }),
          ),
          (rawTexts) => {
            const raw = { topics: rawTexts.map((text) => ({ text })) };
            const response = validateAndAssignTopics(raw);

            expect(response.success).toBe(true);
            if (!response.success) return;

            for (const topic of response.result.topics) {
              // Should be trimmed.
              expect(topic.text).toBe(topic.text.trim());
              expect(topic.text.length).toBeGreaterThan(0);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'P2-schema: validateAndAssignTopics returns SCHEMA_MISMATCH for non-object inputs',
    () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      fc.assert(
        fc.property(
          // Anything that is NOT an object with a topics array.
          fc.oneof(
            fc.integer(),
            fc.string(),
            fc.boolean(),
            fc.constant(null),
            fc.constant(undefined),
            fc.record({ notTopics: fc.array(fc.string()) }),
          ),
          (badInput) => {
            const response = validateAndAssignTopics(badInput);
            expect(response.success).toBe(false);
            if (response.success) return;
            expect(response.error.type).toBe('SCHEMA_MISMATCH');
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'P2-timeout: generateTopics returns TIMEOUT error when caller throws timeout error',
    async () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      const timeoutError = Object.assign(new Error('TIMEOUT'), { isTimeout: true });
      const caller = makeErrorStub(timeoutError);
      const response = await generateTopics(baseRequest, caller);
      expect(response.success).toBe(false);
      if (response.success) return;
      expect(response.error.type).toBe('TIMEOUT');
    },
  );

  it(
    'P2-provider-error: generateTopics returns PROVIDER_ERROR when caller throws a generic error',
    async () => {
      // Feature: fluentup-mvp, Property 2: Topic generation validation
      const caller = makeErrorStub(new Error('Network failure'));
      const response = await generateTopics(baseRequest, caller);
      expect(response.success).toBe(false);
      if (response.success) return;
      expect(response.error.type).toBe('PROVIDER_ERROR');
    },
  );
});
