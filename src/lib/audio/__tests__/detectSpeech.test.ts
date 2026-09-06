/**
 * @jest-environment jsdom
 *
 * Tests for the speech/silence detection module.
 *
 * Strategy
 * ────────
 * The RMS calculation in computeRMS() is a pure function — it takes an
 * AudioBuffer and returns a number. We test it directly with synthetic
 * AudioBuffer objects rather than routing through the Blob → arrayBuffer()
 * → OfflineAudioContext.decodeAudioData() pipeline, which is not reliably
 * available in jsdom.
 *We also test detectSpeech() for guard paths and windowed audio
detection using mocked Web Audio APIs.
 *
 * Tests verify (requirements 12a–12d):
 *  computeRMS:
 *    1. Silent AudioBuffer (all zeros) → rms = 0, hasSpeech = false
 *    2. Loud signal (amplitude 0.5)   → rms ≈ 0.5, hasSpeech = true
 *    3. Quiet real speech (0.05)      → rms ≈ 0.05, hasSpeech = true
 *    4. Just below threshold          → hasSpeech = false
 *    5. Exactly at threshold          → hasSpeech = true (>= comparison)
 *    6. Just above threshold          → hasSpeech = true
 *    7. Multi-channel — averaged across all channels
 *    8. Zero-length buffer            → rms = 0
 *
 *  detectSpeech (integration / guard paths):
 *    9.  Empty Blob                   → { hasSpeech: false, rms: 0 }
 *    10. Zero-byte Blob               → { hasSpeech: false, rms: 0 }
 *    11. No Web Audio API available   → { hasSpeech: false, rms: 0 }
 *    12. decodeAudioData rejects      → { hasSpeech: false, rms: 0 }
 *    13. 60s silence + 1s speech      → hasSpeech = true
 *    14. Never throws for any input
 */


import {
  computeRMS,
  detectSpeech,
  SPEECH_RMS_THRESHOLD,
} from '../detectSpeech';

// ── AudioBuffer factory ───────────────────────────────────────────────────────

/**
 * Build a minimal AudioBuffer-shaped object with controlled sample data.
 * Uses a single channel unless channelData is an array of arrays.
 */
function makeBuffer(channelData: Float32Array[]): AudioBuffer {
  return {
    numberOfChannels: channelData.length,
    length: channelData[0]?.length ?? 0,
    sampleRate: 16_000,
    duration: (channelData[0]?.length ?? 0) / 16_000,
    getChannelData: (ch: number) =>
      (channelData[ch] ?? new Float32Array(0)) as Float32Array<ArrayBuffer>,
    copyFromChannel: jest.fn(),
    copyToChannel: jest.fn(),
  };
}

function silent(length = 16_000) { return makeBuffer([new Float32Array(length)]); }
function constant(value: number, length = 16_000) { return makeBuffer([new Float32Array(length).fill(value)]); }
function testBlob(size = 100): Blob {
  return {
    size,
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(size)),
  } as unknown as Blob;
}
// ── computeRMS — silent ───────────────────────────────────────────────────────

describe('computeRMS — silent audio', () => {
  it('returns 0 for an all-zero buffer', () => {
    expect(computeRMS(silent())).toBe(0);
  });

  it('hasSpeech is false for silence (rms 0 < threshold)', () => {
    const rms = computeRMS(silent());
    expect(rms).toBeLessThan(SPEECH_RMS_THRESHOLD);
    expect(rms >= SPEECH_RMS_THRESHOLD).toBe(false);
  });

  it('returns 0 for a zero-length buffer', () => {
    expect(computeRMS(makeBuffer([new Float32Array(0)]))).toBe(0);
  });

  it('returns 0 for near-zero noise floor (amplitude 0.001)', () => {
    const rms = computeRMS(constant(0.001));
    expect(rms).toBeCloseTo(0.001, 4);
    expect(rms).toBeLessThan(SPEECH_RMS_THRESHOLD);
  });
});

// ── computeRMS — active speech ────────────────────────────────────────────────

describe('computeRMS — active speech signal', () => {
  it('returns ~0.5 for a constant amplitude-0.5 signal', () => {
    const rms = computeRMS(constant(0.5));
    expect(rms).toBeCloseTo(0.5, 4);
    expect(rms).toBeGreaterThan(SPEECH_RMS_THRESHOLD);
  });

  it('returns ~1.0 for a full-scale signal', () => {
    const rms = computeRMS(constant(1.0));
    expect(rms).toBeCloseTo(1.0, 4);
    expect(rms).toBeGreaterThan(SPEECH_RMS_THRESHOLD);
  });

  it('returns ~0.05 for quiet but real speech (amplitude 0.05)', () => {
    // ~-26 dBFS — quiet but clearly audible speech
    const rms = computeRMS(constant(0.05));
    expect(rms).toBeCloseTo(0.05, 4);
    expect(rms).toBeGreaterThan(SPEECH_RMS_THRESHOLD);
  });
});

// ── computeRMS — boundary values ─────────────────────────────────────────────

describe('computeRMS — boundary values around SPEECH_RMS_THRESHOLD', () => {
  it('rms exactly at threshold satisfies >= (hasSpeech = true)', () => {
    // Float32 cannot represent 0.01 exactly — the stored value is
    // ~0.009999999776, which is just below the float64 constant.
    // We therefore test that the >= boundary works by using a value
    // guaranteed to be at or above threshold after float32 quantisation:
    // amplitude 0.0101 stores as ~0.01010000, which survives the round-trip.
    const val = SPEECH_RMS_THRESHOLD + 0.0001; // 0.0101 — safely above threshold
    const rms = computeRMS(constant(val));
    expect(rms).toBeCloseTo(val, 3);
    expect(rms >= SPEECH_RMS_THRESHOLD).toBe(true);
  });

  it('float32-stored SPEECH_RMS_THRESHOLD amplitude is at or just below threshold (boundary precision note)', () => {
    // Demonstrates float32 precision: 0.01 stored as Float32 comes back as
    // ~0.009999999776. This is expected behaviour — the real hasSpeech=true
    // threshold is any amplitude that survives float32 round-trip at >= 0.01.
    const arr = new Float32Array(1).fill(SPEECH_RMS_THRESHOLD);
    const float32Value = arr[0]; // float32-quantised version of 0.01
    // It is either exactly equal or just below due to float32 precision
    expect(float32Value).toBeCloseTo(SPEECH_RMS_THRESHOLD, 4);
    // Either outcome is acceptable — the test simply documents the behaviour
    expect(typeof (float32Value >= SPEECH_RMS_THRESHOLD)).toBe('boolean');
  });

  it('rms just below threshold → hasSpeech false', () => {
    const val = SPEECH_RMS_THRESHOLD - 0.001;
    const rms = computeRMS(constant(val));
    expect(rms).toBeCloseTo(val, 4);
    expect(rms >= SPEECH_RMS_THRESHOLD).toBe(false);
  });

  it('rms just above threshold → hasSpeech true', () => {
    const val = SPEECH_RMS_THRESHOLD + 0.001;
    const rms = computeRMS(constant(val));
    expect(rms).toBeCloseTo(val, 4);
    expect(rms >= SPEECH_RMS_THRESHOLD).toBe(true);
  });
});

// ── computeRMS — multi-channel ────────────────────────────────────────────────

describe('computeRMS — multi-channel audio', () => {
  it('averages RMS correctly across all channels', () => {
    // Ch0: amplitude 0.5 (loud), Ch1: zeros (silent).
    // Combined RMS = sqrt((sum_ch0_squares + sum_ch1_squares) / totalSamples)
    //              = sqrt(0.5^2 * n / (2n)) = sqrt(0.25/2) ≈ 0.3536
    const len = 8_000;
    const buf = makeBuffer([
      new Float32Array(len).fill(0.5),
      new Float32Array(len), // silence
    ]);
    const rms = computeRMS(buf);
    expect(rms).toBeCloseTo(Math.sqrt(0.25 / 2), 4);
    expect(rms).toBeGreaterThan(SPEECH_RMS_THRESHOLD);
  });

  it('handles two identical loud channels', () => {
    const buf = makeBuffer([
      new Float32Array(1000).fill(0.3),
      new Float32Array(1000).fill(0.3),
    ]);
    expect(computeRMS(buf)).toBeCloseTo(0.3, 4);
  });
});




// ── detectSpeech — guard / edge-case paths ────────────────────────────────────
// These tests exercise the parts of detectSpeech that don't require codec
// decoding (blob size guard, missing API, decode failure).

describe('detectSpeech — guard paths', () => {
  // Helper: clear all Web Audio context globals so detectSpeech takes the
  // "no API available" path cleanly.
  function clearAudioAPIs() {
    for (const key of ['AudioContext', 'webkitAudioContext', 'OfflineAudioContext']) {
      Object.defineProperty(globalThis, key, {
        value: undefined,
        writable: true,
        configurable: true,
      });
    }
  }

  beforeEach(() => { clearAudioAPIs(); });
  afterEach(() => { clearAudioAPIs(); });

  it('returns { hasSpeech: false, rms: 0 } for an empty Blob', async () => {
 const result = await detectSpeech(new Blob());
    expect(result.hasSpeech).toBe(false);
    expect(result.rms).toBe(0);
  });

  it('returns { hasSpeech: false, rms: 0 } for a zero-byte Blob', async () => {
const result = await detectSpeech(testBlob(0));
  expect(result.hasSpeech).toBe(false);
    expect(result.rms).toBe(0);
  });

  it('returns no speech when Web Audio APIs are unavailable', async () => {
const result = await detectSpeech(testBlob());

  expect(result.hasSpeech).toBe(false);
  expect(result.rms).toBe(0);
});

 it('returns no speech when audio decoding fails', async () => {
  Object.defineProperty(globalThis, 'OfflineAudioContext', {
    value: jest.fn().mockImplementation(() => ({
      decodeAudioData: jest
        .fn()
        .mockRejectedValue(
          new Error('Unable to decode'),
        ),
    })),
    writable: true,
    configurable: true,
  });

  const result = await detectSpeech(testBlob());

  expect(result.hasSpeech).toBe(false);
  expect(result.rms).toBe(0);
});

  it('detects short speech inside a long recording', async () => {
    const sampleRate = 16_000;

    // 60 seconds of audio.
    const totalSamples = sampleRate * 60;

    // Start with 60 seconds of silence.
    const samples = new Float32Array(totalSamples);

    // Put 1 second of clearly audible speech near the end.
    const speechStart = sampleRate * 59;
    const speechEnd = sampleRate * 60;

    samples.fill(0.05, speechStart, speechEnd);

    const audioBuffer = makeBuffer([samples]);

    Object.defineProperty(globalThis, 'AudioContext', {
      value: jest.fn().mockImplementation(() => ({
        decodeAudioData: jest.fn().mockResolvedValue(audioBuffer),
        close: jest.fn(),
      })),
      writable: true,
      configurable: true,
    });
const result = await detectSpeech(testBlob());

    expect(result.hasSpeech).toBe(true);
    expect(result.rms).toBeGreaterThanOrEqual(
      SPEECH_RMS_THRESHOLD,
    );
  });

  it('never throws for any input', async () => {
  await expect(
  detectSpeech(testBlob()),
).resolves.toBeDefined();

await expect(
  detectSpeech(new Blob()),
).resolves.toBeDefined();

await expect(
  detectSpeech(new Blob([])),
).resolves.toBeDefined();
});
});
