/**
 * @jest-environment jsdom
 *
 * Unit tests for useCountdown — automatic start, addTime, skip, and completion.
 *
 * Tests verify:
 * - Timer starts automatically (no user action required).
 * - Default preparation time is 15 seconds (hook initialised with 15).
 * - addTime(15) adds exactly 15 seconds to the remaining time.
 * - skip() immediately fires onComplete.
 * - Timer reaching zero automatically fires onComplete.
 */

import { act, renderHook } from '@testing-library/react';
import { useCountdown } from '../useCountdown';

// Use fake timers so we can control setInterval without real wall-clock delays.
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function tick(seconds: number) {
  act(() => {
    jest.advanceTimersByTime(seconds * 1000);
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useCountdown — auto-start', () => {
  it('starts running immediately without any user action', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useCountdown(15, onComplete));

    // Before any time passes, the hook is running and at the initial value.
    expect(result.current.running).toBe(true);
    expect(result.current.remaining).toBe(15);
  });

  it('initialises to the given totalSeconds (15 for default preparation)', () => {
    const { result } = renderHook(() => useCountdown(15, jest.fn()));
    expect(result.current.remaining).toBe(15);
  });

  it('decrements by 1 each second', () => {
    const { result } = renderHook(() => useCountdown(15, jest.fn()));

    tick(1);
    expect(result.current.remaining).toBe(14);

    tick(1);
    expect(result.current.remaining).toBe(13);
  });
});

describe('useCountdown — addTime', () => {
  it('adds exactly 15 seconds to the remaining time', () => {
    const { result } = renderHook(() => useCountdown(15, jest.fn()));

    // Advance 5 seconds → 10 remaining.
    tick(5);
    expect(result.current.remaining).toBe(10);

    // Add 15 seconds → 25 remaining.
    act(() => {
      result.current.addTime(15);
    });
    expect(result.current.remaining).toBe(25);
  });

  it('timer continues running after addTime — does not restart from totalSeconds', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useCountdown(15, onComplete));

    tick(5);
    act(() => {
      result.current.addTime(15);
    });

    // After adding time the timer is still running.
    expect(result.current.running).toBe(true);
    // onComplete has not been called.
    expect(onComplete).not.toHaveBeenCalled();

    // Advance by the added time + original remaining — should complete now.
    tick(25);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('adding time multiple times accumulates correctly', () => {
    const { result } = renderHook(() => useCountdown(15, jest.fn()));

    tick(10); // 5 remaining
    act(() => { result.current.addTime(15); }); // 20
    act(() => { result.current.addTime(15); }); // 35

    expect(result.current.remaining).toBe(35);
  });

  it('addTime is a no-op when the timer has already completed', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useCountdown(5, onComplete));

    tick(5); // reaches zero → complete
    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.addTime(15);
    });
    // Remaining stays at 0 after completion.
    expect(result.current.remaining).toBe(0);
  });
});

describe('useCountdown — skip', () => {
  it('skip() immediately fires onComplete without waiting for the timer', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useCountdown(15, onComplete));

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      result.current.skip();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.running).toBe(false);
  });

  it('skip() stops the interval so onComplete is not called again at zero', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useCountdown(15, onComplete));

    act(() => { result.current.skip(); });
    tick(15); // advance past original end — should not fire again

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('useCountdown — automatic completion at zero', () => {
  it('fires onComplete automatically when the timer reaches zero', () => {
    const onComplete = jest.fn();
    renderHook(() => useCountdown(15, onComplete));

    tick(15);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire onComplete before the timer reaches zero', () => {
    const onComplete = jest.fn();
    renderHook(() => useCountdown(15, onComplete));

    tick(14);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('sets running to false after completion', () => {
    const { result } = renderHook(() => useCountdown(5, jest.fn()));
    tick(5);
    expect(result.current.running).toBe(false);
  });
});

describe('useCountdown — cleanup on unmount', () => {
  it('does not fire onComplete after unmount', () => {
    const onComplete = jest.fn();
    const { unmount } = renderHook(() => useCountdown(15, onComplete));

    tick(5);
    unmount();
    tick(10); // would have fired if still mounted

    expect(onComplete).not.toHaveBeenCalled();
  });
});
