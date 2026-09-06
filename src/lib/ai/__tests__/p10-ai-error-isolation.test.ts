// Feature: fluentup-mvp, Property 10: AI error isolation
//
// Property 10: AI Service never exposes raw provider error details to callers
//
// For any error thrown by the AI provider (HTTP error bodies, status codes,
// API key fragments, stack traces, raw JSON), the returned EvaluationError.message
// SHALL be a generic, user-facing string that contains NONE of the raw provider
// detail. No internal identifiers, keys, or diagnostic strings may reach the caller.
//
// Validates: Requirements 6.7, 9.7

import * as fc from 'fast-check';
import { GeminiProvider } from '../gemini-provider';
import type { AIEvaluationRequest } from '../types';

// ── Module mock ───────────────────────────────────────────────────────────────

// Mock the entire @google/genai module so GeminiProvider never makes real HTTP
// calls. We replace generateContent with a jest.fn() that we control per-test.
jest.mock('@google/genai', () => {
  const mockGenerateContent = jest.fn();
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
    __mockGenerateContent: mockGenerateContent,
  };
});

// Helper to retrieve the shared mock function after jest.mock is applied.
function getMockGenerateContent(): jest.Mock {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('@google/genai') as {
    __mockGenerateContent: jest.Mock;
  };
  return mod.__mockGenerateContent;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** All safe, user-facing messages the provider is allowed to return. */
const SAFE_MESSAGES = new Set([
  'The AI service is unavailable. Please try again.',
  'The AI service took too long to respond. Please try again.',
  'The AI response was not in the expected format. Please try again.',
  'The AI service returned an empty response. Please try again.',
  'No speech was detected in your recording. Please try again and speak clearly into your microphone.',
]);

// ── Test fixture ──────────────────────────────────────────────────────────────

const request: AIEvaluationRequest = {
  audioBlob: Buffer.from('fake-audio'),
  audioMimeType: 'audio/webm;codecs=opus',
  frameworkId: 'prep',
  frameworkName: 'PREP',
  evaluationCriteria: [
    {
      id: 'prep_point',
      label: 'Clear Point',
      description: 'Opens with a clear point.',
    },
  ],
  topicText: 'Should remote work be the default for tech companies?',
};

// ── Arbitraries ───────────────────────────────────────────────────────────────

/**
 * Generates arbitrary "raw provider error strings" — content that could plausibly
 * appear in real provider errors and must never surface to the caller.
 */
const rawErrorArb = fc.oneof(
  // HTTP status + message
  fc
    .tuple(
      fc.integer({ min: 400, max: 599 }),
      fc.string({ minLength: 5, maxLength: 50 }),
    )
    .map(([code, msg]) => `HTTP ${code}: ${msg}`),
  // API key fragment (alphanumeric, looks like a real key)
  fc
    .stringMatching(/^[A-Za-z0-9_-]{20,40}$/)
    .map((key) => `AIza${key}`),
  // JSON error body
  fc
    .record({
      code: fc.integer({ min: 400, max: 599 }),
      message: fc.string({ minLength: 5, maxLength: 100 }),
      status: fc.constantFrom(
        'UNAUTHENTICATED',
        'PERMISSION_DENIED',
        'RESOURCE_EXHAUSTED',
        'INTERNAL',
      ),
    })
    .map((obj) => JSON.stringify({ error: obj })),
  // Stack trace fragment
  fc
    .string({ minLength: 10, maxLength: 80 })
    .map((s) => `Error: ${s}\n    at GeminiProvider.evaluate`),
);

// ── Setup / teardown ──────────────────────────────────────────────────────────

let originalApiKey: string | undefined;

beforeEach(() => {
  originalApiKey = process.env.AI_API_KEY;
  process.env.AI_API_KEY = 'test-api-key-do-not-expose';
  getMockGenerateContent().mockReset();
});

afterEach(() => {
  if (originalApiKey === undefined) {
    delete process.env.AI_API_KEY;
  } else {
    process.env.AI_API_KEY = originalApiKey;
  }
});

// ── Property tests ────────────────────────────────────────────────────────────

describe('P10: AI error isolation (property tests)', () => {

  // ── P10a: thrown errors with raw provider strings never leak into message ──
  it(
    'P10a: when generateContent throws an error with raw provider details, EvaluationError.message is a safe generic string',
    async () => {
      await fc.assert(
        fc.asyncProperty(rawErrorArb, async (rawErrorString) => {
          getMockGenerateContent().mockRejectedValueOnce(
            new Error(rawErrorString),
          );

          const provider = new GeminiProvider();
          const result = await provider.evaluate(request);

          // Must be a failure result.
          expect(result.success).toBe(false);
          if (result.success) return;

          // Message must NOT contain any fragment of the raw error.
          expect(result.error.message).not.toContain(rawErrorString);

          // Message MUST be one of the known safe strings.
          expect(SAFE_MESSAGES.has(result.error.message)).toBe(true);
        }),
        { numRuns: 100 },
      );
    },
  );

  // ── P10b: the error type is one of the allowed discriminated union values ──
  it(
    'P10b: EvaluationError.type is always one of TIMEOUT | PROVIDER_ERROR | SCHEMA_MISMATCH',
    async () => {
      await fc.assert(
        fc.asyncProperty(rawErrorArb, async (rawErrorString) => {
          getMockGenerateContent().mockRejectedValueOnce(
            new Error(rawErrorString),
          );

          const provider = new GeminiProvider();
          const result = await provider.evaluate(request);

          expect(result.success).toBe(false);
          if (result.success) return;

          expect(['TIMEOUT', 'PROVIDER_ERROR', 'SCHEMA_MISMATCH']).toContain(
            result.error.type,
          );
        }),
        { numRuns: 100 },
      );
    },
  );

  // ── P10c: raw JSON schema-mismatch responses also produce safe messages ────
  it(
    'P10c: when generateContent resolves with raw JSON that fails schema validation, EvaluationError.message is safe',
    async () => {
      // Generate varied invalid JSON payloads — objects that don't match Evaluation schema.
      const invalidPayloadArb = fc.oneof(
        // Plain string (not JSON object)
        fc.string({ minLength: 5, maxLength: 100 }).map((s) => `"${s}"`),
        // Object missing required fields
        fc
          .record({
            randomField: fc.string({ minLength: 1, maxLength: 20 }),
            anotherField: fc.integer(),
          })
          .map((obj) => JSON.stringify(obj)),
        // Array instead of object
        fc
          .array(fc.string({ minLength: 1, maxLength: 20 }), {
            minLength: 1,
            maxLength: 5,
          })
          .map((arr) => JSON.stringify(arr)),
        // Object with wrong types for required fields
        fc
          .record({
            overallScore: fc.string(), // should be number
            categoryScores: fc.constant('not-an-array'),
            strengths: fc.integer(), // should be array
          })
          .map((obj) => JSON.stringify(obj)),
      );

      await fc.assert(
        fc.asyncProperty(invalidPayloadArb, async (rawJson) => {
          getMockGenerateContent().mockResolvedValueOnce({ text: rawJson });

          const provider = new GeminiProvider();
          const result = await provider.evaluate(request);

          expect(result.success).toBe(false);
          if (result.success) return;

          // Raw JSON payload must not appear in the message.
          expect(result.error.message).not.toContain(rawJson);

          // Must be a known safe message.
          expect(SAFE_MESSAGES.has(result.error.message)).toBe(true);
        }),
        { numRuns: 100 },
      );
    },
  );

  // ── P10d: HTTP status code numbers don't appear in the message ────────────
  it(
    'P10d: HTTP error status codes thrown as errors do not appear in EvaluationError.message',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 599 }),
          fc.string({ minLength: 5, maxLength: 60 }),
          async (statusCode, details) => {
            const rawMsg = `Request failed with status ${statusCode}: ${details}`;
            getMockGenerateContent().mockRejectedValueOnce(new Error(rawMsg));

            const provider = new GeminiProvider();
            const result = await provider.evaluate(request);

            expect(result.success).toBe(false);
            if (result.success) return;

            // Neither the numeric status code nor any detail fragment should leak.
            expect(result.error.message).not.toContain(String(statusCode));
            expect(result.error.message).not.toContain(details);
            expect(SAFE_MESSAGES.has(result.error.message)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P10e: API key fragments do not appear in the message ──────────────────
  it(
    'P10e: API key fragments embedded in thrown errors never appear in EvaluationError.message',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Za-z0-9_-]{20,40}$/),
          async (keyFragment) => {
            const rawMsg = `UNAUTHENTICATED: API key AIza${keyFragment} is not valid.`;
            getMockGenerateContent().mockRejectedValueOnce(new Error(rawMsg));

            const provider = new GeminiProvider();
            const result = await provider.evaluate(request);

            expect(result.success).toBe(false);
            if (result.success) return;

            expect(result.error.message).not.toContain(keyFragment);
            expect(result.error.message).not.toContain('AIza');
            expect(SAFE_MESSAGES.has(result.error.message)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── P10f: missing API key returns a safe generic message (no key exposure) ─
  it(
    'P10f: when AI_API_KEY is absent, the returned error message is safe and contains no key value',
    async () => {
      delete process.env.AI_API_KEY;

      const provider = new GeminiProvider();
      const result = await provider.evaluate(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(SAFE_MESSAGES.has(result.error.message)).toBe(true);
        expect(result.error.type).toBe('PROVIDER_ERROR');
      }
    },
  );

  // ── P10g: AbortError / timeout produces the specific timeout safe message ──
  it(
    'P10g: when generateContent throws an AbortError (timeout), error.type is TIMEOUT with safe message',
    async () => {
      const abortError = new Error('The operation was aborted.');
      abortError.name = 'AbortError';
      getMockGenerateContent().mockRejectedValueOnce(abortError);

      const provider = new GeminiProvider();
      const result = await provider.evaluate(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('TIMEOUT');
        expect(result.error.message).toBe(
          'The AI service took too long to respond. Please try again.',
        );
        expect(SAFE_MESSAGES.has(result.error.message)).toBe(true);
      }
    },
  );

  // ── P10h: non-JSON text response produces safe SCHEMA_MISMATCH message ─────
  it(
    'P10h: when generateContent returns non-JSON text, error.type is SCHEMA_MISMATCH with safe message',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          // Strings that are definitely not valid JSON objects.
          fc.oneof(
            fc.constant('plain text response from provider'),
            fc.constant('<html><body>Error</body></html>'),
            fc.constant('undefined'),
            fc
              .string({ minLength: 5, maxLength: 100 })
              .filter((s) => {
                try {
                  JSON.parse(s);
                  return false; // exclude valid JSON
                } catch {
                  return true;
                }
              }),
          ),
          async (nonJsonText) => {
            getMockGenerateContent().mockResolvedValueOnce({
              text: nonJsonText,
            });

            const provider = new GeminiProvider();
            const result = await provider.evaluate(request);

            expect(result.success).toBe(false);
            if (result.success) return;

            expect(result.error.type).toBe('SCHEMA_MISMATCH');
            expect(result.error.message).not.toContain(nonJsonText);
            expect(SAFE_MESSAGES.has(result.error.message)).toBe(true);
          },
        ),
        { numRuns: 50 },
      );
    },
  );
});

// ── NO_SPEECH_DETECTED structured response ────────────────────────────────────

describe('NO_SPEECH_DETECTED: Gemini returns {"noSpeechDetected":true}', () => {
  it('returns NO_SPEECH_DETECTED error when Gemini returns the no-speech signal', async () => {
    getMockGenerateContent().mockResolvedValueOnce({
      text: '{"noSpeechDetected":true}',
    });

    const provider = new GeminiProvider();
    const result = await provider.evaluate(request);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe('NO_SPEECH_DETECTED');
    expect(SAFE_MESSAGES.has(result.error.message)).toBe(true);
  });

  it('does NOT accept noSpeechDetected:false as a no-speech signal', async () => {
    // noSpeechDetected: false means the model did evaluate speech — fall through
    // to normal schema validation (will fail because other fields are missing,
    // but it must NOT return NO_SPEECH_DETECTED).
    getMockGenerateContent().mockResolvedValueOnce({
      text: '{"noSpeechDetected":false}',
    });

    const provider = new GeminiProvider();
    const result = await provider.evaluate(request);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).not.toBe('NO_SPEECH_DETECTED');
  });

  it('returns SCHEMA_MISMATCH (not NO_SPEECH_DETECTED) when strengths:[] in normal response', async () => {
    // Gemini returned strengths:[] without the noSpeechDetected flag —
    // should fail schema validation, not be mistaken for a no-speech signal.
    getMockGenerateContent().mockResolvedValueOnce({
      text: JSON.stringify({
        overallScore: 0,
        categoryScores: [],
        strengths: [],
        weaknesses: ['No speech was detected.'],
        frameworkFeedback: 'No speech.',
        suggestions: ['Please speak clearly.'],
        exampleResponse: 'An example.',
      }),
    });

    const provider = new GeminiProvider();
    const result = await provider.evaluate(request);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe('SCHEMA_MISMATCH');
    expect(result.error.type).not.toBe('NO_SPEECH_DETECTED');
  });
});
