"use client";

import { motion } from "framer-motion";
import { FC, useEffect, useState, useCallback, useRef } from "react";
import { playGlitchSound, initAudio } from "@/lib/sounds";

interface WordmarkGlitchProps {
  className?: string;
  enableSound?: boolean;
}

// Glitch characters for scrambling effect
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Original text parts
const ORIGINAL_TEXT = {
  digital: "digital",
  workplace: "workplace",
  ai: ".ai",
};

// Function to scramble text with random glitch characters
const scrambleText = (text: string, intensity: number = 1): string => {
  return text
    .split("")
    .map((char) => {
      // Higher intensity = more characters get scrambled
      if (Math.random() < 0.3 + intensity * 0.2) {
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
      return char;
    })
    .join("");
};

const WordmarkGlitch: FC<WordmarkGlitchProps> = ({ className = "", enableSound = true }) => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Scrambled text states
  const [digitalText, setDigitalText] = useState(ORIGINAL_TEXT.digital);
  const [workplaceText, setWorkplaceText] = useState(ORIGINAL_TEXT.workplace);
  const [aiText, setAiText] = useState(ORIGINAL_TEXT.ai);

  // Ref for scramble interval
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-initialize audio on mount
  useEffect(() => {
    if (enableSound && !audioInitialized) {
      // Try to initialize audio immediately
      initAudio();
      setAudioInitialized(true);
    }
  }, [enableSound, audioInitialized]);

  // Function to start text scrambling
  const startScrambling = useCallback((intensity: number, duration: number) => {
    // Clear any existing interval
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
    }

    // Rapidly scramble text every 30ms for that CRT glitch feel
    scrambleIntervalRef.current = setInterval(() => {
      setDigitalText(scrambleText(ORIGINAL_TEXT.digital, intensity));
      setWorkplaceText(scrambleText(ORIGINAL_TEXT.workplace, intensity));
      setAiText(scrambleText(ORIGINAL_TEXT.ai, intensity));
    }, 30);

    // Stop scrambling and reset to original after duration
    setTimeout(() => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
        scrambleIntervalRef.current = null;
      }
      setDigitalText(ORIGINAL_TEXT.digital);
      setWorkplaceText(ORIGINAL_TEXT.workplace);
      setAiText(ORIGINAL_TEXT.ai);
    }, duration);
  }, []);

  // Cleanup scramble interval on unmount
  useEffect(() => {
    return () => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
    };
  }, []);

  // Random glitch effect - more dramatic
  useEffect(() => {
    const triggerGlitch = () => {
      // Random intensity for variety
      const intensity = Math.random() > 0.5 ? 2 : 1;
      setGlitchIntensity(intensity);
      setGlitchActive(true);

      // Play glitch sound
      if (enableSound && audioInitialized) {
        playGlitchSound(intensity);
      }

      // Start text scrambling synchronized with glitch
      startScrambling(intensity, 120);

      // Double-tap glitch for more drama
      setTimeout(() => {
        setGlitchActive(false);
        setTimeout(() => {
          if (Math.random() > 0.5) {
            setGlitchActive(true);
            // Play second glitch sound (quieter)
            if (enableSound && audioInitialized) {
              playGlitchSound(intensity * 0.5);
            }
            // Second scramble burst
            startScrambling(intensity * 0.5, 80);
            setTimeout(() => setGlitchActive(false), 80);
          }
        }, 50);
      }, 120);
    };

    // Initial glitch after load
    const initialTimeout = setTimeout(triggerGlitch, 1500);

    // More frequent glitches
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        triggerGlitch();
      }
    }, 2000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [enableSound, audioInitialized, startScrambling]);

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Glitch layers container */}
      <div className="relative">
        {/* Background glow pulse */}
        <motion.div
          className="absolute inset-0 -m-8 blur-3xl"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "radial-gradient(ellipse at center, rgba(74, 222, 128, 0.2) 0%, transparent 60%)",
          }}
        />

        {/* Main text layer */}
        <div
          className="relative text-3xl sm:text-4xl md:text-5xl font-mono tracking-tight select-none"
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
            transform: glitchActive ? `skewX(${glitchIntensity * -0.5}deg)` : "skewX(0deg)",
            transition: "transform 0.05s ease-out",
          }}
        >
          {/* Chromatic aberration layers (only visible during glitch) - RED */}
          <span
            className="absolute inset-0"
            style={{
              color: "#ff0040",
              opacity: glitchActive ? 0.9 : 0,
              transform: glitchActive ? `translateX(${-3 * glitchIntensity}px) translateY(${glitchIntensity}px)` : "translateX(0)",
              mixBlendMode: "screen",
              transition: "opacity 0.02s, transform 0.02s",
            }}
            aria-hidden="true"
          >
            <span style={{ opacity: 0.75 }}>{digitalText}</span>
            <span style={{ opacity: 1 }}>{workplaceText}</span>
            <span style={{ color: "#4ade80" }}>{aiText}</span>
          </span>

          {/* Chromatic aberration - CYAN */}
          <span
            className="absolute inset-0"
            style={{
              color: "#00ffff",
              opacity: glitchActive ? 0.9 : 0,
              transform: glitchActive ? `translateX(${3 * glitchIntensity}px) translateY(${-glitchIntensity}px)` : "translateX(0)",
              mixBlendMode: "screen",
              transition: "opacity 0.02s, transform 0.02s",
            }}
            aria-hidden="true"
          >
            <span style={{ opacity: 0.75 }}>{digitalText}</span>
            <span style={{ opacity: 1 }}>{workplaceText}</span>
            <span style={{ color: "#4ade80" }}>{aiText}</span>
          </span>

          {/* Glitch slice effect */}
          {glitchActive && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `inset(${30 + glitchIntensity * 10}% 0 ${40 - glitchIntensity * 5}% 0)`,
                transform: `translateX(${glitchIntensity * 4}px)`,
              }}
              aria-hidden="true"
            >
              <span style={{ color: "rgba(255, 255, 255, 0.75)" }}>{digitalText}</span>
              <span style={{ color: "#fff" }}>{workplaceText}</span>
              <span style={{ color: "#4ade80" }}>{aiText}</span>
            </span>
          )}

          {/* Main visible text */}
          <span className="relative inline-flex items-baseline">
            {/* "digital" - more visible with text shadow */}
            <motion.span
              className="font-light"
              style={{
                color: "rgba(255, 255, 255, 0.75)",
                textShadow: "0 0 40px rgba(255, 255, 255, 0.3)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {digitalText}
            </motion.span>

            {/* "workplace" - solid white, prominent */}
            <motion.span
              className="font-medium"
              style={{
                color: "#ffffff",
                textShadow: "0 0 40px rgba(255, 255, 255, 0.4)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {workplaceText}
            </motion.span>

            {/* ".ai" - accent with stronger glow */}
            <motion.span
              className="font-semibold relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <span
                className="absolute inset-0 blur-lg"
                style={{ color: "#4ade80", opacity: 0.8 }}
                aria-hidden="true"
              >
                {aiText}
              </span>
              <span
                style={{
                  color: "#4ade80",
                  textShadow: "0 0 20px rgba(74, 222, 128, 0.8), 0 0 40px rgba(74, 222, 128, 0.5), 0 0 60px rgba(74, 222, 128, 0.3)",
                }}
              >
                {aiText}
              </span>
            </motion.span>

            {/* Blinking cursor */}
            <motion.span
              className="ml-1 inline-block w-[3px] h-[1em] bg-green-400"
              style={{ marginBottom: "0.1em" }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                times: [0, 0.5, 1],
                delay: 1,
              }}
            />
          </span>
        </div>

        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ opacity: 0.03 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)",
            }}
            animate={{ y: [0, 4] }}
            transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Corner brackets - tech frame */}
        <div className="absolute -inset-4 pointer-events-none">
          {/* Top left */}
          <motion.svg
            className="absolute top-0 left-0 w-4 h-4"
            viewBox="0 0 16 16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1 }}
          >
            <path d="M0 16V0h16" fill="none" stroke="#4ade80" strokeWidth="1" />
          </motion.svg>

          {/* Top right */}
          <motion.svg
            className="absolute top-0 right-0 w-4 h-4"
            viewBox="0 0 16 16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.1 }}
          >
            <path d="M16 16V0H0" fill="none" stroke="#4ade80" strokeWidth="1" />
          </motion.svg>

          {/* Bottom left */}
          <motion.svg
            className="absolute bottom-0 left-0 w-4 h-4"
            viewBox="0 0 16 16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.2 }}
          >
            <path d="M0 0v16h16" fill="none" stroke="#4ade80" strokeWidth="1" />
          </motion.svg>

          {/* Bottom right */}
          <motion.svg
            className="absolute bottom-0 right-0 w-4 h-4"
            viewBox="0 0 16 16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.3 }}
          >
            <path d="M16 0v16H0" fill="none" stroke="#4ade80" strokeWidth="1" />
          </motion.svg>
        </div>
      </div>

    </motion.div>
  );
};

export default WordmarkGlitch;
