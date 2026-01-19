"use client";

import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  enableAudio,
  disableAudio,
  isAudioEnabled,
  initAudio,
} from "@/lib/sounds";

const SoundToggle: FC = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Sync with global audio state on mount
  useEffect(() => {
    const enabled = isAudioEnabled();
    setIsSoundEnabled(enabled);
    if (enabled) {
      initAudio();
    }
  }, []);

  // Handle click - first click activates audio, subsequent clicks toggle
  const handleClick = () => {
    if (!hasInteracted) {
      // First click - activate audio
      setHasInteracted(true);
      enableAudio();
      setIsSoundEnabled(true);
    } else {
      // Subsequent clicks - toggle
      if (isSoundEnabled) {
        disableAudio();
        setIsSoundEnabled(false);
      } else {
        enableAudio();
        setIsSoundEnabled(true);
      }
    }
  };

  // Before first interaction - show "Enable Sound" with pulsing effect
  if (!hasInteracted) {
    return (
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleClick}
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-300 backdrop-blur-sm bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 hover:border-green-500/60"
      >
        {/* Pulsing speaker icon */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-400"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        </motion.div>
        <span className="hidden sm:inline text-green-400 text-sm font-medium">Enable</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className={`fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-300 backdrop-blur-sm group ${
        isSoundEnabled
          ? "bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 hover:border-green-500/50"
          : "bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30"
      }`}
    >
      {isSoundEnabled ? (
        <>
          {/* Sound ON - animated sound waves */}
          <div className="flex items-center gap-0.5">
            <motion.div
              className="w-1 bg-green-400 rounded-full"
              animate={{ height: ["6px", "12px", "6px"] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="w-1 bg-green-400 rounded-full"
              animate={{ height: ["10px", "6px", "10px"] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            />
            <motion.div
              className="w-1 bg-green-400 rounded-full"
              animate={{ height: ["8px", "14px", "8px"] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
          </div>
          <span className="hidden sm:inline text-green-400 text-sm font-medium">On</span>
        </>
      ) : (
        <>
          {/* Sound OFF - muted icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/70"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
          <span className="hidden sm:inline text-white/70 text-sm font-medium">Off</span>
        </>
      )}
    </motion.button>
  );
};

export default SoundToggle;
