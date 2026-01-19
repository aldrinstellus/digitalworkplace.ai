"use client";

import { FC, useEffect, useRef, useState } from "react";

interface BackgroundMusicProps {
  src: string;
  volume?: number; // 0 to 1, default 0.1 (10%)
  fadeInDuration?: number; // milliseconds
  autoPlay?: boolean;
}

const BackgroundMusic: FC<BackgroundMusicProps> = ({
  src,
  volume = 0.1,
  fadeInDuration = 3000,
  autoPlay = true,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0; // Start at 0 for fade-in
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  // Handle autoplay with user interaction fallback
  useEffect(() => {
    if (!autoPlay || !audioRef.current) return;

    const audio = audioRef.current;

    const attemptPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setHasInteracted(true);
        fadeIn();
      } catch {
        // Autoplay blocked, wait for user interaction
        console.log("Autoplay blocked, waiting for interaction...");
      }
    };

    const handleInteraction = async () => {
      if (!hasInteracted && audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setHasInteracted(true);
          fadeIn();
        } catch (e) {
          console.error("Failed to play audio:", e);
        }
      }
    };

    // Try to autoplay
    attemptPlay();

    // Fallback: play on any user interaction
    const events = ["click", "touchstart", "keydown", "scroll", "mousemove"];
    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, [autoPlay, hasInteracted]);

  // Fade in effect
  const fadeIn = () => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const steps = 50;
    const stepDuration = fadeInDuration / steps;
    const volumeStep = volume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        audio.volume = volume;
        clearInterval(fadeInterval);
      } else {
        audio.volume = Math.min(volumeStep * currentStep, volume);
      }
    }, stepDuration);
  };

  // Toggle mute
  const toggleMute = () => {
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
      aria-label={isMuted ? "Unmute background music" : "Mute background music"}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        // Muted icon
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
        // Playing icon with animated waves
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
          <path
            d="M15.54 8.46a5 5 0 0 1 0 7.07"
            className="animate-pulse"
          />
          <path
            d="M19.07 4.93a10 10 0 0 1 0 14.14"
            className="animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
        </svg>
      )}
    </button>
  );
};

export default BackgroundMusic;
