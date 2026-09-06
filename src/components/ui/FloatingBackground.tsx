'use client';

import { useEffect, useState } from 'react';

type ThemeShape = 'bubble' | 'mic' | 'wave' | 'dot';

interface Floater {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  shape: ThemeShape;
  rotate: number;
  opacity: number;
}

const COLORS = [
  'rgba(255, 92, 58, 0.38)',   // coral - stronger
  'rgba(26, 155, 143, 0.34)',  // teal
  'rgba(245, 197, 24, 0.36)',  // yellow
  'rgba(124, 92, 255, 0.28)',  // purple
  'rgba(26, 26, 46, 0.18)',    // navy soft
];

function createFloaters(count: number): Floater[] {
  const shapes: ThemeShape[] = [
    'bubble', 'mic', 'wave', 'bubble', 'wave',
    'mic', 'bubble', 'wave', 'dot', 'bubble',
    'mic', 'wave', 'bubble', 'dot', 'wave',
    'mic', 'bubble', 'wave', 'dot', 'bubble'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 52 + Math.random() * 70,          // much larger (52–122px)
    color: COLORS[i % COLORS.length],
    duration: 16 + Math.random() * 14,
    delay: Math.random() * -25,
    shape: shapes[i % shapes.length],
    rotate: Math.random() * 36 - 18,
    opacity: 0.75 + Math.random() * 0.2,    // stronger visibility
  }));
}

// ---------- Icons ----------
function SpeechBubble({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-5l-4.5 3.5V17H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"
        fill={color}
        stroke="rgba(26,26,46,0.22)"
        strokeWidth="1.3"
      />
      <circle cx="17.8" cy="6.2" r="3.4" fill={color} opacity="0.75" />
    </svg>
  );
}

function Microphone({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect
        x="9"
        y="3"
        width="6"
        height="11"
        rx="3"
        fill={color}
        stroke="rgba(26,26,46,0.22)"
        strokeWidth="1.3"
      />
      <path
        d="M7 11a5 5 0 0 0 10 0"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="12" y1="16" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="20" x2="15" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SoundWave({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 32 20" fill="none">
      <rect x="1" y="7" width="4" height="6" rx="2" fill={color} />
      <rect x="8" y="3.5" width="4" height="13" rx="2" fill={color} />
      <rect x="15" y="0.5" width="4" height="19" rx="2" fill={color} />
      <rect x="22" y="3.5" width="4" height="13" rx="2" fill={color} />
      <rect x="29" y="7" width="4" height="6" rx="2" fill={color} />
    </svg>
  );
}

function SoftDot({ color, size }: { color: string; size: number }) {
  return (
    <div
      style={{
        width: size * 0.5,
        height: size * 0.5,
        borderRadius: '50%',
        background: color,
        border: '2px solid rgba(26,26,46,0.15)',
      }}
    />
  );
}

// ---------- Main component ----------
export function FloatingBackground() {
  const [floaters, setFloaters] = useState<Floater[]>([]);

  useEffect(() => {
    setFloaters(createFloaters(20));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      
      {/* ===== GRAPH PAPER GRID (exactly like the image) ===== */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'transparent',
          backgroundImage: `
            linear-gradient(to right, rgba(26, 26, 46, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26, 26, 46, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px', // ← change this number to make grid denser/sparser
        }}
      />

      {/* Soft base gradients (keep these so it doesn’t look flat) */}
      <div
        className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,180,160,0.42) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(160,220,210,0.36) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.18) 0%, transparent 70%)' }}
      />

      {/* Floating themed icons */}
      {floaters.map((f) => (
        <div
          key={f.id}
          className="absolute animate-float"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.size,
            height: f.size,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            transform: `rotate(${f.rotate}deg)`,
            opacity: f.opacity,
          }}
        >
          {f.shape === 'bubble' && <SpeechBubble color={f.color} size={f.size} />}
          {f.shape === 'mic' && <Microphone color={f.color} size={f.size} />}
          {f.shape === 'wave' && <SoundWave color={f.color} size={f.size} />}
          {f.shape === 'dot' && <SoftDot color={f.color} size={f.size} />}
        </div>
      ))}
    </div>
  );
}