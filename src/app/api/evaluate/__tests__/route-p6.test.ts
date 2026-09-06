/**
 * @jest-environment node
 *
 * Feature: fluentup-mvp, Property 6: Audio payload rejection
 *
 * Property 6: API route rejects oversized or absent audio before calling AI
 *
 * For any audio payload that is absent, has a non-audio/* content type, or
 * exceeds 25 MB (26,214,400 bytes), both the validator and the route handler
 * SHALL return a rejection. The AI provider SHALL never be invoked on any
 * of these invalid inputs.
 *
 * Validates: Requirements 9.3, 9.5, 9.8
 */

import * as fc from 'fast-check';
import { validateAudioPayload } from '@/lib/validation';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_AUDIO_BYTES = 26_214_400; // 25 MB

// ── Module mock ───────────────────────────────────────────────────────────────

// Mock createAIProvider so GeminiProvider is never instantiated or called.
// We track calls to evaluate() to assert AI is never invoked on bad input.
const mockEvaluate = jest.fn();

jest.mock('@/lib/ai/ai-service', () => ({
  createAIProvider: jest.fn(() => ({ evaluate: mockEvaluate })),
}));

// Import after mocking so the route picks up the mocked factory.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createAIProvider } = require('@/lib/ai/ai-service') as {
  createAIProvider: jest.Mock;
};

// Import the route handler after mocks are in place.
import { POST } from '../route';
import { NextRequest } from 'next/server';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a NextRequest with multipart/form-data containing the given fields.
 * Pass `audioFile: null` to simulate an absent audio field.
 */
function buildRequest(opts: {
  audioFile: File | null;
  frameworkId?: string;
  topicText?: string;
}): NextRequest {
  const formData = new FormData();

  if (opts.audioFile !== null) {
    formData.append('audio', opts.audioFile);
  }
  if (opts.frameworkId !== undefined) {
    formData.append('frameworkId', opts.frameworkId);
  }
  if (opts.topicText !== undefined) {
    formData.append('topicText', opts.topicText);
  }

  // NextRequest requires an absolute URL.
  return new NextRequest('http://localhost/api/evaluate', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Create a synthetic File-like object with a controlled size.
 * The content is just a single zero byte — we only care about `.size` and `.type`.
 */
function makeAudioFile(sizeBytes: number, mimeType: string): File {
  // Use a single-byte Uint8Array as the blob content, then override the `size`
  // by wrapping in a Blob. Since we cannot easily spoof `.size` on a real File,
  // we create a Blob of the desired byte length.
  const content = new Uint8Array(Math.min(sizeBytes, 1024)); // cap actual allocation
  const blob = new Blob([content], { type: mimeType });

  // Override size via a proxy so the route sees the correct value without
  // allocating potentially 30 MB in tests.
  const file = new File([blob], 'audio.bin', { type: mimeType });
  return Object.defineProperty(file, 'size', {
    value: sizeBytes,
    writable: false,
  }) as File;
}

/**
 * Build a NextRequest whose formData() is mocked to return a controlled
 * FormData with a Proxy-based File. This ensures the route sees the exact
 * size/type we specify, bypassing the multipart serialization round-trip
 * that would otherwise reset the file's size to the actual blob byte length.
 */
function buildMockedRequest(opts: {
  audioDescriptor: { type: string; size: number } | null;
  frameworkId?: string;
  topicText?: string;
}): NextRequest {
  const controlledFormData = new FormData();

  if (opts.audioDescriptor !== null) {
    const { type, size } = opts.audioDescriptor;
    const minimal = new File([new Uint8Array(1)], 'audio.bin', { type });
    const proxied = new Proxy(minimal, {
      get(target, prop) {
        if (prop === 'size') return size;
        if (prop === 'type') return type;
        const val = Reflect.get(target, prop);
        return typeof val === 'function' ? val.bind(target) : val;
      },
    });
    controlledFormData.append('audio', proxied as unknown as File);
  }

  if (opts.frameworkId !== undefined) {
    controlledFormData.append('frameworkId', opts.frameworkId);
  }
  if (opts.topicText !== undefined) {
    controlledFormData.append('topicText', opts.topicText);
  }

  const req = new NextRequest('http://localhost/api/evaluate', {
    method: 'POST',
    body: new FormData(), // placeholder body — formData() is replaced below
  });

  req.formData = () => Promise.resolve(controlledFormData);

  return req;
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

/** Any content-type string that does NOT start with "audio/" */
const nonAudioMimeArb = fc.oneof(
  fc.constantFrom(
    'video/mp4',
    'image/png',
    'application/json',
    'text/plain',
    'application/octet-stream',
    '',
  ),
  fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => !s.startsWith('audio/')),
);

/** Any valid audio/* content-type string */
const audioMimeArb = fc.oneof(
  fc.constantFrom(
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
    'audio/wav',
    'audio/mpeg',
    'audio/mp4',
  ),
  fc
    .string({ minLength: 1, maxLength: 20 })
    .map((s) => `audio/${s}`),
);

/** Size values in (25 MB, 30 MB] — oversized */
const oversizedBytesArb = fc.integer({
  min: MAX_AUDIO_BYTES + 1,
  max: 30 * 1024 * 1024,
});

/** Size values in [1, 25 MB] — valid size range */
const validSizeBytesArb = fc.integer({ min: 1, max: MAX_AUDIO_BYTES });

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  mockEvaluate.mockReset();
  createAIProvider.mockClear();
});

// ── Part 1: Unit-level tests on validateAudioPayload ─────────────────────────

describe('P6 (unit): validateAudioPayload rejects invalid inputs', () => {

  it('P6-U1: null input always returns a non-null error string', () => {
    // Fixed case — no need for property generation on a single value.
    const result = validateAudioPayload(null);
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
    expect((result as string).length).toBeGreaterThan(0);
  });

  it('P6-U2: any non-audio/* content-type always returns a non-null error string', () => {
    // Property: for any type string not starting with "audio/", validation fails.
    fc.assert(
      fc.property(
        nonAudioMimeArb,
        validSizeBytesArb,
        (mimeType, size) => {
          const result = validateAudioPayload({ type: mimeType, size });
          expect(result).not.toBeNull();
          expect(typeof result).toBe('string');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('P6-U3: any size exceeding 25 MB (with audio/* type) always returns a non-null error string', () => {
    // Property: size > 25 MB is always rejected regardless of (valid) mime type.
    fc.assert(
      fc.property(
        oversizedBytesArb,
        audioMimeArb,
        (size, mimeType) => {
          const result = validateAudioPayload({ type: mimeType, size });
          expect(result).not.toBeNull();
          expect(typeof result).toBe('string');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('P6-U4: valid audio/* type with size in [1, 25 MB] always returns null (success)', () => {
    // Property: the happy path always passes.
    fc.assert(
      fc.property(
        validSizeBytesArb,
        audioMimeArb,
        (size, mimeType) => {
          const result = validateAudioPayload({ type: mimeType, size });
          expect(result).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('P6-U5: size of exactly 25 MB (boundary) returns null (valid)', () => {
    const result = validateAudioPayload({
      type: 'audio/webm',
      size: MAX_AUDIO_BYTES,
    });
    expect(result).toBeNull();
  });

  it('P6-U6: size of exactly 25 MB + 1 byte (boundary) returns a non-null error', () => {
    const result = validateAudioPayload({
      type: 'audio/webm',
      size: MAX_AUDIO_BYTES + 1,
    });
    expect(result).not.toBeNull();
  });
});

// ── Part 2: Route-level property tests with mocked Requests ──────────────────
//
// For each rejection path we assert:
//   a) The response status is 400.
//   b) The response body contains an "error" field.
//   c) createAIProvider (and therefore evaluate) is never called.

describe('P6 (route): POST /api/evaluate rejects invalid audio before calling AI', () => {

  it('P6-R1: absent audio field → HTTP 400, AI never called', async () => {
    const req = buildRequest({ audioFile: null });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json() as { error?: string };
    expect(body.error).toBeTruthy();
    expect(createAIProvider).not.toHaveBeenCalled();
    expect(mockEvaluate).not.toHaveBeenCalled();
  });

  it('P6-R2: any non-audio/* content-type → HTTP 400, AI never called', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonAudioMimeArb,
        validSizeBytesArb,
        async (mimeType, size) => {
          createAIProvider.mockClear();
          mockEvaluate.mockReset();

          const file = makeAudioFile(size, mimeType);
          const req = buildRequest({
            audioFile: file,
            frameworkId: 'prep',
            topicText: 'A valid topic',
          });

          const res = await POST(req);

          expect(res.status).toBe(400);
          const body = await res.json() as { error?: string };
          expect(body.error).toBeTruthy();
          expect(createAIProvider).not.toHaveBeenCalled();
          expect(mockEvaluate).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('P6-R3: audio size > 25 MB with valid audio/* type → HTTP 400, AI never called', async () => {
    await fc.assert(
      fc.asyncProperty(
        oversizedBytesArb,
        audioMimeArb,
        async (size, mimeType) => {
          createAIProvider.mockClear();
          mockEvaluate.mockReset();

          const req = buildMockedRequest({
            audioDescriptor: { type: mimeType, size },
            frameworkId: 'prep',
            topicText: 'A valid topic',
          });

          const res = await POST(req);

          expect(res.status).toBe(400);
          const body = await res.json() as { error?: string };
          expect(body.error).toBeTruthy();
          expect(createAIProvider).not.toHaveBeenCalled();
          expect(mockEvaluate).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('P6-R4: zero-byte audio file passes audio validation (not rejected by size check)', async () => {
    // Edge case: a File with size 0 and a valid audio/* type.
    // validateAudioPayload allows size 0 (it only checks > 25 MB for size),
    // so the route does NOT return 400 for audio validation on a 0-byte file.
    // It will reach framework / topic validation and, since both pass here,
    // will call AI. We configure the mock so the route completes without error.
    mockEvaluate.mockResolvedValueOnce({ scores: [], overallFeedback: '' });

    const req = buildMockedRequest({
      audioDescriptor: { type: 'audio/webm', size: 0 },
      frameworkId: 'prep',
      topicText: 'A valid topic',
    });

    const res = await POST(req);

    // Audio validation passes (size 0 is not > 25 MB), so the route proceeds
    // past audio validation — this confirms no premature rejection.
    expect(res.status).not.toBe(400);
  });
});
