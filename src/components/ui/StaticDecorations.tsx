'use client';

export function StaticDecorations() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >

      {/* ========================================= */}
      {/* UPPER SECTION */}
      {/* ========================================= */}

      {/* LEFT TOP SOFT PINK SHADE */}
      <div
        className="absolute"
        style={{
          top: '-80px',
          left: '-140px',
          width: '520px',
          height: '520px',
          background:
            'radial-gradient(circle, rgba(255, 140, 120, 0.30) 0%, rgba(255, 140, 120, 0.14) 42%, transparent 72%)',
        }}
      />

      {/* LEFT TOP CORAL ORGANIC BLOB */}
      <div
        className="absolute"
        style={{
          top: '8%',
          left: '-15%',
          width: '430px',
          height: '300px',
          background: '#FF8068',
          opacity: 0.20,
          borderRadius: '63% 37% 48% 52% / 55% 48% 52% 45%',
          transform: 'rotate(-18deg)',
        }}
      />

      {/* LEFT TOP AMBER ACCENT */}
      <div
        className="absolute"
        style={{
          top: '19%',
          left: '-35px',
          width: '90px',
          height: '90px',
          background: '#F5C518',
          borderRadius: '50%',
          opacity: 0.85,
        }}
      />

      {/* RIGHT TOP SOFT TEAL SHADE */}
      <div
        className="absolute"
        style={{
          top: '-90px',
          right: '-150px',
          width: '540px',
          height: '540px',
          background:
            'radial-gradient(circle, rgba(26, 155, 143, 0.22) 0%, rgba(26, 155, 143, 0.10) 42%, transparent 72%)',
        }}
      />

      {/* RIGHT TOP TEAL ORGANIC BLOB */}
      <div
        className="absolute"
        style={{
          top: '-10%',
          right: '-17%',
          width: '500px',
          height: '350px',
          background: '#1A9B8F',
          opacity: 0.10,
          borderRadius: '42% 58% 52% 48% / 55% 40% 60% 45%',
          transform: 'rotate(20deg)',
        }}
      />

      {/* RIGHT TOP AMBER CIRCLE */}
      <div
        className="absolute"
        style={{
          top: '17%',
          right: '3%',
          width: '62px',
          height: '62px',
          background: '#F5C518',
          borderRadius: '50%',
          opacity: 0.9,
        }}
      />

      {/* RIGHT SIDE CORAL SPLASH */}
      <div
        className="absolute"
        style={{
          top: '38%',
          right: '-18%',
          width: '430px',
          height: '330px',
          background: '#FF5C3A',
          opacity: 0.10,
          borderRadius: '55% 45% 61% 39% / 42% 60% 40% 58%',
          transform: 'rotate(-12deg)',
        }}
      />

      {/* SMALL PURPLE DOT */}
      <div
        className="absolute"
        style={{
          top: '48%',
          right: '5%',
          width: '48px',
          height: '48px',
          background: '#7C5CFF',
          borderRadius: '50%',
          opacity: 0.55,
        }}
      />

      {/* ========================================= */}
      {/* LOWER SECTION */}
      {/* ========================================= */}

      {/* LOWER LEFT SOFT AMBER SHADE */}
<div
  className="absolute"
  style={{
    bottom: '-110px',
    left: '-150px',
    width: '540px',
    height: '540px',
    background:
      'radial-gradient(circle, rgba(245, 197, 24, 0.34) 0%, rgba(245, 197, 24, 0.16) 42%, transparent 72%)',
  }}
/>

{/* LOWER LEFT AMBER ORGANIC BLOB */}
<div
  className="absolute"
  style={{
    bottom: '-12%',
    left: '-15%',
    width: '430px',
    height: '300px',
    background: '#F5C518',
    opacity: 0.28,
    borderRadius: '63% 37% 48% 52% / 55% 48% 52% 45%',
    transform: 'rotate(18deg)',
  }}
/>

{/* LOWER MIDDLE LEFT SOFT AMBER SHADE */}
<div
  className="absolute"
  style={{
    bottom: '18%',
    left: '-130px',
    width: '430px',
    height: '430px',
    background:
      'radial-gradient(circle, rgba(245, 197, 24, 0.18) 0%, rgba(245, 197, 24, 0.08) 45%, transparent 72%)',
  }}
/>

{/* LOWER MIDDLE LEFT AMBER ORGANIC BLOB */}
<div
  className="absolute"
  style={{
    bottom: '24%',
    left: '-150px',
    width: '300px',
    height: '220px',
    background: '#F5C518',
    opacity: 0.13,
    borderRadius: '48% 52% 63% 37% / 42% 58% 45% 55%',
    transform: 'rotate(-15deg)',
  }}
/>

    </div>
  );
}