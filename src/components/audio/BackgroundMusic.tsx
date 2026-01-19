"use client";

import { FC, useEffect, useRef, useState, useCallback } from "react";

interface BackgroundMusicProps {
  src: string;
  volume?: number;
  fadeInDuration?: number;
}

const BackgroundMusic: FC<BackgroundMusicProps> = ({
  src,
  volume = 0.12,
  fadeInDuration = 3000,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Fade in effect
  const fadeIn = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const steps = 50;
    const stepDuration = fadeInDuration / steps;
    const volumeStep = volume / steps;
    let currentStep = 0;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        audio.volume = volume;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      } else {
        audio.volume = Math.min(volumeStep * currentStep, volume);
      }
    }, stepDuration);
  }, [fadeInDuration, volume]);

  // Start playing audio
  const startAudio = useCallback(async () => {
    if (hasStartedRef.current || !audioRef.current) return;

    try {
      audioRef.current.volume = 0;
      await audioRef.current.play();
      hasStartedRef.current = true;
      setIsReady(true);
      fadeIn();
    } catch {
      // Will retry on next interaction
    }
  }, [fadeIn]);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audioRef.current = audio;

    // Try to play immediately (will fail on most browsers)
    startAudio();

    // Set up interaction listeners - ANY interaction should start audio
    const handleInteraction = () => {
      startAudio();
    };

    // Listen for literally ANY user interaction
    const events = [
      "click",
      "touchstart",
      "touchend",
      "keydown",
      "keyup",
      "scroll",
      "mousemove",
      "mousedown",
      "mouseup",
      "wheel",
      "pointerdown",
      "pointermove",
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleInteraction, { passive: true, capture: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleInteraction, { capture: true });
      });
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      audio.pause();
      audio.src = "";
    };
  }, [src, startAudio]);

  // Toggle mute - also starts audio if not started
  const toggleMute = async () => {
    if (!hasStartedRef.current) {
      await startAudio();
    }

    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm group"
      aria-label={isMuted ? "Unmute" : "Mute"}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted || !isReady ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/40 group-hover:text-white/60 transition-colors"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-400/70 group-hover:text-green-400 transition-colors"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className="animate-pulse" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
        </svg>
      )}
    </button>
  );
};

export default BackgroundMusic;
