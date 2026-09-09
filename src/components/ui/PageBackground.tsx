/**
 * PageBackground — per-screen decorative background layer.
 *
 * Each variant places communication-themed SVG shapes in fixed "home zones"
 * distributed across the screen (upper-left, upper-right, middle-left,
 * middle-right, lower-left, lower-right, etc.).
 *
 * Each element is anchored to its zone via absolute positioning and may only
 * drift ±14px via the `fu-zone-float` CSS keyframe — it never crosses into
 * another zone or overlaps foreground content.
 *
 * The component is:
 * - SSR-safe (no useEffect / Math.random — positions are deterministic)
 * - pointer-events-none (never blocks interaction)
 * - fixed + inset-0 (stays behind scrolling content)
 * - hidden from assistive technology (aria-hidden)
 * - animation-free when prefers-reduced-motion is set (CSS media query)
 *
 * Usage:
 *   <div className="relative">
 *     <PageBackground variant="auth" />
 *     <main className="relative z-10">...</main>
 *   </div>
 */
'use client';

// ── SVG shape primitives ──────────────────────────────────────────────────────

function SpeechBubble({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        fill={color}
        stroke="rgba(26,26,46,0.18)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function SmallBubble({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 5h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8l-3 2v-2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
        fill={color}
        stroke="rgba(26,26,46,0.15)"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function Microphone({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3"
        fill={color} stroke="rgba(26,26,46,0.18)" strokeWidth="1.2" />
      <path d="M7 11a5 5 0 0 0 10 0"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="12" y1="16" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="9"  y1="20" x2="15" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SoundWave({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 40 24" fill="none" aria-hidden="true">
      <rect x="1"  y="9"  width="5" height="6"  rx="2.5" fill={color} />
      <rect x="9"  y="5"  width="5" height="14" rx="2.5" fill={color} />
      <rect x="17" y="1"  width="5" height="22" rx="2.5" fill={color} />
      <rect x="25" y="5"  width="5" height="14" rx="2.5" fill={color} />
      <rect x="33" y="9"  width="5" height="6"  rx="2.5" fill={color} />
    </svg>
  );
}

function QuoteMark({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <text
        x="2" y="28"
        fontSize="36"
        fontWeight="900"
        fontFamily="Georgia, serif"
        fill={color}
        opacity="0.9"
      >"</text>
    </svg>
  );
}

function Circle({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

function FilledCircle({ color, size }: { color: string; size: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        border: '2px solid rgba(26,26,46,0.14)',
        flexShrink: 0,
      }}
    />
  );
}

function StructureGrid({ color, size }: { color: string; size: number }) {
  // 3×3 dot grid — represents "structure" / "frameworks"
  const dots = [
    [4,4],[12,4],[20,4],
    [4,12],[12,12],[20,12],
    [4,20],[12,20],[20,20],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.2" fill={color} opacity="0.85" />
      ))}
    </svg>
  );
}

function Star({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
        fill={color}
        stroke="rgba(26,26,46,0.14)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Zone element descriptor ───────────────────────────────────────────────────

interface ZoneElement {
  /** Horizontal anchor, percent of container width. */
  left: string;
  /** Vertical anchor, percent of container height. */
  top: string;
  shape: React.ReactNode;
  /** CSS animation duration (drives fu-zone-float). */
  dur: string;
  /** CSS animation delay (negative = pre-started). */
  delay: string;
  /** Base rotation applied before floating. */
  rotate: number;
  /** Opacity of the wrapper element. */
  opacity: number;
}

// ── Variant compositions ──────────────────────────────────────────────────────

const C = {
  coral:   'rgba(255, 92,  58,  0.72)',
  teal:    'rgba(26,  155, 143, 0.68)',
  yellow:  'rgba(245, 197, 24,  0.70)',
  purple:  'rgba(124, 92,  255, 0.60)',
  navy:    'rgba(26,  26,  46,  0.45)',
  amber:   'rgba(245, 158, 11,  0.65)',
};

function authElements(): ZoneElement[] {
  return [
    // Upper-left — speech bubble (coral)
    { left: '4%',  top: '6%',  shape: <SpeechBubble color={C.coral}  size={72} />, dur: '18s', delay: '0s',   rotate: -8,  opacity: 0.9 },
    // Upper-center — sound wave (teal)
    { left: '38%', top: '3%',  shape: <SoundWave   color={C.teal}   size={70} />, dur: '22s', delay: '-4s',  rotate: 3,   opacity: 0.85 },
    // Upper-right — microphone (yellow)
    { left: '82%', top: '5%',  shape: <Microphone  color={C.yellow} size={62} />, dur: '20s', delay: '-8s',  rotate: 12,  opacity: 0.9 },
    // Mid-left — quote mark (purple)
    { left: '2%',  top: '42%', shape: <QuoteMark   color={C.purple} size={56} />, dur: '24s', delay: '-12s', rotate: 0,   opacity: 0.75 },
    // Mid-right — small bubble (coral)
    { left: '87%', top: '38%', shape: <SmallBubble color={C.coral}  size={48} />, dur: '19s', delay: '-6s',  rotate: -6,  opacity: 0.85 },
    // Lower-left — structure grid (navy)
    { left: '5%',  top: '76%', shape: <StructureGrid color={C.navy} size={48} />, dur: '26s', delay: '-3s',  rotate: 10,  opacity: 0.70 },
    // Lower-center — wave (amber)
    { left: '42%', top: '82%', shape: <SoundWave   color={C.amber}  size={60} />, dur: '21s', delay: '-15s', rotate: -4,  opacity: 0.80 },
    // Lower-right — circle (teal)
    { left: '84%', top: '74%', shape: <Circle       color={C.teal}  size={52} />, dur: '23s', delay: '-9s',  rotate: 0,   opacity: 0.80 },
    // Far upper-left — filled dot (yellow)
    { left: '14%', top: '18%', shape: <FilledCircle color={C.yellow} size={22} />, dur: '16s', delay: '-7s', rotate: 0,   opacity: 0.75 },
    // Far lower-right — filled dot (purple)
    { left: '75%', top: '62%', shape: <FilledCircle color={C.purple} size={18} />, dur: '17s', delay: '-11s', rotate: 0,  opacity: 0.70 },
  ];
}

function challengeElements(): ZoneElement[] {
  return [
    // Upper-left — microphone (coral)
    { left: '3%',  top: '8%',  shape: <Microphone  color={C.coral}  size={64} />, dur: '20s', delay: '0s',   rotate: -10, opacity: 0.85 },
    // Upper-right — speech bubble (teal)
    { left: '83%', top: '5%',  shape: <SpeechBubble color={C.teal}  size={68} />, dur: '22s', delay: '-5s',  rotate: 8,   opacity: 0.85 },
    // Mid-left — structure grid (navy)
    { left: '1%',  top: '45%', shape: <StructureGrid color={C.navy} size={52} />, dur: '28s', delay: '-10s', rotate: 5,   opacity: 0.65 },
    // Mid-right — wave (yellow)
    { left: '86%', top: '42%', shape: <SoundWave   color={C.yellow} size={64} />, dur: '19s', delay: '-8s',  rotate: -5,  opacity: 0.80 },
    // Lower-left — small bubble (purple)
    { left: '4%',  top: '78%', shape: <SmallBubble color={C.purple} size={50} />, dur: '24s', delay: '-14s', rotate: -12, opacity: 0.75 },
    // Lower-right — circle (amber)
    { left: '83%', top: '76%', shape: <Circle      color={C.amber}  size={54} />, dur: '21s', delay: '-3s',  rotate: 0,   opacity: 0.75 },
    // Upper-mid-left — quote (coral)
    { left: '18%', top: '12%', shape: <QuoteMark   color={C.coral}  size={44} />, dur: '17s', delay: '-6s',  rotate: 6,   opacity: 0.70 },
    // Lower-mid-right — dot (teal)
    { left: '72%', top: '68%', shape: <FilledCircle color={C.teal}  size={20} />, dur: '15s', delay: '-9s',  rotate: 0,   opacity: 0.72 },
  ];
}

function dashboardElements(): ZoneElement[] {
  return [
    // Upper-left — wave (coral)
    { left: '2%',  top: '4%',  shape: <SoundWave   color={C.coral}  size={72} />, dur: '22s', delay: '0s',   rotate: -5,  opacity: 0.75 },
    // Upper-right — speech bubble (teal)
    { left: '84%', top: '3%',  shape: <SpeechBubble color={C.teal}  size={66} />, dur: '20s', delay: '-7s',  rotate: 10,  opacity: 0.78 },
    // Mid-left — structure grid (navy)
    { left: '1%',  top: '40%', shape: <StructureGrid color={C.navy} size={56} />, dur: '26s', delay: '-12s', rotate: 0,   opacity: 0.60 },
    // Mid-right — microphone (yellow)
    { left: '87%', top: '38%', shape: <Microphone  color={C.yellow} size={58} />, dur: '19s', delay: '-4s',  rotate: -8,  opacity: 0.78 },
    // Lower-left — star (amber)
    { left: '3%',  top: '78%', shape: <Star        color={C.amber}  size={50} />, dur: '23s', delay: '-10s', rotate: 15,  opacity: 0.72 },
    // Lower-right — small bubble (purple)
    { left: '82%', top: '75%', shape: <SmallBubble color={C.purple} size={52} />, dur: '21s', delay: '-6s',  rotate: -10, opacity: 0.72 },
    // Upper-center — circle (coral)
    { left: '44%', top: '2%',  shape: <Circle      color={C.coral}  size={44} />, dur: '18s', delay: '-3s',  rotate: 0,   opacity: 0.65 },
    // Lower-center — dot (teal)
    { left: '48%', top: '84%', shape: <FilledCircle color={C.teal}  size={22} />, dur: '16s', delay: '-8s',  rotate: 0,   opacity: 0.68 },
    // Far mid-left dot (yellow)
    { left: '10%', top: '22%', shape: <FilledCircle color={C.yellow} size={16} />, dur: '14s', delay: '-5s',  rotate: 0,   opacity: 0.65 },
  ];
}

function feedbackElements(): ZoneElement[] {
  return [
    // Upper-left — star (yellow)
    { left: '3%',  top: '5%',  shape: <Star        color={C.yellow} size={60} />, dur: '20s', delay: '0s',   rotate: -10, opacity: 0.85 },
    // Upper-right — speech bubble (coral)
    { left: '83%', top: '4%',  shape: <SpeechBubble color={C.coral} size={70} />, dur: '22s', delay: '-5s',  rotate: 8,   opacity: 0.85 },
    // Mid-left — wave (teal)
    { left: '1%',  top: '44%', shape: <SoundWave   color={C.teal}   size={68} />, dur: '24s', delay: '-11s', rotate: 3,   opacity: 0.72 },
    // Mid-right — structure grid (navy)
    { left: '87%', top: '40%', shape: <StructureGrid color={C.navy} size={52} />, dur: '27s', delay: '-8s',  rotate: -5,  opacity: 0.62 },
    // Lower-left — circle (purple)
    { left: '3%',  top: '76%', shape: <Circle      color={C.purple} size={52} />, dur: '21s', delay: '-14s', rotate: 0,   opacity: 0.72 },
    // Lower-right — microphone (amber)
    { left: '84%', top: '74%', shape: <Microphone  color={C.amber}  size={60} />, dur: '19s', delay: '-3s',  rotate: 12,  opacity: 0.78 },
    // Upper-mid — quote (coral)
    { left: '40%', top: '2%',  shape: <QuoteMark   color={C.coral}  size={48} />, dur: '18s', delay: '-7s',  rotate: -4,  opacity: 0.72 },
    // Lower-mid — dot (yellow)
    { left: '50%', top: '83%', shape: <FilledCircle color={C.yellow} size={20} />, dur: '15s', delay: '-9s', rotate: 0,   opacity: 0.72 },
  ];
}

// ── Main component ────────────────────────────────────────────────────────────

export type PageBackgroundVariant = 'auth' | 'challenge' | 'dashboard' | 'feedback';

interface PageBackgroundProps {
  variant: PageBackgroundVariant;
  /**
   * Grid opacity — defaults vary slightly by variant.
   * Pass 0 to disable the graph-paper grid.
   */
  gridOpacity?: number;
}

const VARIANT_ELEMENTS: Record<PageBackgroundVariant, () => ZoneElement[]> = {
  auth:      authElements,
  challenge: challengeElements,
  dashboard: dashboardElements,
  feedback:  feedbackElements,
};

export function PageBackground({ variant, gridOpacity }: PageBackgroundProps) {
  const elements = VARIANT_ELEMENTS[variant]();
  const grid = gridOpacity ?? 0.045;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {/* Graph-paper grid texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right,  rgba(26,26,46,${grid}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26,26,46,${grid}) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Soft radial gradient blobs — different tint per variant */}
      {variant === 'auth' && (
        <>
          <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,180,160,0.35) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,92,255,0.22) 0%, transparent 70%)' }} />
        </>
      )}
      {variant === 'challenge' && (
        <>
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(26,155,143,0.26) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,92,58,0.22) 0%, transparent 70%)' }} />
        </>
      )}
      {variant === 'dashboard' && (
        <>
          <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.22) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(26,155,143,0.20) 0%, transparent 70%)' }} />
        </>
      )}
      {variant === 'feedback' && (
        <>
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,92,58,0.25) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.20) 0%, transparent 70%)' }} />
        </>
      )}

      {/* Zone-anchored floating elements */}
      {elements.map((el, i) => (
        <div
          key={i}
          className="absolute fu-zone-float"
          style={{
            left: el.left,
            top: el.top,
            opacity: el.opacity,
            transform: `rotate(${el.rotate}deg)`,
            ['--float-dur' as string]: el.dur,
            ['--float-delay' as string]: el.delay,
          }}
        >
          {el.shape}
        </div>
      ))}
    </div>
  );
}
