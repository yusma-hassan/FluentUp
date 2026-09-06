/**
 * Client-side audio activity detector.
 *
 * The detector decodes the recorded audio and examines short windows
 * instead of calculating one RMS value over the entire recording.
 *
 * This prevents a short spoken response inside a long recording from
 * being incorrectly classified as silence.
 */

export const SPEECH_RMS_THRESHOLD = 0.01;

/**
 * Minimum amount of above-threshold audio required before we consider
 * the recording to contain meaningful audio activity.
 *
 * This prevents a single tiny click/pop from being treated as speech.
 */
export const MIN_ACTIVE_WINDOWS = 2;

/**
 * Size of each analysis window in seconds.
 */
export const RMS_WINDOW_SECONDS = 0.1;

export interface SpeechDetectionResult {
  hasSpeech: boolean;
  rms: number;
}

/**
 * Computes RMS across all samples/channels in an AudioBuffer.
 */
export function computeRMS(buffer: AudioBuffer): number {
  let sumOfSquares = 0;
  let totalSamples = 0;

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const samples = buffer.getChannelData(ch);

    for (let i = 0; i < samples.length; i++) {
      sumOfSquares += samples[i] * samples[i];
    }

    totalSamples += samples.length;
  }

  return totalSamples > 0
    ? Math.sqrt(sumOfSquares / totalSamples)
    : 0;
}

/**
 * Computes RMS for a section of an AudioBuffer.
 */
function computeWindowRMS(
  buffer: AudioBuffer,
  startSample: number,
  endSample: number,
): number {
  let sumOfSquares = 0;
  let totalSamples = 0;

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const samples = buffer.getChannelData(ch);

    const start = Math.max(0, startSample);
    const end = Math.min(samples.length, endSample);

    for (let i = start; i < end; i++) {
      sumOfSquares += samples[i] * samples[i];
      totalSamples++;
    }
  }

  return totalSamples > 0
    ? Math.sqrt(sumOfSquares / totalSamples)
    : 0;
}

/**
 * Decodes a Blob into an AudioBuffer.
 */
async function decodeAudioBlob(
  arrayBuffer: ArrayBuffer,
): Promise<AudioBuffer | null> {
  const g = globalThis as Record<string, unknown>;

  const AudioCtxCtor = (
    g.AudioContext ??
    g.webkitAudioContext
  ) as
    | (new () => {
        decodeAudioData(
          buf: ArrayBuffer,
        ): Promise<AudioBuffer>;
        close(): void;
      })
    | undefined;

  if (AudioCtxCtor) {
    const ctx = new AudioCtxCtor();

    try {
      return await ctx.decodeAudioData(arrayBuffer);
    } finally {
      try {
        ctx.close();
      } catch {
        // Ignore cleanup errors.
      }
    }
  }

  const OfflineCtxCtor = g.OfflineAudioContext as
    | (new (
        channels: number,
        length: number,
        sampleRate: number,
      ) => {
        decodeAudioData(
          buf: ArrayBuffer,
        ): Promise<AudioBuffer>;
      })
    | undefined;

  if (!OfflineCtxCtor) {
    return null;
  }

  const SAMPLE_RATE = 16_000;
  const MAX_SECONDS = 60;

  const ctx = new OfflineCtxCtor(
    1,
    SAMPLE_RATE * MAX_SECONDS,
    SAMPLE_RATE,
  );

  try {
    return await ctx.decodeAudioData(arrayBuffer);
  } catch {
    return null;
  }
}

/**
 * Detects meaningful audio activity.
 *
 * IMPORTANT:
 * This is intentionally an audio-activity detector, not a speech-to-text
 * system. Gemini remains the second-line check for whether actual human
 * speech is present.
 */
export async function detectSpeech(
  blob: Blob,
): Promise<SpeechDetectionResult> {
  if (!blob || blob.size === 0) {
    return {
      hasSpeech: false,
      rms: 0,
    };
  }

  try {
    const arrayBuffer = await blob.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      return {
        hasSpeech: false,
        rms: 0,
      };
    }

    const decoded = await decodeAudioBlob(arrayBuffer);

    if (decoded === null) {
      /**
       * We cannot reliably determine whether the recording contains
       * audio, so we return false rather than allowing an unknown
       * recording to automatically reach the evaluator.
       */
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[detectSpeech] Could not decode audio.',
        );
      }

      return {
        hasSpeech: false,
        rms: 0,
      };
    }

    if (
      decoded.length === 0 ||
      decoded.numberOfChannels === 0
    ) {
      return {
        hasSpeech: false,
        rms: 0,
      };
    }

    const sampleRate = decoded.sampleRate;

    const windowSize = Math.max(
      1,
      Math.floor(sampleRate * RMS_WINDOW_SECONDS),
    );

    let activeWindows = 0;
    let maximumWindowRMS = 0;

    for (
      let start = 0;
      start < decoded.length;
      start += windowSize
    ) {
      const end = Math.min(
        start + windowSize,
        decoded.length,
      );

      const windowRMS = computeWindowRMS(
        decoded,
        start,
        end,
      );

      maximumWindowRMS = Math.max(
        maximumWindowRMS,
        windowRMS,
      );

      if (windowRMS >= SPEECH_RMS_THRESHOLD) {
        activeWindows++;
      }
    }

    const hasSpeech =
      activeWindows >= MIN_ACTIVE_WINDOWS;

    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `[detectSpeech] duration=${decoded.duration.toFixed(2)}s ` +
        `samples=${decoded.length} ` +
        `maxWindowRMS=${maximumWindowRMS.toFixed(5)} ` +
        `activeWindows=${activeWindows} ` +
        `threshold=${SPEECH_RMS_THRESHOLD} ` +
        `hasSpeech=${hasSpeech}`,
      );
    }

    return {
      hasSpeech,
      rms: maximumWindowRMS,
    };
  } catch (error) {
    /**
     * Unlike the previous implementation, an unexpected decoding/
     * processing failure does NOT send the recording to the AI.
     *
     * The requirement is that we must not evaluate recordings when
     * we cannot establish that meaningful audio exists.
     */
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[detectSpeech] Audio analysis failed.',
        error,
      );
    }

    return {
      hasSpeech: false,
      rms: 0,
    };
  }
}