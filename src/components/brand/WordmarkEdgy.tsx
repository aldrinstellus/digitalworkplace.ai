"use client";

import { motion } from "framer-motion";
import { FC } from "react";

interface WordmarkEdgyProps {
  className?: string;
  animated?: boolean;
}

const WordmarkEdgy: FC<WordmarkEdgyProps> = ({
  className = "",
  animated = true,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.2,
      },
    },
  };

  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.3 },
      },
    },
  };

  const glowPulse = {
    animate: {
      filter: [
        "drop-shadow(0 0 8px rgba(74, 222, 128, 0.3))",
        "drop-shadow(0 0 20px rgba(74, 222, 128, 0.5))",
        "drop-shadow(0 0 8px rgba(74, 222, 128, 0.3))",
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={containerVariants}
      initial={animated ? "hidden" : "visible"}
      animate="visible"
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 blur-3xl opacity-30"
        animate={{
          background: [
            "radial-gradient(ellipse at 30% 50%, rgba(74, 222, 128, 0.2) 0%, transparent 50%)",
            "radial-gradient(ellipse at 70% 50%, rgba(74, 222, 128, 0.2) 0%, transparent 50%)",
            "radial-gradient(ellipse at 30% 50%, rgba(74, 222, 128, 0.2) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* SVG Wordmark */}
      <svg
        viewBox="0 0 600 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[500px]"
      >
        <defs>
          {/* Gradient for main text */}
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>

          {/* Gradient for .ai */}
          <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong glow for .ai */}
          <filter id="aiGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#4ade80" floodOpacity="0.6" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* "digital" - lighter weight, spaced out */}
        <motion.text
          x="10"
          y="50"
          fill="url(#textGradient)"
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: "38px",
            fontWeight: 300,
            letterSpacing: "0.05em",
          }}
          variants={pathVariants}
        >
          digital
        </motion.text>

        {/* "workplace" - bolder, tighter */}
        <motion.text
          x="215"
          y="50"
          fill="rgba(255,255,255,0.85)"
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: "38px",
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
          variants={pathVariants}
        >
          workplace
        </motion.text>

        {/* ".ai" - accent with glow */}
        <motion.g
          filter="url(#aiGlow)"
          variants={glowPulse}
          animate={animated ? "animate" : undefined}
        >
          <motion.text
            x="490"
            y="50"
            fill="url(#aiGradient)"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "38px",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
            variants={pathVariants}
          >
            .ai
          </motion.text>
        </motion.g>

        {/* Decorative slash before digital */}
        <motion.text
          x="0"
          y="50"
          fill="rgba(74, 222, 128, 0.3)"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "38px",
            fontWeight: 300,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          /
        </motion.text>

        {/* Animated cursor after .ai */}
        <motion.rect
          x="555"
          y="22"
          width="3"
          height="32"
          fill="#4ade80"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            delay: 1.5,
            duration: 1,
            repeat: Infinity,
            ease: "steps(1)",
          }}
        />

        {/* Underline accent */}
        <motion.line
          x1="10"
          y1="62"
          x2="560"
          y2="62"
          stroke="url(#aiGradient)"
          strokeWidth="1"
          strokeOpacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        />

        {/* Data points decoration */}
        {[80, 180, 300, 420].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy="62"
            r="2"
            fill="#4ade80"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
          />
        ))}
      </svg>

      {/* Tagline */}
      <motion.p
        className="text-center mt-4 text-xs tracking-[0.3em] uppercase"
        style={{ color: "rgba(255, 255, 255, 0.25)" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        Connect • Collaborate • Create
      </motion.p>
    </motion.div>
  );
};

export default WordmarkEdgy;
