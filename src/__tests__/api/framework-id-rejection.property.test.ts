/**
 * @jest-environment node
 *
 * Feature: fluentup-mvp, Property 7: Framework ID rejection
 *
 * Property 7: API route rejects unknown framework IDs before calling AI
 *
 * For any frameworkId value that does not match an entry in the active
 * Challenge Pool, both route handlers (POST /api/generate-topics and
 * POST /api/evaluate) SHALL return HTTP 400. The AI provider SHALL never
 * be invoked for any unrecognized framework ID.
 *
 * Validates: Requirements 9.4, 9.5
 */

import * as fc from 'fast-check';
import { NextRequest } from 'next/server';
import { ACTIVE_FRAMEWORKS } from '@/lib/challenge-pool';
import { validateFrameworkId } from '@/lib/validation';

// ── Module mocks ──────────────────────────────────────────────────────────────

// Mock the topic generation service so the generate-topics route never makes
// a real Gemini call. We track invocations to assert it is never called when
// frameworkId is invalid.
const mockGenerateTopics = jest.fn();

jest.mock('@/lib/ai/topic-generation-service', () => ({
  generateTopics: (...args: unknown[]) => mockGenerateTopics(...args),
}));

// Mock createAIProvider so GeminiProvider is never instantiated or called.
// We track invocations to assert it is never called when frameworkId is invalid.
const mockEvaluate = jest.fn();

jest.mock('@/lib/ai/ai-service', () => ({
  createAIProvider: jest.fn(() => ({ evaluate: mockEvaluate })),
}));

// Import mocked references for call-count assertions.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createAIProvider } = require('@/lib/ai/ai-service') as {
  createAIProvider: jest.Mock;
};

// Route handlers — imported after mocks are registered so they pick up the
// mocked dependencies.
import { POST as generateTopicsPOST } from '@/app/api/generate-topics/route';
import { POST as evaluatePOST } from '@/app/api/evaluate/route';

// ── Constants ─────────────────────────────────────────────────────────────────

/** The set of valid framework IDs in the active pool. */
const VALID_IDS = new Set(ACTIVE_FRAMEWORKS.map((f) => f.id));

// ── Arbitraries ───────────────────────────────────────────────────────────────

/**
 * Generates arbitrary strings that are guaranteed not to match any active
 * framework ID. Includes empty strings, whitespace-only, non-string types
 * stringified, GUIDs, and random ASCII strings — all unrecognised by the pool.
 */
const unknownFrameworkIdArb: fc.Arbitrary<string> = fc.oneof(
  // Random strings — almost certainly not a valid ID
  fc.string({ minLength: 1, maxLength: 60 }).filter((s) => !VALID_IDS.has(s)),
  // Empty / whitespace only
  fc.constantFrom('', '   ', '\t', '\n'),
  // Near-misses: known IDs with minor mutations
  fc.constantFrom(
    'PREP',
    'Prep',
    'prep ',
    ' prep',
    'prep\n',
    'what_so_what',
    'what-so-what-now-what',
    'unknown',
    'nonexistent',
    '12345',
    '<script>',
  ),
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a NextRequest for POST /api/generate-topics with a JSON body. */
function buildGenerateTopicsRequest(frameworkId: unknown): NextRequest {
  return new NextRequest('http://localhost/api/generate-topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frameworkId }),
  });
}

/**
 * Build a NextRequest for POST /api/evaluate with multipart form-data.
 * Audio is a minimal valid File (1 byte, audio/webm) so audio validation
 * passes — the test is specifically exercising the frameworkId rejection
 * that happens *after* audio validation.
 */
function buildEvaluateRequest(frameworkId: unknown): NextRequest {
  const controlledFormData = new FormData();

  // Minimal audio blob that passes audio/* and size checks
  const minimalAudio = new File([new Uint8Array(1)], 'audio.bin', {
    type: 'audio/webm',
  });
  controlledFormData.append('audio', minimalAudio);

  if (typeof frameworkId === 'string') {
    controlledFormData.append('frameworkId', frameworkId);
  }

  // Provide a non-empty topicText so topic validation is not the failure point
  controlledFormData.append('topicText', 'A sample topic for testing');

  const req = new NextRequest('http://localhost/api/evaluate', {
    method: 'POST',
    body: new FormData(), // placeholder — replaced below
  });
  req.formData = () => Promise.resolve(controlledFormData);

  return req;
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  mockGenerateTopics.mockReset();
  mockEvaluate.mockReset();
  createAIProvider.mockClear();
});

// ── Part 1: Unit-level properties on validateFrameworkId ─────────────────────

describe('P7 (unit): validateFrameworkId rejects unknown IDs', () => {
  it('P7-U1: null input returns null', () => {
    expect(validateFrameworkId(null, ACTIVE_FRAMEWORKS)).toBeNull();
  });

  it('P7-U2: undefined input returns null', () => {
    expect(validateFrameworkId(undefined, ACTIVE_FRAMEWORKS)).toBeNull();
  });

  it('P7-U3: numeric input returns null', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        expect(validateFrameworkId(n, ACTIVE_FRAMEWORKS)).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  it('P7-U4: object / array input returns null', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.object(),
          fc.array(fc.string()),
          fc.constant({}),
          fc.constant([]),
        ),
        (v) => {
          expect(validateFrameworkId(v, ACTIVE_FRAMEWORKS)).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('P7-U5: any string not in the active pool returns null', () => {
    // Feature: fluentup-mvp, Property 7: Framework ID rejection
    fc.assert(
      fc.property(unknownFrameworkIdArb, (id) => {
        const result = validateFrameworkId(id, ACTIVE_FRAMEWORKS);
        expect(result).toBeNull();
      }),
      { numRuns: 200 },
    );
  });

  it('P7-U6: every valid ID in the active pool returns the matching Framework', () => {
    // Positive sanity check — the property must not accidentally reject valid IDs.
    for (const framework of ACTIVE_FRAMEWORKS) {
      const result = validateFrameworkId(framework.id, ACTIVE_FRAMEWORKS);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(framework.id);
    }
  });

  it('P7-U7: empty string returns null', () => {
    expect(validateFrameworkId('', ACTIVE_FRAMEWORKS)).toBeNull();
  });

  it('P7-U8: whitespace-only string returns null', () => {
    expect(validateFrameworkId('   ', ACTIVE_FRAMEWORKS)).toBeNull();
  });

  it('P7-U9: pool with no entries always returns null for any string', () => {
    fc.assert(
      fc.property(fc.string(), (id) => {
        expect(validateFrameworkId(id, [])).toBeNull();
      }),
      { numRuns: 100 },
    );
  });
});

// ── Part 2: Route-level properties — POST /api/generate-topics ───────────────
//
// For each unrecognized frameworkId the route MUST:
//   a) Return HTTP 400.
//   b) Include a truthy "error" field in the JSON body.
//   c) Never call generateTopics.

describe('P7 (route): POST /api/generate-topics rejects unknown frameworkIds', () => {
  it('P7-GT1: absent frameworkId → HTTP 400, generateTopics never called', async () => {
    // Body with no frameworkId key
    const req = new NextRequest('http://localhost/api/generate-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await generateTopicsPOST(req);

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
    expect(mockGenerateTopics).not.toHaveBeenCalled();
  });

  it('P7-GT2: null frameworkId → HTTP 400, generateTopics never called', async () => {
    const req = buildGenerateTopicsRequest(null);
    const res = await generateTopicsPOST(req);

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
    expect(mockGenerateTopics).not.toHaveBeenCalled();
  });

  it('P7-GT3: invalid JSON body → HTTP 400, generateTopics never called', async () => {
    const req = new NextRequest('http://localhost/api/generate-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{{{',
    });

    const res = await generateTopicsPOST(req);

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
    expect(mockGenerateTopics).not.toHaveBeenCalled();
  });

  it('P7-GT4: any string not in the active pool → HTTP 400, generateTopics never called', async () => {
    // Feature: fluentup-mvp, Property 7: Framework ID rejection
    await fc.assert(
      fc.asyncProperty(unknownFrameworkIdArb, async (id) => {
        mockGenerateTopics.mockReset();

        const req = buildGenerateTopicsRequest(id);
        const res = await generateTopicsPOST(req);

        expect(res.status).toBe(400);
        const body = (await res.json()) as { error?: string };
        expect(body.error).toBeTruthy();
        expect(mockGenerateTopics).not.toHaveBeenCalled();
      }),
      { numRuns: 100 },
    );
  });

  it('P7-GT5: near-miss IDs (wrong case, extra spaces, partial names) → HTTP 400', async () => {
    const nearMisses = [
      'PREP',
      'Prep',
      'prep ',
      ' prep',
      'prep\t',
      'what_so_what',
      'what-so-what-now-what',
      'WHAT_SO_WHAT_NOW_WHAT',
    ];

    for (const id of nearMisses) {
      mockGenerateTopics.mockReset();
      const req = buildGenerateTopicsRequest(id);
      const res = await generateTopicsPOST(req);

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error?: string };
      expect(body.error).toBeTruthy();
      expect(mockGenerateTopics).not.toHaveBeenCalled();
    }
  });
});

// ── Part 3: Route-level properties — POST /api/evaluate ──────────────────────
//
// The evaluate route validates audio first, then frameworkId.
// We supply a valid audio blob so only the frameworkId check is the failure
// point. For each unrecognized frameworkId the route MUST:
//   a) Return HTTP 400.
//   b) Include a truthy "error" field in the JSON body.
//   c) Never invoke createAIProvider or evaluate().

describe('P7 (route): POST /api/evaluate rejects unknown frameworkIds', () => {
  it('P7-EV1: absent frameworkId field → HTTP 400, AI never called', async () => {
    const formData = new FormData();
    const audio = new File([new Uint8Array(1)], 'audio.bin', {
      type: 'audio/webm',
    });
    formData.append('audio', audio);
    formData.append('topicText', 'Some topic');
    // frameworkId intentionally omitted

    const req = new NextRequest('http://localhost/api/evaluate', {
      method: 'POST',
      body: new FormData(),
    });
    req.formData = () => Promise.resolve(formData);

    const res = await evaluatePOST(req);

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
    expect(createAIProvider).not.toHaveBeenCalled();
    expect(mockEvaluate).not.toHaveBeenCalled();
  });

  it('P7-EV2: any string not in the active pool → HTTP 400, AI never called', async () => {
    // Feature: fluentup-mvp, Property 7: Framework ID rejection
    await fc.assert(
      fc.asyncProperty(unknownFrameworkIdArb, async (id) => {
        createAIProvider.mockClear();
        mockEvaluate.mockReset();

        // Skip empty / whitespace strings: they are not appended as strings
        // to FormData (FormData.append coerces to string, empty string is
        // valid but the validator catches it via trim() === '').
        const req = buildEvaluateRequest(id);
        const res = await evaluatePOST(req);

        expect(res.status).toBe(400);
        const body = (await res.json()) as { error?: string };
        expect(body.error).toBeTruthy();
        expect(createAIProvider).not.toHaveBeenCalled();
        expect(mockEvaluate).not.toHaveBeenCalled();
      }),
      { numRuns: 100 },
    );
  });

  it('P7-EV3: near-miss IDs → HTTP 400, AI never called', async () => {
    const nearMisses = [
      'PREP',
      'Prep',
      'prep ',
      ' prep',
      'what_so_what',
      'nonexistent',
      '12345',
    ];

    for (const id of nearMisses) {
      createAIProvider.mockClear();
      mockEvaluate.mockReset();

      const req = buildEvaluateRequest(id);
      const res = await evaluatePOST(req);

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error?: string };
      expect(body.error).toBeTruthy();
      expect(createAIProvider).not.toHaveBeenCalled();
      expect(mockEvaluate).not.toHaveBeenCalled();
    }
  });
});
