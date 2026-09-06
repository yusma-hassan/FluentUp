// Feature: fluentup-mvp, Property 9: Short recording warning

import * as fc from 'fast-check';
import { computeShortRecordingWarning } from '../useAudioRecorder';

/**
 * Validates: Requirements 5.11
 *
 * Property 9: Short recording always surfaces a warning
 *
 * `computeShortRecordingWarning(durationMs)` must:
 *   1. Return `true`  for all integer durations in [0, 2999] ms
 *   2. Return `false` for all integer durations ≥ 3000 ms
 */

describe('computeShortRecordingWarning – Property 9: Short recording warning', () => {
  const runConfig = { numRuns: 100 };

  it('returns true for all durations in [0, 2999] ms', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2999 }),
        (durationMs) => {
          expect(computeShortRecordingWarning(durationMs)).toBe(true);
        }
      ),
      runConfig
    );
  });

  it('returns false for all durations ≥ 3000 ms', () => {
    fc.assert(
      fc.property(
        // Cap at a large but finite value to keep the generator practical
        fc.integer({ min: 3000, max: 10_000_000 }),
        (durationMs) => {
          expect(computeShortRecordingWarning(durationMs)).toBe(false);
        }
      ),
      runConfig
    );
  });

  it('returns true at the boundary value 2999 ms', () => {
    expect(computeShortRecordingWarning(2999)).toBe(true);
  });

  it('returns false at the boundary value 3000 ms', () => {
    expect(computeShortRecordingWarning(3000)).toBe(false);
  });
});
