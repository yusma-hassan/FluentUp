import { Framework } from '../types/index';

/** Maximum permitted audio payload size: 25 MB in bytes. */
const MAX_AUDIO_SIZE_BYTES = 26_214_400; // 25 * 1024 * 1024

/** Maximum permitted topic text length in characters. */
const MAX_TOPIC_TEXT_LENGTH = 500;

/**
 * Looks up a framework by ID in the supplied pool.
 *
 * @param frameworkId - Untrusted value from the request body.
 * @param pool        - The active Framework pool to search.
 * @returns The matching Framework, or null if not found / invalid type.
 */
export function validateFrameworkId(
  frameworkId: unknown,
  pool: Framework[]
): Framework | null {
  if (typeof frameworkId !== 'string' || frameworkId.trim() === '') {
    return null;
  }
  return pool.find((f) => f.id === frameworkId) ?? null;
}

/**
 * Validates an audio file-like descriptor extracted from a multipart request.
 *
 * Checks (in order):
 *   1. File is present (not null).
 *   2. Content-type starts with `audio/`.
 *   3. Size does not exceed 25 MB (26,214,400 bytes).
 *
 * @param file - Object with `type` (content-type string) and `size` (bytes),
 *               or null when the field was absent from the request.
 * @returns A user-facing error string on the first failed check, or null on success.
 */
export function validateAudioPayload(
  file: { type: string; size: number } | null
): string | null {
  if (file === null) {
    return 'Audio payload is required.';
  }

  if (!file.type.startsWith('audio/')) {
    return 'Audio payload must have a valid audio content type.';
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return 'Audio payload exceeds the 25 MB size limit.';
  }

  return null;
}

/**
 * Validates the topic text supplied by the client.
 *
 * Checks (in order):
 *   1. Value is a non-empty string.
 *   2. Length does not exceed 500 characters.
 *
 * @param text - Untrusted value from the request body.
 * @returns A user-facing error string on failure, or null on success.
 */
export function validateTopicText(text: unknown): string | null {
  if (typeof text !== 'string' || text.trim() === '') {
    return 'Topic text is required.';
  }

  if (text.length > MAX_TOPIC_TEXT_LENGTH) {
    return `Topic text must not exceed ${MAX_TOPIC_TEXT_LENGTH} characters.`;
  }

  return null;
}
