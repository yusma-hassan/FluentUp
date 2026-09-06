/**
 * @jest-environment node
 */
// Feature: fluentup-mvp, Property 6: Audio payload rejection
//
// Property 6: API route rejects oversized or absent audio before calling AI
//
// For any audio payload that is absent, has a non-audio/* content type, or
// exceeds 25 MB (26,214,400 bytes), both the validator and the route handler
// SHALL return a rejection. The AI provider SHALL never be invoked on any
// of these invalid inputs.
//
// Validates: Requirements 9.3, 9.5, 9.8

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
import { POST } from '@/app/api/evaluate/route';
import { NextRequest } from 'next/server';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a NextRequest whose formData() is mocked to return a controlled
 * FormData. This avoids the multipart serialization/deserialization round-trip
 * that strips Object.defineProperty overrides from File objects.
 */
function buildMockedRequest(opts: {
  audioDescriptor: { type: string; size: number } | null;
  frameworkId?: string;
  topicText?: string;
}): NextRequest {
  // Build the FormData with a real (small) File so FormData is valid, but
  // override formData() to return a version with our controlled descriptor.
  const controlledFormData = new FormData();

  if (opts.audioDescriptor !== null) {
    // Create a minimal actual File and override its size/type via a Proxy so
    // the Next.js route's `audioFile instanceof File` check passes and
    // audioFile.type / audioFile.size return our controlled values.
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

  // Build a NextRequest and replace its formData() method so it returns our
  // controlled FormData rather than the serialized/deserialized version.
  const req = new NextRequest('http://localhost/api/evaluate', {
    method: 'POST',
    body: new FormData(), // placeholder body
  });

  req.formData = () => Promise.resolve(controlledFormData);

  return req;
}

/**
 * Build a real NextRequest using actual FormData serialization.
 * Use only for cases that don't depend on controlled file sizes.
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

  return new NextRequest('http://localhost/api/evaluate', {
    method: 'POST',
    body: formData,
  });
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

// ── Part 1: Unit-level property tests on validateAudioPayload ─────────────────

describe('P6 (unit): validateAudioPayload rejects invalid inputs', () => {

  it('P6-U1: null input always returns a non-null error string', () => {
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
    // Property: the happy path always passes validation.
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

  it('P6-U6: size of exactly 25 MB + 1 byte (just over boundary) returns a non-null error', () => {
    const result = validateAudioPayload({
      type: 'audio/webm',
      size: MAX_AUDIO_BYTES + 1,
    });
    expect(result).not.toBeNull();
  });

  it('P6-U7: size 0 with audio/* type returns null (only > 25 MB is rejected by size check)', () => {
    // The spec only prohibits size > 25 MB; size 0 is not explicitly invalid.
    const result = validateAudioPayload({ type: 'audio/webm', size: 0 });
    expect(result).toBeNull();
  });
});

// ── Part 2: Route-level property tests with controlled Requests ───────────────
//
// We use buildMockedRequest() to inject controlled audio descriptors directly
// into the route's formData() call, bypassing the FormData multipart
// serialization round-trip that would otherwise reset the file's size.
//
// For each rejection path we assert:
//   a) The response status is 400.
//   b) The response body contains a truthy "error" field.
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

  it('P6-R2: absent audio with no other fields → HTTP 400, AI never called', async () => {
    // Verify that even when frameworkId and topicText are also absent,
    // the audio validation fires first and the AI is not invoked.
    const req = buildMockedRequest({ audioDescriptor: null });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json() as { error?: string };
    expect(body.error).toBeTruthy();
    expect(createAIProvider).not.toHaveBeenCalled();
    expect(mockEvaluate).not.toHaveBeenCalled();
  });

  it('P6-R3: any non-audio/* content-type → HTTP 400, AI never called', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonAudioMimeArb,
        validSizeBytesArb,
        async (mimeType, size) => {
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
      { numRuns: 100 },
    );
  });

  it('P6-R4: audio size > 25 MB with valid audio/* type → HTTP 400, AI never called', async () => {
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
      { numRuns: 100 },
    );
  });

  it('P6-R5: varied sizes spanning [0, 30 MB] with varied content-types — only valid audio within limit passes audio validation', async () => {
    // Comprehensive property across all size/type combinations.
    // Verify the boundary: only audio/* with size ≤ 25 MB should pass audio validation.
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 30 * 1024 * 1024 }),
        fc.oneof(audioMimeArb, nonAudioMimeArb),
        async (size, mimeType) => {
          createAIProvider.mockClear();
          mockEvaluate.mockReset();

          const isAudio = mimeType.startsWith('audio/');
          const withinLimit = size <= MAX_AUDIO_BYTES;
          const expectsAudioPass = isAudio && withinLimit;

          const req = buildMockedRequest({
            audioDescriptor: { type: mimeType, size },
            frameworkId: 'prep',
            topicText: 'A valid topic text for testing',
          });

          const res = await POST(req);

          if (!expectsAudioPass) {
            // Audio validation should reject — HTTP 400, no AI call.
            expect(res.status).toBe(400);
            expect(mockEvaluate).not.toHaveBeenCalled();
          }
          // When expectsAudioPass is true, subsequent validations (frameworkId,
          // topicText) may also pass and potentially call AI — but that's
          // outside P6's scope. We only assert the rejection invariants here.
        },
      ),
      { numRuns: 100 },
    );
  });
});
