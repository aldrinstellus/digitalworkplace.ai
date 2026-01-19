"use client";

import { motion } from "framer-motion";
import { FC } from "react";

interface WordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const Wordmark: FC<WordmarkProps> = ({
  className = "",
  size = "md",
  animated = true
}) => {
  const sizeClasses = {
    sm: "text-lg sm:text-xl",
    md: "text-2xl sm:text-3xl md:text-4xl",
    lg: "text-4xl sm:text-5xl md:text-6xl",
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  const glowVariants = {
    initial: { opacity: 0.4 },
    animate: {
      opacity: [0.4, 0.7, 0.4],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const Wrapper = animated ? motion.div : "div";
  const Letter = animated ? motion.span : "span";

  return (
    <Wrapper
      className={`relative inline-flex flex-col items-center ${className}`}
      initial={animated ? { opacity: 0 } : undefined}
      animate={animated ? { opacity: 1 } : undefined}
      transition={{ duration: 0.8 }}
    >
      {/* Main wordmark container */}
      <div className="relative">
        {/* Glow layer */}
        {animated && (
          <motion.div
            className="absolute inset-0 blur-2xl"
            variants={glowVariants}
            initial="initial"
            animate="animate"
            style={{
              background: "radial-gradient(ellipse at center, rgba(74, 222, 128, 0.15) 0%, transparent 70%)",
            }}
          />
        )}

        {/* Primary text */}
        <div className={`relative ${sizeClasses[size]} font-light tracking-tight`}>
          {/* "digital" part */}
          <span className="inline-flex">
            {["d", "i", "g", "i", "t", "a", "l"].map((letter, i) => (
              <Letter
                key={`d-${i}`}
                custom={i}
                variants={animated ? letterVariants : undefined}
                initial={animated ? "hidden" : undefined}
                animate={animated ? "visible" : undefined}
                className="inline-block"
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
                  fontWeight: 300,
                  letterSpacing: letter === "l" ? "0.02em" : "-0.02em",
                }}
              >
                {letter}
              </Letter>
            ))}
          </span>

          {/* "workplace" part - slightly bolder */}
          <span className="inline-flex">
            {["w", "o", "r", "k", "p", "l", "a", "c", "e"].map((letter, i) => (
              <Letter
                key={`w-${i}`}
                custom={i + 7}
                variants={animated ? letterVariants : undefined}
                initial={animated ? "hidden" : undefined}
                animate={animated ? "visible" : undefined}
                className="inline-block"
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                {letter}
              </Letter>
            ))}
          </span>

          {/* ".ai" part - accent color with glow */}
          <span className="inline-flex items-center">
            <Letter
              custom={16}
              variants={animated ? letterVariants : undefined}
              initial={animated ? "hidden" : undefined}
              animate={animated ? "visible" : undefined}
              className="inline-block relative"
              style={{
                color: "#4ade80",
                fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
                fontWeight: 500,
                textShadow: "0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3)",
              }}
            >
              .
            </Letter>
            {["a", "i"].map((letter, i) => (
              <Letter
                key={`ai-${i}`}
                custom={i + 17}
                variants={animated ? letterVariants : undefined}
                initial={animated ? "hidden" : undefined}
                animate={animated ? "visible" : undefined}
                className="inline-block"
                style={{
                  color: "#4ade80",
                  fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
                  fontWeight: 500,
                  textShadow: "0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3)",
                }}
              >
                {letter}
              </Letter>
            ))}
          </span>
        </div>

        {/* Accent line beneath */}
        {animated && (
          <motion.div
            className="absolute -bottom-2 left-0 right-0 h-px"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(74, 222, 128, 0.3) 30%, rgba(74, 222, 128, 0.5) 50%, rgba(74, 222, 128, 0.3) 70%, transparent 100%)",
              transformOrigin: "center",
            }}
          />
        )}
      </div>

      {/* Decorative elements */}
      {animated && (
        <>
          {/* Left bracket */}
          <motion.span
            className="absolute -left-6 top-1/2 -translate-y-1/2 text-white/10 font-light"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: size === "lg" ? "2rem" : size === "md" ? "1.5rem" : "1rem",
            }}
          >
            {"<"}
          </motion.span>

          {/* Right bracket with slash */}
          <motion.span
            className="absolute -right-8 top-1/2 -translate-y-1/2 text-white/10 font-light"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: size === "lg" ? "2rem" : size === "md" ? "1.5rem" : "1rem",
            }}
          >
            {"/>"}
          </motion.span>
        </>
      )}
    </Wrapper>
  );
};

export default Wordmark;
