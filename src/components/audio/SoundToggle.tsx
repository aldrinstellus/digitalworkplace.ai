"use client";

import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  enableAudio,
  disableAudio,
  isAudioEnabled,
} from "@/lib/sounds";

const SoundToggle: FC = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Sync with global audio state on mount and initialize audio if enabled
  useEffect(() => {
    const enabled = isAudioEnabled();
    setIsSoundEnabled(enabled);
    if (enabled) {
      enableAudio();
    }
  }, []);

  // Toggle sound on/off
  const toggleSound = () => {
    if (isSoundEnabled) {
      disableAudio();
      setIsSoundEnabled(false);
    } else {
      enableAudio();
      setIsSoundEnabled(true);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={toggleSound}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-sm group ${
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
          <span className="text-green-400 text-sm font-medium">Sound On</span>
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
          <span className="text-white/70 text-sm font-medium">Sound Off</span>
        </>
      )}
    </motion.button>
  );
};

export default SoundToggle;
