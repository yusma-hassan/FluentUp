'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';


type MascotTarget = {
  href: string;
  x: number;
  y: number;
};

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const ribbonRef = useRef<HTMLDivElement>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mascot, setMascot] = useState<MascotTarget | null>(null);

  useEffect(() => {
    return () => {
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    element: HTMLAnchorElement
  ) => {
    event.preventDefault();

    if (navigationTimer.current) {
      clearTimeout(navigationTimer.current);
    }

    // Reduced-motion users get normal navigation.
    if (reducedMotion) {
      router.push(href);
      return;
    }

    const ribbon = ribbonRef.current;

    if (!ribbon) {
      router.push(href);
      return;
    }

    const ribbonRect = ribbon.getBoundingClientRect();
    const buttonRect = element.getBoundingClientRect();

    // Position mascot so its center reaches the center of the clicked button.
    const targetX =
      buttonRect.left -
      ribbonRect.left +
      buttonRect.width / 2 -
      18;

    const targetY =
      buttonRect.top -
      ribbonRect.top +
      buttonRect.height / 2 -
      18;

    setMascot({
      href,
      x: targetX,
      y: targetY,
    });

    // Navigation is triggered after the mascot reaches the target.
  };

  return (
    <header className="relative z-50 w-full px-4 pt-6 pb-8">
      <div className="mx-auto flex w-full justify-center">
        <div className="relative w-full max-w-[1000px]">

          {/* ===================== LEFT END ===================== */}

          <div className="pointer-events-none absolute left-[-54px] top-0 h-[64px] w-[54px]">

            {/* V-cut */}
            <div
              className="absolute left-0 top-0 h-full w-[24px]"
              style={{
                background: '#1A1A2E',
                clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
              }}
            />

            {/* Stitching clipped to V-cut */}
            <div
              className="absolute left-0 top-0 h-full w-[24px]"
              style={{
                clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
              }}
            >
              <div
                className="absolute left-[2px] right-[2px] top-[7px] h-[1px]"
                style={{
                  borderTop: '1px dashed rgba(245, 197, 24, 0.9)',
                }}
              />

              <div
                className="absolute bottom-[7px] left-[2px] right-[2px] h-[1px]"
                style={{
                  borderBottom: '1px dashed rgba(245, 197, 24, 0.9)',
                }}
              />
            </div>

            {/* Short straight piece */}
            <div
              className="absolute left-[23px] top-0 h-full w-[14px]"
              style={{
                background: '#1A1A2E',
                borderTop: '2.5px solid #1A1A2E',
                borderBottom: '2.5px solid #1A1A2E',
              }}
            />

            {/* Stitching on straight piece */}
            <div
              className="absolute left-[23px] top-[7px] h-[1px] w-[14px]"
              style={{
                borderTop: '1px dashed rgba(245, 197, 24, 0.9)',
              }}
            />

            <div
              className="absolute bottom-[7px] left-[23px] h-[1px] w-[14px]"
              style={{
                borderBottom: '1px dashed rgba(245, 197, 24, 0.9)',
              }}
            />

            {/* Folded section — NO STITCHING */}
            <div
              className="absolute left-[37px] top-0 h-full w-[17px]"
              style={{
                background: 'linear-gradient(to right, #11111F, #252544)',
                borderTop: '2.5px solid #1A1A2E',
                borderBottom: '2.5px solid #1A1A2E',
              }}
            />
          </div>

          {/* ===================== RIGHT END ===================== */}

          <div className="pointer-events-none absolute right-[-54px] top-0 h-[64px] w-[54px]">

            {/* Folded section — NO STITCHING */}
            <div
              className="absolute right-[37px] top-0 h-full w-[17px]"
              style={{
                background: 'linear-gradient(to left, #11111F, #252544)',
                borderTop: '2.5px solid #1A1A2E',
                borderBottom: '2.5px solid #1A1A2E',
              }}
            />

            {/* Short straight piece */}
            <div
              className="absolute right-[23px] top-0 h-full w-[14px]"
              style={{
                background: '#1A1A2E',
                borderTop: '2.5px solid #1A1A2E',
                borderBottom: '2.5px solid #1A1A2E',
              }}
            />

            {/* Stitching on straight piece */}
            <div
              className="absolute right-[23px] top-[7px] h-[1px] w-[14px]"
              style={{
                borderTop: '1px dashed rgba(245, 197, 24, 0.9)',
              }}
            />

            <div
              className="absolute bottom-[7px] right-[23px] h-[1px] w-[14px]"
              style={{
                borderBottom: '1px dashed rgba(245, 197, 24, 0.9)',
              }}
            />

            {/* V-cut */}
            <div
              className="absolute right-0 top-0 h-full w-[24px]"
              style={{
                background: '#1A1A2E',
                clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
              }}
            />

            {/* Stitching clipped to V-cut */}
            <div
              className="absolute right-0 top-0 h-full w-[24px]"
              style={{
                clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
              }}
            >
              <div
                className="absolute left-[2px] right-[2px] top-[7px] h-[1px]"
                style={{
                  borderTop: '1px dashed rgba(245, 197, 24, 0.9)',
                }}
              />

              <div
                className="absolute bottom-[7px] left-[2px] right-[2px] h-[1px]"
                style={{
                  borderBottom: '1px dashed rgba(245, 197, 24, 0.9)',
                }}
              />
            </div>
          </div>

          {/* ===================== MAIN RIBBON ===================== */}

          <div
            ref={ribbonRef}
            className="relative z-10 h-[64px] w-full overflow-hidden"
            style={{
              background: '#1A1A2E',
              borderTop: '2.5px solid #1A1A2E',
              borderBottom: '2.5px solid #1A1A2E',
              boxShadow: '0 4px 0 #1A1A2E',
            }}
          >

            {/* Top stitching */}
            <div
              className="pointer-events-none absolute left-[22px] right-[22px] top-[7px] h-[1px]"
              style={{
                borderTop: '1px dashed rgba(245, 197, 24, 0.9)',
              }}
            />

            {/* Bottom stitching */}
            <div
              className="pointer-events-none absolute bottom-[7px] left-[22px] right-[22px] h-[1px]"
              style={{
                borderBottom: '1px dashed rgba(245, 197, 24, 0.9)',
              }}
            />

            {/* ===================== MASCOT ===================== */}

            {mascot && (
              <motion.div
                key={`${mascot.href}-${mascot.x}-${mascot.y}`}
                className="pointer-events-none absolute left-0 top-0 z-40"
                initial={{
                  x: -50,
                  y: 8,
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  x: mascot.x,
                  y: mascot.y,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.2,
                }}
                transition={{
                  x: {
                    duration: 1.7,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  y: {
                    duration: 1.7,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  opacity: {
                    duration: 0.2,
                  },
                  scale: {
                    duration: 1.15,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                }}
                onAnimationComplete={() => {
  navigationTimer.current = setTimeout(() => {
    setMascot(null);
    router.push(mascot.href);
  }, 220);
}}
              >
                <FluentMascot />
              </motion.div>
            )}

            {/* Content */}
            <div className="relative z-20 flex h-full items-center justify-between px-14">

              {/* Logo */}
              <Link
                href="/"
                className="font-serif text-[20px] font-bold tracking-wide text-white transition-opacity duration-200 hover:opacity-90"
              >
                <span className="flex items-center gap-2">
  <Image
    src="/images/fluentup-logo.png"
    alt="FluentUp"
    width={38}
    height={38}
    priority
    className="h-[38px] w-[38px] object-contain"
  />

  <span>
    Fluent<span className="text-[#F5C518]">Up</span>
  </span>
</span>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-2">
                <NavItem
                  href="/challenge"
                  active={isActive('/challenge')}
                  onClick={handleNavClick}
                >
                  Practice
                </NavItem>

                <NavItem
                  href="/dashboard"
                  active={isActive('/dashboard')}
                  onClick={handleNavClick}
                >
                  Dashboard
                </NavItem>

                <NavItem
                  href="/logout"
                  active={false}
                  onClick={handleNavClick}
                >
                  Sign out
                </NavItem>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


/* ================================================================
   NAV ITEM
   ================================================================ */

function NavItem({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick: (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    element: HTMLAnchorElement
  ) => void;
}) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick(event, href, event.currentTarget);
      }}
      className="group relative mx-1 rounded-md px-5 py-2.5 text-[15px] font-semibold transition-all duration-200 ease-out hover:bg-[#F5C518]/10"
      style={{
        color: active ? '#F5C518' : '#FFFFFF',
      }}
    >
      {/* Navigation text */}
      <span className="relative z-10 transition-colors duration-200 group-hover:text-[#F5C518]">
        {children}
      </span>

      {/* Active underline / hover underline */}
      <span
        className={`absolute bottom-[4px] left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-[#F5C518] transition-all duration-200 ease-out ${
          active
            ? 'w-[24px] opacity-100'
            : 'w-0 opacity-0 group-hover:w-[24px] group-hover:opacity-100'
        }`}
      />

      {/* Subtle hover glow */}
      <span
        className="pointer-events-none absolute inset-x-2 bottom-0 top-0 rounded-md opacity-0 shadow-[0_0_14px_rgba(245,197,24,0.2)] transition-opacity duration-200 group-hover:opacity-100"
      />
    </Link>
  );
}


/* ================================================================
   FLUENTUP MASCOT
   ================================================================ */

function FluentMascot() {
  return (
    <div className="fu-mascot" aria-hidden="true">
      <div className="fu-mascot-shadow" />

      <svg
        className="fu-mascot-svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
      >
        {/* ==================== EARS ==================== */}

        <circle
          cx="11"
          cy="11"
          r="7"
          fill="#1A1A2E"
        />

        <circle
          cx="37"
          cy="11"
          r="7"
          fill="#1A1A2E"
        />

        {/* ==================== HEAD ==================== */}

        <circle
          cx="24"
          cy="21"
          r="16"
          fill="#FFFFFF"
          stroke="#1A1A2E"
          strokeWidth="2.5"
        />

        {/* ==================== EYE PATCHES ==================== */}

        <ellipse
          cx="17"
          cy="20"
          rx="5"
          ry="6"
          transform="rotate(25 17 20)"
          fill="#1A1A2E"
        />

        <ellipse
          cx="31"
          cy="20"
          rx="5"
          ry="6"
          transform="rotate(-25 31 20)"
          fill="#1A1A2E"
        />

        {/* ==================== EYES ==================== */}

        <circle
          cx="18"
          cy="20"
          r="2"
          fill="#FFFFFF"
        />

        <circle
          cx="30"
          cy="20"
          r="2"
          fill="#FFFFFF"
        />

        {/* Eye highlights */}
        <circle
          cx="18.7"
          cy="19.3"
          r="0.65"
          fill="#1A1A2E"
        />

        <circle
          cx="30.7"
          cy="19.3"
          r="0.65"
          fill="#1A1A2E"
        />

        {/* ==================== NOSE ==================== */}

        <ellipse
          cx="24"
          cy="26"
          rx="2.8"
          ry="2"
          fill="#1A1A2E"
        />

        {/* ==================== MOUTH ==================== */}

        <path
          d="M24 27.5C22.5 30 20.5 30 19 28.5"
          stroke="#1A1A2E"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M24 27.5C25.5 30 27.5 30 29 28.5"
          stroke="#1A1A2E"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        {/* ==================== BLUSH ==================== */}

        <ellipse
          cx="11.5"
          cy="27"
          rx="3"
          ry="1.7"
          fill="#FF8F7A"
          opacity="0.75"
        />

        <ellipse
          cx="36.5"
          cy="27"
          rx="3"
          ry="1.7"
          fill="#FF8F7A"
          opacity="0.75"
        />

        {/* ==================== BODY ==================== */}

        <ellipse
          cx="24"
          cy="38"
          rx="10"
          ry="8"
          fill="#1A1A2E"
        />

        {/* White belly */}
        <ellipse
          cx="24"
          cy="38"
          rx="5.5"
          ry="4.5"
          fill="#FFFFFF"
        />

        {/* ==================== ARMS ==================== */}

        <path
          d="M15 34L10 37"
          stroke="#1A1A2E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <path
          d="M33 34L38 37"
          stroke="#1A1A2E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* ==================== FEET ==================== */}

        <g className="fu-mascot-leg-left">
          <ellipse
            cx="18"
            cy="45"
            rx="5"
            ry="2.8"
            fill="#1A1A2E"
          />

          <ellipse
            cx="15.8"
            cy="44.8"
            rx="1.3"
            ry="0.7"
            fill="#F5C518"
          />
        </g>

        <g className="fu-mascot-leg-right">
          <ellipse
            cx="30"
            cy="45"
            rx="5"
            ry="2.8"
            fill="#1A1A2E"
          />

          <ellipse
            cx="32.2"
            cy="44.8"
            rx="1.3"
            ry="0.7"
            fill="#F5C518"
          />
        </g>
      </svg>
    </div>
  );
}