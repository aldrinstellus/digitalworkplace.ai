"use client";

import { FC, useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { enableAudio as enableGlobalAudio, disableAudio as disableGlobalAudio } from "@/lib/sounds";
import {
  startBackgroundMusic,
  stopBackgroundMusic,
  setMusicVolume,
  isMusicPlaying,
} from "@/lib/backgroundMusic";

interface BackgroundMusicProps {
  volume?: number;
}

const BackgroundMusic: FC<BackgroundMusicProps> = ({
  volume = 0.3,
}) => {
  const hasStartedRef = useRef(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isWaitingForInteraction, setIsWaitingForInteraction] = useState(true);

  // Start the music
  const startMusic = useCallback(async () => {
    if (hasStartedRef.current && isMusicPlaying()) {
      return true;
    }

    enableGlobalAudio();

    try {
      const started = await startBackgroundMusic(volume);
      if (started) {
        hasStartedRef.current = true;
        setIsWaitingForInteraction(false);
        return true;
      }
    } catch (e) {
      console.error("Failed to start music:", e);
    }
    return false;
  }, [volume]);

  // Stop the music
  const stopMusic = useCallback(() => {
    stopBackgroundMusic();
    hasStartedRef.current = false;
  }, []);

  // Update volume when prop changes
  useEffect(() => {
    if (isAudioEnabled && isMusicPlaying()) {
      setMusicVolume(volume);
    }
  }, [volume, isAudioEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  // Auto-start on ANY interaction - browser requirement
  useEffect(() => {
    if (!isAudioEnabled) return;

    // Try to start immediately (works if user previously interacted)
    startMusic();

    // Set up global listener for first interaction
    const handleFirstInteraction = async () => {
      if (!hasStartedRef.current && isAudioEnabled) {
        await startMusic();
      }
    };

    // Capture phase ensures we catch it before anything else
    document.addEventListener("click", handleFirstInteraction, { capture: true });
    document.addEventListener("touchstart", handleFirstInteraction, { capture: true });
    document.addEventListener("keydown", handleFirstInteraction, { capture: true });
    document.addEventListener("mousedown", handleFirstInteraction, { capture: true });

    return () => {
      document.removeEventListener("click", handleFirstInteraction, { capture: true });
      document.removeEventListener("touchstart", handleFirstInteraction, { capture: true });
      document.removeEventListener("keydown", handleFirstInteraction, { capture: true });
      document.removeEventListener("mousedown", handleFirstInteraction, { capture: true });
    };
  }, [isAudioEnabled, startMusic]);

  // Toggle audio on/off
  const toggleAudio = async () => {
    if (isAudioEnabled) {
      disableGlobalAudio();
      stopMusic();
      setIsAudioEnabled(false);
      setIsWaitingForInteraction(false);
    } else {
      setIsAudioEnabled(true);
      await startMusic();
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={toggleAudio}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-sm group ${
        isAudioEnabled
          ? "bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50"
          : "bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 hover:border-green-500/60"
      }`}
    >
      {isAudioEnabled ? (
        <>
          {/* Music ON - show animated equalizer bars or waiting indicator */}
          {isWaitingForInteraction ? (
            // Pulsing indicator showing audio will start on click
            <motion.div
              className="flex items-center gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-yellow-400 text-xs">Click to start</span>
            </motion.div>
          ) : (
            // Animated equalizer bars when playing
            <div className="flex items-end gap-0.5 h-4">
              <motion.div
                className="w-1 bg-red-400 rounded-full"
                animate={{ height: ["8px", "16px", "8px"] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="w-1 bg-red-400 rounded-full"
                animate={{ height: ["16px", "8px", "16px"] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              />
              <motion.div
                className="w-1 bg-red-400 rounded-full"
                animate={{ height: ["10px", "14px", "10px"] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
            </div>
          )}
          <span className="text-red-400 text-sm font-medium">
            {isWaitingForInteraction ? "" : "Disable Audio"}
          </span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-green-400"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span className="text-green-400 text-sm font-medium">Enable Audio</span>
        </>
      )}
    </motion.button>
  );
};

export default BackgroundMusic;
