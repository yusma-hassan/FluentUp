'use client';

import { useEffect, useState } from 'react';

type ShapeType =
  | 'bubble'
  | 'mic'
  | 'wave'
  | 'square'
  | 'triangle'
  | 'circle'
  | 'ring'
  | 'circle-ring'
  | 'star';

interface Floater {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  shape: ShapeType;
  opacity: number;
  moveRange: number;
}

const COLORS = [
  'rgba(255, 92, 58, 0.75)',
  'rgba(26, 155, 143, 0.70)',
  'rgba(245, 197, 24, 0.78)',
  'rgba(124, 92, 255, 0.68)',
  'rgba(26, 26, 46, 0.48)',
  'rgba(255, 107, 157, 0.70)',
];

const ZONES = [
  { x: 7, y: 14 },
  { x: 78, y: 7 },
  { x: 18, y: 42 },
  { x: 85, y: 38 },
  { x: 10, y: 72 },
  { x: 70, y: 68 },
  { x: 48, y: 22 },
  { x: 38, y: 78 },
  { x: 88, y: 78 },
];

function createFloaters(): Floater[] {
  const shapes: ShapeType[] = [
    'bubble',
    'ring',          // large dotted ring
    'wave',
    'circle-ring',   // large circle + dotted ring
    'mic',
    'circle',
    'star',
    'square',
    'triangle',
  ];

  return ZONES.map((zone, i) => {
    const shape = shapes[i % shapes.length];

    // Make rings and circle-rings significantly bigger
    const isLargeRing = shape === 'ring' || shape === 'circle-ring';

    const size = isLargeRing
      ? 200 + Math.random() * 50   // 110 – 160px (much larger)
      : 70 + Math.random() * 45;   // normal size for others

    return {
      id: i,
      x: zone.x,
      y: zone.y,
      size,
      color: COLORS[i % COLORS.length],
      duration: 13 + Math.random() * 9,
      delay: Math.random() * -16,
      shape,
      opacity: 0.72 + Math.random() * 0.22,
      moveRange: 14 + Math.random() * 16,
    };
  });
}

// ---------- Shapes ----------

function SpeechBubble({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4h11a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 3v-3H4A2.5 2.5 0 0 1 1.5 12.5v-6A2.5 2.5 0 0 1 4 4z"
        fill={color}
        stroke="rgba(26,26,46,0.25)"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function Mic({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" fill={color} />
      <path
        d="M7 11a5 5 0 0 0 10 0"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="16"
        x2="12"
        y2="20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Wave({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 32 18" fill="none">
      <rect x="1" y="6" width="4" height="6" rx="2" fill={color} />
      <rect x="8" y="3" width="4" height="12" rx="2" fill={color} />
      <rect x="15" y="0" width="4" height="18" rx="2" fill={color} />
      <rect x="22" y="3" width="4" height="12" rx="2" fill={color} />
      <rect x="29" y="6" width="4" height="6" rx="2" fill={color} />
    </svg>
  );
}

function GeometricSquare({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <div
      style={{
        width: size * 0.72,
        height: size * 0.72,
        background: color,
        border: '2.5px solid rgba(26,26,46,0.3)',
        borderRadius: 8,
      }}
    />
  );
}

function GeometricTriangle({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: `${size * 0.42}px solid transparent`,
        borderRight: `${size * 0.42}px solid transparent`,
        borderBottom: `${size * 0.72}px solid ${color}`,
      }}
    />
  );
}

function SoftCircle({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <div
      style={{
        width: size * 0.58,
        height: size * 0.58,
        borderRadius: '50%',
        background: color,
        border: '2.5px solid rgba(26,26,46,0.25)',
      }}
    />
  );
}

function DottedRing({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <div
      className="animate-spin-slow"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3.5px dotted ${color}`,
        background: 'transparent',
      }}
    />
  );
}

function CircleWithRing({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center animate-spin-slow"
      style={{ width: size, height: size }}
    >
      {/* Outer dotted ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `3.5px dotted ${color}`,
          opacity: 0.85,
        }}
      />

      {/* Inner circle with nice spacing */}
      <div
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: '50%',
          background: color,
          border: '2.5px solid rgba(26,26,46,0.2)',
        }}
      />
    </div>
  );
}

function Star({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <svg
      width={size * 0.72}
      height={size * 0.72}
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M12 2l2.4 7.2H22l-6 4.8 2.3 7.2L12 16.8 5.7 21.2 8 14 2 9.2h7.6L12 2z" />
    </svg>
  );
}

// ---------- Main Component ----------

export function FloatingBackground() {
  const [floaters, setFloaters] = useState<Floater[]>([]);

  useEffect(() => {
    setFloaters(createFloaters());
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">

      {/* Top-left shade */}
      <div
        className="absolute z-20 -top-3 -left-32 h-[38rem] w-[38rem] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 140, 120, 0.52) 0%, transparent 70%)',
        }}
      />

      {/* Bottom-right gradient */}
      <div
        className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(160, 220, 210, 0.32) 0%, transparent 70%)',
        }}
      />

      {/* Floating elements */}
      {floaters.map((f) => (
        <div
          key={f.id}
          className="absolute animate-float-zone"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.size,
            height: f.size,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            opacity: f.opacity,
            // @ts-ignore
            '--move-range': `${f.moveRange}px`,
          }}
        >
          {f.shape === 'bubble' && (
            <SpeechBubble color={f.color} size={f.size} />
          )}

          {f.shape === 'mic' && (
            <Mic color={f.color} size={f.size} />
          )}

          {f.shape === 'wave' && (
            <Wave color={f.color} size={f.size} />
          )}

          {f.shape === 'square' && (
            <GeometricSquare color={f.color} size={f.size} />
          )}

          {f.shape === 'triangle' && (
            <GeometricTriangle color={f.color} size={f.size} />
          )}

          {f.shape === 'circle' && (
            <SoftCircle color={f.color} size={f.size} />
          )}

          {f.shape === 'ring' && (
            <DottedRing color={f.color} size={f.size} />
          )}

          {f.shape === 'circle-ring' && (
            <CircleWithRing color={f.color} size={f.size} />
          )}

          {f.shape === 'star' && (
            <Star color={f.color} size={f.size} />
          )}
        </div>
      ))}
      {/* Teal circle with ring — lower left */}
<div
  className="absolute pointer-events-none"
  style={{
    left: '8%',
    top: '50%',
    width: '180px',
    height: '180px',
  }}
>
  {/* Outer ring */}
  <div
    className="absolute inset-0 rounded-full animate-spin-slow"
    style={{
      border: '3px dashed rgba(26, 155, 143, 0.85)',
    }}
  />

  {/* Inner teal circle */}
  <div
    className="absolute inset-[14px] rounded-full"
    style={{
      width:"105px",
      height:"105px",
      background: 'rgba(26, 155, 143, 0.55)',
      border: '2px solid rgba(26, 155, 143, 0.85)',
      
    }}
  />

  {/* Small decorative dot */}
  <div
    className="absolute top-[8px] right-[18px] h-[10px] w-[10px] rounded-full"
    style={{
      background: 'rgba(26, 155, 143, 0.85)',
    }}
  />
</div>
{/* Rotating yellow ring — lower left blob */}
<div
  className="absolute flex items-center justify-center animate-spin-slow"
  style={{
    left: '3%',
    bottom: '22%',
    width: '170px',
    height: '170px',
  }}
>
  {/* Outer yellow ring */}
  <div
    className="absolute inset-0 rounded-full"
    style={{
      border: '4px dotted rgba(245, 197, 24, 0.85)',
    }}
  />

  {/* Small inner yellow circle */}
  <div
    className="rounded-full"
    style={{
      width: '55px',
      height: '55px',
      background: 'rgba(245, 197, 24, 0.45)',
      border: '2px solid rgba(245, 197, 24, 0.75)',
    }}
  />
</div>
    </div>
  );
}




