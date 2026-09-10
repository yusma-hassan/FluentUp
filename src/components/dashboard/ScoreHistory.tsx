'use client';

/**
 * ScoreHistory — inline SVG sparkline showing score progression.
 *
 * No charting library — pure SVG path drawn from the score array.
 * Accepts up to the last 20 attempts, oldest-first.
 */

import { motion } from 'motion/react';
import { varFadeUp } from '@/lib/motion';

interface ScorePoint {
  score: number;
  completedAt: string;
  frameworkName: string;
}

interface ScoreHistoryProps {
  points: ScorePoint[];
}

const W = 600;
const H = 120;
const PAD_X = 8;
const PAD_Y = 12;

function buildPath(scores: number[]): string {
  if (scores.length < 2) return '';
  const n = scores.length;
  const xStep = (W - PAD_X * 2) / (n - 1);

  return scores
    .map((s, i) => {
      const x = PAD_X + i * xStep;
      const y = PAD_Y + ((100 - s) / 100) * (H - PAD_Y * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function scoreColor(score: number) {
  if (score >= 75) return 'var(--teal)';
  if (score >= 50) return 'var(--amber)';
  return 'var(--coral)';
}

export function ScoreHistory({ points }: ScoreHistoryProps) {
  const scores = points.map((p) => p.score);
  const path = buildPath(scores);
  const latest = points.at(-1);

  // y-gridlines at 25, 50, 75, 100
  const gridLines = [25, 50, 75, 100];

  return (
    <motion.div
      className="fu-card flex flex-col gap-4"
      variants={varFadeUp}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Score History
        </p>
        {latest && (
          <span className="fu-chip">
            Latest: {latest.score}/100
          </span>
        )}
      </div>

      {scores.length < 2 ? (
        <p className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>
          Complete at least 2 challenges to see your trend.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ minWidth: 240, height: 120 }}
            aria-label="Score history chart"
            role="img"
          >
            {/* Grid lines */}
            {gridLines.map((g) => {
              const y = PAD_Y + ((100 - g) / 100) * (H - PAD_Y * 2);
              return (
                <g key={g}>
                  <line
                    x1={PAD_X} y1={y} x2={W - PAD_X} y2={y}
                    stroke="var(--grey-200)" strokeWidth="1" strokeDasharray="4 4"
                  />
                  <text
                    x={PAD_X - 2} y={y + 4}
                    fontSize="8" textAnchor="end" fill="var(--grey-400)"
                  >
                    {g}
                  </text>
                </g>
              );
            })}

            {/* Area fill under the line */}
            {path && (
              <path
                d={`${path} L${(PAD_X + (scores.length - 1) * ((W - PAD_X * 2) / (scores.length - 1))).toFixed(1)},${H - PAD_Y} L${PAD_X},${H - PAD_Y} Z`}
                fill="var(--coral)"
                fillOpacity="0.08"
              />
            )}

            {/* Line */}
            {path && (
              <path
                d={path}
                fill="none"
                stroke="var(--coral)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {scores.map((s, i) => {
              const n = scores.length;
              const x = PAD_X + i * ((W - PAD_X * 2) / (n - 1));
              const y = PAD_Y + ((100 - s) / 100) * (H - PAD_Y * 2);
              return (
                <circle
                  key={i}
                  cx={x} cy={y} r={i === n - 1 ? 5 : 3.5}
                  fill={scoreColor(s)}
                  stroke="var(--navy)"
                  strokeWidth="1.5"
                >
                 <title>
  {`${points[i].frameworkName} — ${s}/100 (${new Date(points[i].completedAt)
    .toISOString()
    .slice(0, 10)})`}
</title>
                </circle>
              );
            })}
          </svg>
        </div>
      )}
    </motion.div>
  );
}
