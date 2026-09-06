'use client';

import { useCallback, useRef, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AudioRecorderState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'stopped'
  | 'error';

export interface UseAudioRecorderResult {
  state: AudioRecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  audioBlob: Blob | null;
  durationMs: number | null;
  error: string | null;
  /** True when the recorded audio is shorter than 3 seconds. */
  shortRecordingWarning: boolean;
}

// ── MIME type preference list ─────────────────────────────────────────────────

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/wav',
] as const;

/**
 * Exported for property-based testing (P9).
 * Returns true when durationMs is strictly less than 3000.
 */
export function computeShortRecordingWarning(durationMs: number): boolean {
  return durationMs < 3000;
}

function selectMimeType(): string {
  // MediaRecorder is only available in browser contexts.
  if (typeof MediaRecorder === 'undefined') return '';
  return PREFERRED_MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Manages the full MediaRecorder lifecycle for audio capture.
 *
 * - Prefers `audio/webm;codecs=opus`, falls back through `audio/webm`,
 *   `audio/ogg;codecs=opus`, `audio/wav`.
 * - Tracks duration from startRecording() call to stopRecording() call.
 * - Sets `shortRecordingWarning = true` when duration < 3000 ms.
 * - Handles mic denial, MediaRecorder errors, and mid-recording data loss.
 *
 * Requirements: 5.1–5.12
 */
export function useAudioRecorder(): UseAudioRecorderResult {
  const [state, setState] = useState<AudioRecorderState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shortRecordingWarning, setShortRecordingWarning] = useState<boolean>(false);

  // Internal refs — not part of render state.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const mimeTypeRef = useRef<string>('');
  // Track whether recording is active in a ref so ondataavailable closure is not stale.
  const isRecordingRef = useRef<boolean>(false);

  /**
   * Tears down the MediaRecorder and MediaStream tracks without affecting
   * the accumulated state (blob, duration, error) already set on render state.
   */
  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current) {
      // Remove all listeners to prevent stale callbacks firing after cleanup.
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.onerror = null;
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    // Reset all output state for a fresh recording attempt.
    setAudioBlob(null);
    setDurationMs(null);
    setError(null);
    setShortRecordingWarning(false);
    chunksRef.current = [];
    startTimeRef.current = null;

    setState('requesting');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState('error');
      setError(
        'Microphone access was denied. Please allow microphone access in your browser settings and try again.'
      );
      return;
    }

    streamRef.current = stream;
    const mimeType = selectMimeType();
    mimeTypeRef.current = mimeType;

    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch {
      setState('error');
      setError(
        'Your browser does not support audio recording. Please try a different browser.'
      );
      cleanup();
      return;
    }

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event: BlobEvent) => {
console.log('[AudioRecorder:dataavailable]', {
    chunkSize: event.data.size,
    chunkType: event.data.type,
    recorderState: recorder.state,
    chunkCount: chunksRef.current.length + 1,
  });

      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      } else if (isRecordingRef.current) {
        // Empty data mid-recording — signal a disconnect error.
        isRecordingRef.current = false;
        setState('error');
        setError(
          'The microphone was disconnected during recording. Please reconnect and try again.'
        );
        cleanup();
      }
    };

    recorder.onstop = () => {
      isRecordingRef.current = false;
      const stopTime = Date.now();
      const startTime = startTimeRef.current ?? stopTime;
      const elapsed = stopTime - startTime;

      const blob = new Blob(chunksRef.current, {
        type: mimeTypeRef.current || 'audio/webm',
      });
        
      setAudioBlob(blob);
      setDurationMs(elapsed);
      setShortRecordingWarning(computeShortRecordingWarning(elapsed));
      setState('stopped');

      // Release microphone tracks after assembling the blob.
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    recorder.onerror = () => {
      isRecordingRef.current = false;
      setState('error');
      setError(
        'The microphone was disconnected during recording. Please reconnect and try again.'
      );
      cleanup();
    };

    startTimeRef.current = Date.now();
    recorder.start(1000);
    isRecordingRef.current = true;
    setState('recording');
  }, [cleanup]);

  const stopRecording = useCallback(() => {
  const recorder = mediaRecorderRef.current;

  //temporary add
   console.log('[AudioRecorder:stopRecording]', {
    recorderState: recorder?.state,
  });

  if (!recorder || recorder.state === 'inactive') return;

  recorder.stop();
}, []);
  return {
    state,
    startRecording,
    stopRecording,
    audioBlob,
    durationMs,
    error,
    shortRecordingWarning,
  };
}
