// Feature: fluentup-mvp, Property 2: Topic generation validation
//
// Property 2: Topic generation validation enforces exactly 10 distinct topics
//
// Validates: Requirements 2.1, 2.4, 2.5, 6.6, 6.7

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import {
  generateTopics,
  validateAndAssignTopics,
  GeminiCaller,
} from '../topic-generation-service';
import { TopicGenerationRequest } from '@/types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Minimal valid TopicGenerationRequest for driving the service. */
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
 * Arbitrary that generates non-empty, non-whitespace-only strings
 * suitable as topic texts.
 */
const topicTextArb = fc
  .string({ minLength: 1, maxLength: 120 })
  .filter((s) => s.trim().length > 0);

/**
 * Returns an arbitrary array of exactly `n` case-insensitively unique topic texts.
 */
function exactlyNTopicsArb(n: number) {
  return fc
    .uniqueArray(topicTextArb, { minLength: n, maxLength: n })
    .filter((arr) => {
      const lower = arr.map((s) => s.trim().toLowerCase());
      return new Set(lower).size === arr.length;
    });
}

/** Builds the raw object payload that `validateAndAssignTopics` expects. */
const rawPayload = (texts: string[]) => ({ topics: texts.map((text) => ({ text })) });

/** Stub caller that resolves with a fixed JSON string. */
function makeResolveStub(rawJson: string): GeminiCaller {
  return async (_prompt: string) => rawJson;
}

/** Stub caller that rejects with the given error. */
function makeRejectStub(err: Error): GeminiCaller {
  return async (_prompt: string) => {
    throw err;
  };
}

// ── P2a ───────────────────────────────────────────────────────────────────────

describe('P2a: more than 10 valid distinct topics → exactly 10 kept (first 10, order preserved)', () => {
  it('returns success with exactly the first 10 topics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 11, max: 50 }).chain((n) =>
          exactlyNTopicsArb(n).map((texts) => ({ n, texts })),
        ),
        async ({ texts }) => {
          const response = validateAndAssignTopics(rawPayload(texts));

          expect(response.success).toBe(true);
          if (!response.success) return;

          // Exactly 10 returned.
          expect(response.result.topics).toHaveLength(10);

          // Must be the FIRST 10 texts (trimmed, order preserved).
          const expectedFirst10 = texts.slice(0, 10).map((t) => t.trim());
          const actualTexts = response.result.topics.map((t) => t.text);
          expect(actualTexts).toEqual(expectedFirst10);

          // IDs must be generated-1 through generated-10.
          const expectedIds = Array.from({ length: 10 }, (_, i) => `generated-${i + 1}`);
          expect(response.result.topics.map((t) => t.id)).toEqual(expectedIds);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P2b ───────────────────────────────────────────────────────────────────────

describe('P2b: fewer than 10 valid distinct topics → failure with typed error', () => {
  it('returns INSUFFICIENT_TOPICS for 0–9 valid distinct topics', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9 }).chain((n) =>
          n === 0 ? fc.constant([] as string[]) : exactlyNTopicsArb(n),
        ),
        (texts) => {
          const response = validateAndAssignTopics(rawPayload(texts));

          expect(response.success).toBe(false);
          if (response.success) return;

          // Only INSUFFICIENT_TOPICS is possible when there are no duplicates
          // and count < 10.
          expect(response.error.type).toBe('INSUFFICIENT_TOPICS');
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P2c ───────────────────────────────────────────────────────────────────────

describe('P2c: exactly 10 valid distinct topics → success with exactly 10', () => {
  it('returns exactly 10 topics with sequential IDs', () => {
    fc.assert(
      fc.property(
        exactlyNTopicsArb(10),
        (texts) => {
          const response = validateAndAssignTopics(rawPayload(texts));

          expect(response.success).toBe(true);
          if (!response.success) return;

          expect(response.result.topics).toHaveLength(10);

          const expectedIds = Array.from({ length: 10 }, (_, i) => `generated-${i + 1}`);
          expect(response.result.topics.map((t) => t.id)).toEqual(expectedIds);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P2d ───────────────────────────────────────────────────────────────────────

describe('P2d: duplicates reduce effective distinct count below 10 → failure', () => {
  it('returns DUPLICATE_TOPICS or INSUFFICIENT_TOPICS when duplicates exhaust the pool', () => {
    fc.assert(
      fc.property(
        // Generate 5–9 distinct base texts, then pad with duplicates so total
        // raw count is ≥ 10 but distinct count stays < 10.
        fc.integer({ min: 5, max: 9 }).chain((distinctCount) =>
          exactlyNTopicsArb(distinctCount).chain((baseTexts) =>
            fc
              .array(fc.integer({ min: 0, max: distinctCount - 1 }), {
                minLength: 10 - distinctCount,
                maxLength: 15,
              })
              .map((indices) => {
                const extras = indices.map((i) => baseTexts[i]);
                return [...baseTexts, ...extras];
              }),
          ),
        ),
        (textsWithDuplicates) => {
          const response = validateAndAssignTopics(rawPayload(textsWithDuplicates));

          expect(response.success).toBe(false);
          if (response.success) return;

          expect(['DUPLICATE_TOPICS', 'INSUFFICIENT_TOPICS']).toContain(
            response.error.type,
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P2e ───────────────────────────────────────────────────────────────────────

describe('P2e: whitespace-only topic texts are invalid', () => {
  it('rejects when all topics are whitespace-only', () => {
    // All whitespace → zero valid → INSUFFICIENT_TOPICS.
    // Generate whitespace-only strings by taking a non-empty string and
    // mapping it to repeated spaces of the same length.
    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 1, max: 20 }).map((n) => ' '.repeat(n)),
          { minLength: 1, maxLength: 15 },
        ),
        (whitespaceTexts) => {
          const response = validateAndAssignTopics(rawPayload(whitespaceTexts));
          expect(response.success).toBe(false);
          if (response.success) return;
          expect(response.error.type).toBe('INSUFFICIENT_TOPICS');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('succeeds when ≥ 10 non-whitespace topics remain after filtering whitespace-only ones', () => {
    fc.assert(
      fc.property(
        // Generate 10–15 valid unique texts, then sprinkle whitespace-only entries.
        fc.integer({ min: 10, max: 15 }).chain((n) =>
          exactlyNTopicsArb(n).chain((validTexts) =>
            fc
              .array(
                fc.integer({ min: 1, max: 5 }).map((len) => ' '.repeat(len)),
                { minLength: 0, maxLength: 5 },
              )
              .map((wsTexts) => {
                // Interleave whitespace-only entries among the valid ones.
                const mixed = [...validTexts];
                wsTexts.forEach((ws, i) => mixed.splice(i * 2, 0, ws));
                return mixed;
              }),
          ),
        ),
        (mixed) => {
          const response = validateAndAssignTopics(rawPayload(mixed));
          // Still has ≥ 10 valid after filtering, so must succeed.
          expect(response.success).toBe(true);
          if (!response.success) return;
          expect(response.result.topics).toHaveLength(10);
          for (const topic of response.result.topics) {
            expect(topic.text.trim().length).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── P2f ───────────────────────────────────────────────────────────────────────

describe('P2f: success path always produces exactly 10 topics with sequential IDs', () => {
  it('always returns exactly 10 topics with IDs generated-1 through generated-10', () => {
    fc.assert(
      fc.property(
        // Any count ≥ 10 should succeed.
        fc.integer({ min: 10, max: 30 }).chain((n) => exactlyNTopicsArb(n)),
        (texts) => {
          const response = validateAndAssignTopics(rawPayload(texts));

          expect(response.success).toBe(true);
          if (!response.success) return;

          expect(response.result.topics).toHaveLength(10);

          const expectedIds = Array.from({ length: 10 }, (_, i) => `generated-${i + 1}`);
          expect(response.result.topics.map((t) => t.id)).toEqual(expectedIds);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('never pads — success and failure paths are mutually exclusive based on distinct count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }).chain((n) =>
          n === 0 ? fc.constant([] as string[]) : exactlyNTopicsArb(n),
        ),
        (texts) => {
          const response = validateAndAssignTopics(rawPayload(texts));

          if (response.success) {
            expect(response.result.topics).toHaveLength(10);
            // The service must have had at least 10 distinct valid inputs.
            expect(texts.length).toBeGreaterThanOrEqual(10);
          } else {
            expect(response.error.type).toBeDefined();
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ── P2g ───────────────────────────────────────────────────────────────────────

describe('P2g: generateTopics with caller returning > 10 topics → success with 10', () => {
  it('returns exactly 10 when caller provides 15 topics', async () => {
    // Build 15 unique valid topic texts.
    const topics15 = Array.from(
      { length: 15 },
      (_, i) => `Unique topic text number ${i + 1} for testing purposes`,
    );
    const rawJson = JSON.stringify({ topics: topics15.map((text) => ({ text })) });
    const caller = makeResolveStub(rawJson);

    const response = await generateTopics(baseRequest, caller);

    expect(response.success).toBe(true);
    if (!response.success) return;
    expect(response.result.topics).toHaveLength(10);

    // First 10 texts should match.
    const expectedTexts = topics15.slice(0, 10).map((t) => t.trim());
    expect(response.result.topics.map((t) => t.text)).toEqual(expectedTexts);
  });
});

// ── P2h ───────────────────────────────────────────────────────────────────────

describe('P2h: generateTopics with caller returning < 10 topics → failure', () => {
  it('returns failure when caller provides 5 topics', async () => {
    const topics5 = Array.from(
      { length: 5 },
      (_, i) => `Only five topics topic ${i + 1}`,
    );
    const rawJson = JSON.stringify({ topics: topics5.map((text) => ({ text })) });
    const caller = makeResolveStub(rawJson);

    const response = await generateTopics(baseRequest, caller);

    expect(response.success).toBe(false);
    if (response.success) return;
    expect(response.error.type).toBe('INSUFFICIENT_TOPICS');
  });
});

// ── P2i ───────────────────────────────────────────────────────────────────────

describe('P2i: generateTopics with caller throwing a non-timeout error → PROVIDER_ERROR', () => {
  it('wraps generic errors as PROVIDER_ERROR', async () => {
    const caller = makeRejectStub(new Error('Network failure: connection reset'));
    const response = await generateTopics(baseRequest, caller);

    expect(response.success).toBe(false);
    if (response.success) return;
    expect(response.error.type).toBe('PROVIDER_ERROR');
  });

  it('PROVIDER_ERROR for varied generic error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (errMsg) => {
          const caller = makeRejectStub(new Error(errMsg));
          const response = await generateTopics(baseRequest, caller);
          expect(response.success).toBe(false);
          if (response.success) return;
          expect(response.error.type).toBe('PROVIDER_ERROR');
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ── P2j ───────────────────────────────────────────────────────────────────────

describe('P2j: generateTopics with caller throwing timeout error → TIMEOUT', () => {
  it('returns TIMEOUT error type when caller signals a timeout', async () => {
    const timeoutError = Object.assign(new Error('TIMEOUT'), { isTimeout: true });
    const caller = makeRejectStub(timeoutError);
    const response = await generateTopics(baseRequest, caller);

    expect(response.success).toBe(false);
    if (response.success) return;
    expect(response.error.type).toBe('TIMEOUT');
  });
});

// ── P2k ───────────────────────────────────────────────────────────────────────

describe('P2k: schema mismatch inputs → SCHEMA_MISMATCH (not INSUFFICIENT_TOPICS)', () => {
  it('returns SCHEMA_MISMATCH for null, primitives, and malformed objects', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer(),
          fc.float(),
          fc.string(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined),
          // Object without a topics key.
          fc.record({ notTopics: fc.array(fc.string()) }),
          // Object where topics is not an array.
          fc.record({
            topics: fc.oneof(
              fc.string(),
              fc.integer(),
              fc.boolean(),
              fc.constant(null),
            ),
          }),
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
  });
});
