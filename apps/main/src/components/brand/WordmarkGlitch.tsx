"use client";

import { motion } from "framer-motion";
import { FC, useEffect, useState, useCallback, useRef } from "react";
import { playGlitchSound, initAudio } from "@/lib/sounds";

interface WordmarkGlitchProps {
  className?: string;
  enableSound?: boolean;
}

// Glitch characters for scrambling effect - multiple chaotic sets
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const MORPH_CHARS = "░▒▓█▄▀■□▪▫●○◐◑◒◓◔◕◖◗▲▼◄►";
const TECH_CHARS = "⟨⟩⌐¬⌠⌡∞≈≠≤≥«»÷×±∓∴∵∷∸⊕⊗⊘⊙";
const CYBER_CHARS = "ĐđĦħıĲĳĸĿŀŁłŃńŅņŇňŉŊŋŌōŎŏ";
const MATRIX_CHARS = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
const CHAOS_CHARS = "∆Ωψξζλμ№฿₿₴₸ℵℶℷℸ⅀⅁⅂⅃⅄";

// Original text parts
const ORIGINAL_TEXT = {
  digital: "digital",
  workplace: "workplace",
  ai: ".ai",
};

// ULTRA CHAOTIC scramble - maximum drama, each letter morphs wildly
const scrambleText = (text: string, intensity: number = 1, morphStyle: number = 0, chaos: number = 1): string => {
  const charSets = [GLITCH_CHARS, MORPH_CHARS, TECH_CHARS, CYBER_CHARS, MATRIX_CHARS, CHAOS_CHARS];

  return text
    .split("")
    .map((char, index) => {
      // DRAMATIC randomness per letter - 70% more aggressive
      const letterChance = Math.random();
      // Much higher threshold for more scrambling
      const threshold = (0.35 + (intensity * 0.55) + (Math.sin(index * 2.3 + Date.now() * 0.001) * 0.25)) * chaos * 1.7;

      if (letterChance < threshold) {
        // Pick random character set for each letter - total chaos
        const randomSet = charSets[Math.floor(Math.random() * charSets.length)];
        return randomSet[Math.floor(Math.random() * randomSet.length)];
      }
      return char;
    })
    .join("");
};

const WordmarkGlitch: FC<WordmarkGlitchProps> = ({ className = "", enableSound = true }) => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  // Scrambled text states
  const [digitalText, setDigitalText] = useState(ORIGINAL_TEXT.digital);
  const [workplaceText, setWorkplaceText] = useState(ORIGINAL_TEXT.workplace);
  const [aiText, setAiText] = useState(ORIGINAL_TEXT.ai);

  // Ref for scramble interval
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioInitializedRef = useRef(false);

  // Auto-initialize audio on mount
  useEffect(() => {
    if (enableSound && !audioInitializedRef.current) {
      // Try to initialize audio immediately
      initAudio();
      audioInitializedRef.current = true;
    }
  }, [enableSound]);

  // SLOWER DRAMATIC scrambling - intense morphing with slower timing
  const startScrambling = useCallback((intensity: number, duration: number) => {
    // Clear any existing interval
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
    }

    let frameCount = 0;
    let chaosLevel = 1.4 + Math.random() * 0.8; // Higher base chaos

    // SLOWER scramble timing (50-80ms) - more visible morphing
    const baseInterval = 50 + Math.random() * 30;
    scrambleIntervalRef.current = setInterval(() => {
      frameCount++;

      // SLOWER intensity waves - smoother transitions
      const wave1 = Math.sin(frameCount * 0.2) * 0.6;
      const wave2 = Math.cos(frameCount * 0.35) * 0.5;
      const wave3 = Math.sin(frameCount * 0.5) * 0.4;
      const chaosWave = intensity * (0.7 + wave1 + wave2 + wave3) * chaosLevel * 1.7;

      // Chaos spikes
      const spike = Math.random() > 0.7 ? 2.0 : 1.2;

      // Each word morphs DRAMATICALLY at different rates
      setDigitalText(scrambleText(ORIGINAL_TEXT.digital, chaosWave * spike, 0, chaosLevel * 1.5));
      setWorkplaceText(scrambleText(ORIGINAL_TEXT.workplace, chaosWave * 1.5 * spike, 0, chaosLevel * 1.8));
      setAiText(scrambleText(ORIGINAL_TEXT.ai, chaosWave * 1.2, 0, chaosLevel * 1.3));

      // Chaos spikes mid-animation
      if (Math.random() > 0.88) {
        chaosLevel = 1.3 + Math.random() * 1.2;
      }
    }, baseInterval);

    // SLOWER settling phase for dramatic reveal
    const settleStart = duration * 0.5;
    setTimeout(() => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
        let settleFrame = 0;
        const settleInterval = 60 + Math.random() * 40; // SLOWER settle

        scrambleIntervalRef.current = setInterval(() => {
          settleFrame++;
          // Stuttering fade
          const stutter = Math.random() > 0.5 ? 0.5 : 0;
          const fadeIntensity = intensity * Math.max(0, 1.2 - settleFrame * 0.08 + stutter); // SLOWER fade

          if (fadeIntensity <= 0.08) {
            if (scrambleIntervalRef.current) {
              clearInterval(scrambleIntervalRef.current);
              scrambleIntervalRef.current = null;
            }
            setDigitalText(ORIGINAL_TEXT.digital);
            setWorkplaceText(ORIGINAL_TEXT.workplace);
            setAiText(ORIGINAL_TEXT.ai);
          } else {
            // DRAMATIC during settle
            setDigitalText(scrambleText(ORIGINAL_TEXT.digital, fadeIntensity * 1.3, 0, 1.2));
            setWorkplaceText(scrambleText(ORIGINAL_TEXT.workplace, fadeIntensity * 1.5, 0, 1.4));
            setAiText(scrambleText(ORIGINAL_TEXT.ai, fadeIntensity, 0, 1.0));
          }
        }, settleInterval);
      }
    }, settleStart);

    // Final cleanup
    setTimeout(() => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
        scrambleIntervalRef.current = null;
      }
      setDigitalText(ORIGINAL_TEXT.digital);
      setWorkplaceText(ORIGINAL_TEXT.workplace);
      setAiText(ORIGINAL_TEXT.ai);
    }, duration + 300 + Math.random() * 200);
  }, []);

  // Cleanup scramble interval on unmount
  useEffect(() => {
    return () => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
    };
  }, []);

  // SLOWER DRAMATIC glitch effect - intense but with slower, more visible morphing
  useEffect(() => {
    const triggerGlitch = () => {
      // DRAMATIC intensity
      const intensityRoll = Math.random();
      const intensity = intensityRoll > 0.85 ? 3.0 : intensityRoll > 0.5 ? 2.2 : intensityRoll > 0.2 ? 1.6 : 1.0;
      setGlitchIntensity(intensity);
      setGlitchActive(true);

      // Play glitch sound
      if (enableSound && audioInitializedRef.current) {
        playGlitchSound(intensity);
      }

      // MUCH LONGER duration (600-1200ms) - slower, more visible morphing
      const duration = 600 + Math.random() * 600;
      startScrambling(intensity, duration);

      // Slower visual glitch timing
      setTimeout(() => {
        setGlitchActive(false);

        // Echo bursts with SLOWER timing
        const echoBursts = Math.floor(Math.random() * 3) + 1;
        let echoDelay = 150 + Math.random() * 200;

        for (let i = 0; i < echoBursts; i++) {
          setTimeout(() => {
            setGlitchActive(true);
            const echoIntensity = intensity * (0.4 + Math.random() * 0.6);
            if (enableSound && audioInitializedRef.current) {
              playGlitchSound(echoIntensity * 0.6);
            }
            startScrambling(echoIntensity, 200 + Math.random() * 200); // SLOWER echo
            setTimeout(() => setGlitchActive(false), 200 + Math.random() * 150);
          }, echoDelay);
          echoDelay += 200 + Math.random() * 250; // SLOWER between echoes
        }
      }, duration);
    };

    // Initial delay - show stable text first before any animation
    const initialTimeout = setTimeout(triggerGlitch, 3000);

    // 75% stable text, then morph, then gap
    // Total cycle ~12 seconds: 9s stable (75%) + 1.5s morph + 1.5s gap
    const scheduleNextGlitch = () => {
      // 9 seconds of stable "digitalworkplace.ai" display (75% of cycle)
      const stableDisplayTime = 9000;

      return setTimeout(() => {
        triggerGlitch();
        intervalRef.current = scheduleNextGlitch();
      }, stableDisplayTime);
    };

    const intervalRef = { current: scheduleNextGlitch() };

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(intervalRef.current);
    };
  }, [enableSound, startScrambling]);

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
            transform: glitchActive ? `skewX(${glitchIntensity * -0.3}deg)` : "skewX(0deg)",
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Chromatic aberration layers (only visible during glitch) - RED */}
          <span
            className="absolute inset-0"
            style={{
              color: "#ff0040",
              opacity: glitchActive ? 0.6 : 0,
              transform: glitchActive ? `translateX(${-2 * glitchIntensity}px) translateY(${glitchIntensity * 0.5}px)` : "translateX(0)",
              mixBlendMode: "screen",
              transition: "opacity 0.08s ease-out, transform 0.08s ease-out",
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
              opacity: glitchActive ? 0.6 : 0,
              transform: glitchActive ? `translateX(${2 * glitchIntensity}px) translateY(${-glitchIntensity * 0.5}px)` : "translateX(0)",
              mixBlendMode: "screen",
              transition: "opacity 0.08s ease-out, transform 0.08s ease-out",
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
