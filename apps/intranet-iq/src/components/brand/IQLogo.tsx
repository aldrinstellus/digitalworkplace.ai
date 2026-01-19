"use client";

import { useState, useEffect } from "react";

interface IQLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function IQLogo({ size = "md", showText = false, className = "" }: IQLogoProps) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);

    setTimeout(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Unified sizing system
  const sizes = {
    sm: { container: "h-7 px-1.5", d: 16, iq: 9, dot: 4, dotOffset: 1 },
    md: { container: "h-8 px-2", d: 20, iq: 11, dot: 5, dotOffset: 1 },
    lg: { container: "h-10 px-2.5", d: 26, iq: 14, dot: 6, dotOffset: 2 },
    xl: { container: "h-12 px-3", d: 32, iq: 17, dot: 7, dotOffset: 2 },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo container */}
      <div
        className={`${s.container} rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center relative overflow-hidden`}
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Glitch layers */}
        {glitch && (
          <>
            <span
              className="absolute inset-0 flex items-center justify-center opacity-60"
              style={{ transform: "translate(-1.5px, 0)" }}
            >
              <LogoText s={s} color="#22d3ee" />
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center opacity-60"
              style={{ transform: "translate(1.5px, 0)" }}
            >
              <LogoText s={s} color="#f87171" />
            </span>
          </>
        )}

        {/* Main logo */}
        <span className="relative z-10">
          <LogoText s={s} color="#ffffff" glowing={glitch} />
        </span>
      </div>

      {/* Optional text label */}
      {showText && (
        <div className="flex flex-col">
          <span
            className="text-white font-medium leading-tight tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="font-light text-white/60">digital</span>
            {" "}
            <span className="text-blue-400">intranet</span>
          </span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest">Knowledge Network</span>
        </div>
      )}
    </div>
  );
}

// Unified logo text component for seamless rendering
function LogoText({
  s,
  color,
  glowing = false
}: {
  s: { d: number; iq: number; dot: number; dotOffset: number };
  color: string;
  glowing?: boolean;
}) {
  const fontFamily = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace";

  return (
    <svg
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

      {/* Dot - sits on the baseline */}
      <circle
        cx={s.d * 1.48}
        cy={s.d * 0.78 - s.dotOffset}
        r={s.dot / 2}
        fill="#60a5fa"
        style={{
          filter: glowing ? "drop-shadow(0 0 4px rgba(96, 165, 250, 0.8))" : "drop-shadow(0 0 3px rgba(96, 165, 250, 0.5))",
        }}
      />
    </svg>
  );
}

// Compact mark version
export function IQMark({ className = "" }: { className?: string }) {
  const s = { d: 14, iq: 8, dot: 4, dotOffset: 1 };

  return (
    <div
      className={`h-6 px-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${className}`}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: "0 2px 10px rgba(59, 130, 246, 0.25)",
      }}
    >
      <LogoText s={s} color="#ffffff" />
    </div>
  );
}
