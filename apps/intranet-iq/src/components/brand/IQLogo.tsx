"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

interface IQLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function IQLogo({ size = "md", showText = false, className = "" }: IQLogoProps) {
  const [glitch, setGlitch] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Initial glitch
    setTimeout(() => {
      triggerGlitch();
    }, 500);

    // Periodic subtle glitch
    const interval = setInterval(() => {
      triggerGlitch();
    }, 4000);

    // Idle pulse animation - subtle breathing effect
    let pulseAnimation: gsap.core.Tween | null = null;
    if (logoRef.current) {
      pulseAnimation = gsap.to(logoRef.current, {
        boxShadow: "0 4px 30px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    return () => {
      clearInterval(interval);
      if (pulseAnimation) pulseAnimation.kill();
    };
  }, []);

  const triggerGlitch = () => {
    setGlitch(true);

    // GSAP glitch animation for the text
    if (textRef.current) {
      const tl = gsap.timeline();

      // Quick horizontal jitter
      tl.to(textRef.current, {
        x: 2,
        duration: 0.05,
        ease: "power2.inOut",
      })
        .to(textRef.current, {
          x: -2,
          duration: 0.05,
          ease: "power2.inOut",
        })
        .to(textRef.current, {
          x: 1,
          duration: 0.03,
          ease: "power2.inOut",
        })
        .to(textRef.current, {
          x: 0,
          duration: 0.03,
          ease: "power2.inOut",
        });
    }

    setTimeout(() => setGlitch(false), 150);

    // Double-tap stuttering effect (50% chance)
    if (Math.random() > 0.5) {
      setTimeout(() => {
        setGlitch(true);
        if (textRef.current) {
          gsap.to(textRef.current, {
            x: -1,
            duration: 0.04,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.to(textRef.current, { x: 0, duration: 0.04 });
            },
          });
        }
        setTimeout(() => setGlitch(false), 80);
      }, 50);
    }
  };

  // Unified sizing system - now with Ember colors
  const sizes = {
    sm: { container: "h-7 px-1.5", d: 16, iq: 9, dot: 4, dotOffset: 1 },
    md: { container: "h-8 px-2", d: 20, iq: 11, dot: 5, dotOffset: 1 },
    lg: { container: "h-10 px-2.5", d: 26, iq: 14, dot: 6, dotOffset: 2 },
    xl: { container: "h-12 px-3", d: 32, iq: 17, dot: 7, dotOffset: 2 },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo container - Ember gradient */}
      <div
        ref={logoRef}
        className={`${s.container} rounded-xl bg-gradient-to-br from-[var(--accent-ember)] via-[var(--accent-copper)] to-[var(--accent-ember)] flex items-center justify-center relative overflow-hidden cursor-pointer`}
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          boxShadow: "0 4px 20px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
        onMouseEnter={triggerGlitch}
      >
        {/* Glitch layers */}
        {glitch && (
          <>
            <span
              className="absolute inset-0 flex items-center justify-center opacity-60"
              style={{ transform: "translate(-1.5px, 0)" }}
            >
              <LogoText s={s} color="#fbbf24" ref={null} /> {/* Gold glitch */}
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center opacity-60"
              style={{ transform: "translate(1.5px, 0)" }}
            >
              <LogoText s={s} color="#fb923c" ref={null} /> {/* Orange glitch */}
            </span>
          </>
        )}

        {/* Main logo */}
        <span className="relative z-10">
          <LogoText s={s} color="#ffffff" glowing={glitch} ref={textRef} />
        </span>

        {/* Shine effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          style={{
            animation: "shine 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Optional text label */}
      {showText && (
        <div className="flex flex-col">
          <span
            className="text-[var(--text-primary)] font-medium leading-tight tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="font-light text-[var(--text-muted)]">digital</span>
            {" "}
            <span className="text-[var(--accent-ember)]">intranet</span>
          </span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Knowledge Network</span>
        </div>
      )}

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          50%, 100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

// Unified logo text component for seamless rendering
interface LogoTextProps {
  s: { d: number; iq: number; dot: number; dotOffset: number };
  color: string;
  glowing?: boolean;
  ref: React.Ref<SVGSVGElement>;
}

const LogoText = ({ s, color, glowing = false, ref }: LogoTextProps) => {
  const fontFamily = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace";

  return (
    <svg
      ref={ref}
      height={s.d}
      viewBox={`0 0 ${s.d * 1.7} ${s.d}`}
      style={{ overflow: "visible" }}
    >
      {/* Bold "d" */}
      <text
        x="0"
        y={s.d * 0.78}
        fill={color}
        fontSize={s.d}
        fontWeight="700"
        fontFamily={fontFamily}
      >
        d
      </text>

      {/* "I" - same font, smaller size */}
      <text
        x={s.d * 0.58}
        y={s.d * 0.78}
        fill={color}
        fillOpacity={0.85}
        fontSize={s.iq}
        fontWeight="400"
        fontFamily={fontFamily}
      >
        I
      </text>

      {/* "Q" - same font, smaller size */}
      <text
        x={s.d * 0.58 + s.iq * 0.55}
        y={s.d * 0.78}
        fill={color}
        fillOpacity={0.85}
        fontSize={s.iq}
        fontWeight="400"
        fontFamily={fontFamily}
      >
        Q
      </text>

      {/* Dot - Ember colored */}
      <circle
        cx={s.d * 1.48}
        cy={s.d * 0.78 - s.dotOffset}
        r={s.dot / 2}
        fill="#f97316"
        style={{
          filter: glowing ? "drop-shadow(0 0 6px rgba(249, 115, 22, 0.9))" : "drop-shadow(0 0 4px rgba(249, 115, 22, 0.6))",
        }}
      />
    </svg>
  );
};

// Compact mark version
export function IQMark({ className = "" }: { className?: string }) {
  const s = { d: 14, iq: 8, dot: 4, dotOffset: 1 };

  return (
    <div
      className={`h-6 px-1.5 rounded-lg bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-copper)] flex items-center justify-center ${className}`}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: "0 2px 10px rgba(249, 115, 22, 0.25)",
      }}
    >
      <LogoText s={s} color="#ffffff" ref={null} />
    </div>
  );
}
