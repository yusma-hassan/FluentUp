'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCountdownResult {
  /** Whole seconds remaining. Starts at totalSeconds, counts down to 0. */
  remaining: number;
  /** True while the interval is active; false after completion or skip. */
  running: boolean;
  /** Immediately calls onComplete and stops the timer. */
  skip: () => void;
  /**
   * Adds the given number of seconds to the remaining time.
   * The timer continues running; it does not restart from totalSeconds.
   * Used by the preparation phase "Add 15 Seconds" control.
   */
  addTime: (seconds: number) => void;
}

/**
 * A countdown timer hook backed by setInterval.
 *
 * - Starts automatically on mount (running = true immediately).
 * - Decrements `remaining` by 1 every second.
 * - Calls `onComplete` and stops when `remaining` reaches 0.
 * - `skip()` calls `onComplete` immediately without waiting for the timer.
 * - `addTime(n)` adds n seconds to the current remaining time; timer keeps running.
 * - Cleans up the interval on unmount.
 *
 * Requirements: 4.1–4.8 (prep timer), 5.4–5.6 (recording timer)
 */
export function useCountdown(
  totalSeconds: number,
  onComplete: () => void,
): UseCountdownResult {
  const [remaining, setRemaining] = useState<number>(totalSeconds);
  const [running, setRunning] = useState<boolean>(true);

  // Stable refs so interval closures never capture stale values.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tracks remaining in a ref so the interval callback can read it
  // synchronously without depending on the closed-over state value.
  const remainingRef = useRef<number>(totalSeconds);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const skip = useCallback(() => {
    clearTimer();
    setRunning(false);
    onCompleteRef.current();
  }, [clearTimer]);

  const addTime = useCallback((seconds: number) => {
    setRemaining((prev) => {
      if (prev <= 0) return prev; // already complete — no-op
      const next = prev + seconds;
      remainingRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (totalSeconds <= 0) {
      setRemaining(0);
      remainingRef.current = 0;
      setRunning(false);
      onCompleteRef.current();
      return;
    }

    setRemaining(totalSeconds);
    remainingRef.current = totalSeconds;
    setRunning(true);

    intervalRef.current = setInterval(() => {
      const next = remainingRef.current - 1;
      remainingRef.current = next;

      if (next <= 0) {
        // Clear first, then update state, then fire callback — all synchronous,
        // no nested setTimeout needed (avoids jest fake-timer infinite loops).
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setRemaining(0);
        setRunning(false);
        onCompleteRef.current();
      } else {
        setRemaining(next);
      }
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds]);

  return { remaining, running, skip, addTime };
}
