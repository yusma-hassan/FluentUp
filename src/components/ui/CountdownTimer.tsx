'use client';

import { useCountdown } from '@/hooks/useCountdown';

export function CountdownTimer({
  totalSeconds,
  onComplete,
  running,
}: {
  totalSeconds: number;
  onComplete: () => void;
  running: boolean;
}) {
  const { remaining } = useCountdown(running ? totalSeconds : 0, running ? onComplete : () => {});
  const display = running ? remaining : totalSeconds;
  const formatted = display >= 60
    ? `${Math.floor(display / 60)}:${String(display % 60).padStart(2, '0')}`
    : String(display);

  const urgent = display <= Math.max(totalSeconds * 0.2, 8);
  const warning = display <= Math.max(totalSeconds * 0.35, 15);

  return (
    <div role="timer" className="flex flex-col items-center">
      <span className={`fu-timer ${urgent ? 'urgent' : warning ? 'warning' : ''}`}>
        {formatted}
      </span>
    </div>
  );
}