"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

interface TQLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function TQLogo({ size = "md", showText = false, className = "" }: TQLogoProps) {
  const [glitch, setGlitch] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGSVGElement>(null);

  const triggerGlitch = () => {
    setGlitch(true);

    if (textRef.current) {
      const tl = gsap.timeline();

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

  useEffect(() => {
    setTimeout(() => {
      triggerGlitch();
    }, 500);

    // Reduced from 4s to 8s for better performance
    const interval = setInterval(() => {
      triggerGlitch();
    }, 8000);

    let pulseAnimation: gsap.core.Tween | null = null;
    if (logoRef.current) {
      pulseAnimation = gsap.to(logoRef.current, {
        boxShadow: "0 4px 30px rgba(255, 51, 102, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
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

  const sizes = {
    sm: { container: "h-7 px-1.5", d: 16, tq: 9, dot: 4, dotOffset: 1 },
    md: { container: "h-8 px-2", d: 20, tq: 11, dot: 5, dotOffset: 1 },
    lg: { container: "h-10 px-2.5", d: 26, tq: 14, dot: 6, dotOffset: 2 },
    xl: { container: "h-12 px-3", d: 32, tq: 17, dot: 7, dotOffset: 2 },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo container - Pink gradient */}
      <div
        ref={logoRef}
        className={`${s.container} rounded-xl bg-gradient-to-br from-[#ff3366] via-[#ff1a53] to-[#ff3366] flex items-center justify-center relative overflow-hidden cursor-pointer`}
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          boxShadow: "0 4px 20px rgba(255, 51, 102, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
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
              <LogoText s={s} color="#ffb3c6" ref={null} />
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center opacity-60"
              style={{ transform: "translate(1.5px, 0)" }}
            >
              <LogoText s={s} color="#ff6699" ref={null} />
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
            <span className="font-light text-[var(--text-muted)]">AI</span>
            {" "}
            <span className="text-[#ff3366]">Testing</span>
          </span>
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

interface LogoTextProps {
  s: { d: number; tq: number; dot: number; dotOffset: number };
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
      viewBox={`0 0 ${s.d * 1.9} ${s.d}`}
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

      {/* "T" - same font, smaller size */}
      <text
        x={s.d * 0.58}
        y={s.d * 0.78}
        fill={color}
        fillOpacity={0.85}
        fontSize={s.tq}
        fontWeight="400"
        fontFamily={fontFamily}
      >
        T
      </text>

      {/* "Q" - same font, smaller size */}
      <text
        x={s.d * 0.58 + s.tq * 0.65}
        y={s.d * 0.78}
        fill={color}
        fillOpacity={0.85}
        fontSize={s.tq}
        fontWeight="400"
        fontFamily={fontFamily}
      >
        Q
      </text>

      {/* Dot - White for contrast on pink background */}
      <circle
        cx={s.d * 1.58}
        cy={s.d * 0.78 - s.dotOffset}
        r={s.dot / 2}
        fill="#ffffff"
        style={{
          filter: glowing ? "drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))" : "drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))",
        }}
      />
    </svg>
  );
};

// Compact mark version
export function TQMark({ className = "" }: { className?: string }) {
  const s = { d: 14, tq: 8, dot: 4, dotOffset: 1 };

  return (
    <div
      className={`h-6 px-1.5 rounded-lg bg-gradient-to-br from-[#ff3366] to-[#ff1a53] flex items-center justify-center ${className}`}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: "0 2px 10px rgba(255, 51, 102, 0.25)",
      }}
    >
      <LogoText s={s} color="#ffffff" ref={null} />
    </div>
  );
}
