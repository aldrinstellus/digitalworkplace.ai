"use client";

import { FC, useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import {
  playChatBubbleSound,
  playDataPacketSound,
  playAmbientPulse,
  initAudio
} from "@/lib/sounds";

// 24 unique avatar photos - diverse professional headshots
const uniqueAvatars = [
  { id: 1, src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", name: "Sarah" },
  { id: 2, src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", name: "Marcus" },
  { id: 3, src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", name: "Emily" },
  { id: 4, src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", name: "David" },
  { id: 5, src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", name: "Sophia" },
  { id: 6, src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", name: "James" },
  { id: 7, src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face", name: "Olivia" },
  { id: 8, src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face", name: "Michael" },
  { id: 9, src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", name: "Ava" },
  { id: 10, src: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face", name: "Robert" },
  { id: 11, src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face", name: "Isabella" },
  { id: 12, src: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face", name: "Daniel" },
  { id: 13, src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face", name: "Luna" },
  { id: 14, src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face", name: "Nathan" },
  { id: 15, src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face", name: "Grace" },
  { id: 16, src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face", name: "William" },
  { id: 17, src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face", name: "Chloe" },
  { id: 18, src: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face", name: "Ethan" },
  { id: 19, src: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=150&h=150&fit=crop&crop=face", name: "Maya" },
  { id: 20, src: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face", name: "Lucas" },
  { id: 21, src: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&h=150&fit=crop&crop=face", name: "Zoe" },
  { id: 22, src: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face", name: "Oliver" },
  { id: 23, src: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&h=150&fit=crop&crop=face", name: "Emma" },
  { id: 24, src: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=150&h=150&fit=crop&crop=face", name: "Liam" },
];

// Expanded chat messages for lots of real-time communication
const chatMessages = [
  "Great meeting today!",
  "Love the new design!",
  "Thanks for the help!",
  "See you at standup",
  "Awesome work!",
  "Quick sync later?",
  "Just shipped it! 🚀",
  "Happy Friday!",
  "Nice job on that!",
  "Coffee break?",
  "Let's collaborate!",
  "You're amazing!",
  "PR approved! ✅",
  "On it!",
  "Great idea!",
  "Let's do this!",
  "Working on it now",
  "Almost done!",
  "That's brilliant!",
  "Thanks team! 🙌",
  "Merged!",
  "New feature live!",
  "Bug fixed!",
  "Sprint complete!",
  "Looks good! 👍",
  "Perfect!",
  "Done ✓",
  "Got it!",
  "Sending now...",
  "Just joined!",
  "Be right there",
  "Good morning! ☀️",
  "Nice catch!",
  "Updated!",
  "Sounds good",
  "Let me check",
  "Fixed it!",
  "Great progress!",
  "Ready to review",
  "Thanks! 🙏",
  "Agreed!",
  "Love it!",
  "Well done!",
  "Keep going!",
  "Almost there!",
  "Crushing it! 💪",
  "Team effort!",
  "High five! ✋",
];

// 24 avatar positions spread across the entire screen
const avatarPositions = [
  // Top row
  { top: "5%", left: "5%", rotate: -3, scale: 0.75, zIndex: 3, depth: "back" as const },
  { top: "8%", left: "18%", rotate: 4, scale: 0.9, zIndex: 8, depth: "middle" as const },
  { top: "3%", left: "35%", rotate: -2, scale: 0.7, zIndex: 2, depth: "back" as const },
  { top: "6%", left: "52%", rotate: 5, scale: 0.85, zIndex: 6, depth: "middle" as const },
  { top: "4%", left: "70%", rotate: -4, scale: 0.72, zIndex: 2, depth: "back" as const },
  { top: "7%", left: "88%", rotate: 3, scale: 0.8, zIndex: 5, depth: "middle" as const },

  // Upper middle row
  { top: "22%", left: "8%", rotate: 2, scale: 1.1, zIndex: 12, depth: "front" as const },
  { top: "25%", left: "25%", rotate: -5, scale: 0.78, zIndex: 4, depth: "back" as const },
  { top: "20%", left: "75%", rotate: 4, scale: 0.88, zIndex: 7, depth: "middle" as const },
  { top: "24%", left: "92%", rotate: -3, scale: 1.05, zIndex: 11, depth: "front" as const },

  // Middle row (avoiding center for login card)
  { top: "42%", left: "3%", rotate: -2, scale: 0.95, zIndex: 9, depth: "middle" as const },
  { top: "45%", left: "15%", rotate: 5, scale: 0.7, zIndex: 3, depth: "back" as const },
  { top: "48%", left: "85%", rotate: -4, scale: 0.75, zIndex: 4, depth: "back" as const },
  { top: "44%", left: "95%", rotate: 3, scale: 0.92, zIndex: 8, depth: "middle" as const },

  // Lower middle row
  { top: "62%", left: "6%", rotate: 4, scale: 0.82, zIndex: 5, depth: "middle" as const },
  { top: "65%", left: "22%", rotate: -3, scale: 1.08, zIndex: 13, depth: "front" as const },
  { top: "68%", left: "78%", rotate: 2, scale: 1.0, zIndex: 10, depth: "front" as const },
  { top: "64%", left: "90%", rotate: -5, scale: 0.73, zIndex: 3, depth: "back" as const },

  // Bottom row
  { top: "82%", left: "4%", rotate: -2, scale: 0.76, zIndex: 4, depth: "back" as const },
  { top: "85%", left: "18%", rotate: 5, scale: 0.85, zIndex: 6, depth: "middle" as const },
  { top: "88%", left: "35%", rotate: -4, scale: 0.9, zIndex: 7, depth: "middle" as const },
  { top: "84%", left: "55%", rotate: 3, scale: 0.72, zIndex: 2, depth: "back" as const },
  { top: "86%", left: "72%", rotate: -3, scale: 1.05, zIndex: 11, depth: "front" as const },
  { top: "83%", left: "92%", rotate: 4, scale: 0.78, zIndex: 5, depth: "middle" as const },
];

interface ChatBubble {
  id: number;
  avatarIndex: number;
  message: string;
}

interface LoginBackgroundProps {
  className?: string;
  enableSound?: boolean;
}

const LoginBackground: FC<LoginBackgroundProps> = ({ className = "", enableSound = true }) => {
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationsRef = useRef<gsap.core.Tween[]>([]);
  const [chatBubbles, setChatBubbles] = useState<ChatBubble[]>([]);
  const bubbleIdRef = useRef(0);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize audio on first user interaction
  const handleInteraction = useCallback(() => {
    if (!audioInitialized) {
      initAudio();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  // Add click listener for audio initialization
  useEffect(() => {
    if (enableSound) {
      window.addEventListener("click", handleInteraction, { once: true });
      window.addEventListener("touchstart", handleInteraction, { once: true });
      return () => {
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("touchstart", handleInteraction);
      };
    }
  }, [enableSound, handleInteraction]);

  // Ambient sound pulse
  useEffect(() => {
    if (!enableSound || !audioInitialized) return;

    // Play ambient pulse every 8-12 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        playAmbientPulse();
      }
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [enableSound, audioInitialized]);

  // Data packet sounds
  useEffect(() => {
    if (!enableSound || !audioInitialized) return;

    // Play data packet sound periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        playDataPacketSound();
      }
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [enableSound, audioInitialized]);

  // GSAP floating animation for each avatar with 3D depth
  useEffect(() => {
    avatarRefs.current.forEach((avatarEl, index) => {
      if (!avatarEl) return;

      const position = avatarPositions[index];
      const depthMultiplier = position.depth === "back" ? 0.5 : position.depth === "middle" ? 0.75 : 1;

      // Initial entrance animation with 3D effect
      gsap.fromTo(
        avatarEl,
        {
          scale: 0,
          opacity: 0,
          rotationY: -90,
          rotationX: 20,
        },
        {
          scale: position.scale,
          opacity: position.depth === "back" ? 0.5 : position.depth === "middle" ? 0.75 : 1,
          rotationY: 0,
          rotationX: 0,
          rotation: position.rotate,
          duration: 0.8,
          delay: index * 0.05,
          ease: "back.out(1.4)",
        }
      );

      // Continuous floating animation with depth-based movement
      const floatAnimation = () => {
        const randomX = (Math.random() - 0.5) * 100 * depthMultiplier;
        const randomY = (Math.random() - 0.5) * 80 * depthMultiplier;
        const randomRotation = position.rotate + (Math.random() - 0.5) * 15;
        const randomRotationY = (Math.random() - 0.5) * 20 * depthMultiplier;
        const duration = 3 + Math.random() * 4;

        const tween = gsap.to(avatarEl, {
          x: randomX,
          y: randomY,
          rotation: randomRotation,
          rotationY: randomRotationY,
          duration,
          ease: "sine.inOut",
          onComplete: floatAnimation,
        });
        animationsRef.current.push(tween);
      };

      // Start floating with staggered delay
      setTimeout(floatAnimation, 800 + index * 100);
    });

    return () => {
      animationsRef.current.forEach((anim) => anim.kill());
    };
  }, []);

  // Random chat bubbles appearing - HIGH FREQUENCY for real-time feel
  useEffect(() => {
    const showRandomBubble = () => {
      const frontMiddleIndices = avatarPositions
        .map((p, i) => ({ depth: p.depth, index: i }))
        .filter((p) => p.depth !== "back")
        .map((p) => p.index);

      const randomAvatarIndex = frontMiddleIndices[Math.floor(Math.random() * frontMiddleIndices.length)];
      const randomMessage = chatMessages[Math.floor(Math.random() * chatMessages.length)];
      const newBubbleId = bubbleIdRef.current++;

      setChatBubbles((prev) => {
        const filtered = prev.length >= 10 ? prev.slice(1) : prev;
        return [...filtered, { id: newBubbleId, avatarIndex: randomAvatarIndex, message: randomMessage }];
      });

      // Play chat bubble sound (with low probability to avoid sound spam)
      if (enableSound && audioInitialized && Math.random() > 0.85) {
        playChatBubbleSound();
      }

      setTimeout(() => {
        setChatBubbles((prev) => prev.filter((b) => b.id !== newBubbleId));
      }, 2000 + Math.random() * 1000);
    };

    // Initial burst of messages - rapid fire
    setTimeout(showRandomBubble, 400);
    setTimeout(showRandomBubble, 600);
    setTimeout(showRandomBubble, 800);
    setTimeout(showRandomBubble, 1000);
    setTimeout(showRandomBubble, 1200);
    setTimeout(showRandomBubble, 1400);
    setTimeout(showRandomBubble, 1700);
    setTimeout(showRandomBubble, 2000);

    // Continuous messages - very fast interval
    const interval = setInterval(showRandomBubble, 600 + Math.random() * 400);

    return () => clearInterval(interval);
  }, [enableSound, audioInitialized]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* Dark grey gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f0f1a 60%, #1a1a2e 100%)",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* World Map */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{ zIndex: 1 }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg"
          alt=""
          className="absolute pointer-events-none select-none"
          style={{
            width: "110%",
            height: "auto",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.08,
            filter: "brightness(0) invert(1)",
          }}
        />

        {/* Animated pulse circles on cities - MORE of them */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute w-[140%] h-[140%]"
          style={{ left: "-20%", top: "-20%" }}
          preserveAspectRatio="xMidYMid slice"
        >
          {[
            { cx: 150, cy: 150, delay: 0 },
            { cx: 200, cy: 180, delay: 0.2 },
            { cx: 250, cy: 220, delay: 0.4 },
            { cx: 280, cy: 350, delay: 0.6 },
            { cx: 320, cy: 280, delay: 0.8 },
            { cx: 420, cy: 140, delay: 1.0 },
            { cx: 480, cy: 160, delay: 1.2 },
            { cx: 520, cy: 300, delay: 1.4 },
            { cx: 580, cy: 250, delay: 1.6 },
            { cx: 650, cy: 180, delay: 1.8 },
            { cx: 700, cy: 200, delay: 2.0 },
            { cx: 750, cy: 240, delay: 2.2 },
            { cx: 780, cy: 220, delay: 2.4 },
            { cx: 820, cy: 280, delay: 2.6 },
            { cx: 850, cy: 200, delay: 2.8 },
            { cx: 880, cy: 320, delay: 3.0 },
            { cx: 920, cy: 180, delay: 3.2 },
            { cx: 880, cy: 380, delay: 3.4 },
          ].map((city, i) => (
            <g key={i}>
              <motion.circle
                cx={city.cx}
                cy={city.cy}
                r="3"
                fill="#4ade80"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{ delay: city.delay + 0.5, duration: 0.5 }}
              />
              <motion.circle
                cx={city.cx}
                cy={city.cy}
                r="3"
                fill="none"
                stroke="#4ade80"
                strokeWidth="1"
                initial={{ scale: 1, opacity: 0 }}
                animate={{
                  scale: [1, 4, 5],
                  opacity: [0.5, 0.15, 0],
                }}
                transition={{
                  duration: 3,
                  delay: city.delay + 1,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </g>
          ))}

          {/* Connection arc lines - MORE connections */}
          {[
            { x1: 150, y1: 150, x2: 420, y2: 140 },
            { x1: 200, y1: 180, x2: 480, y2: 160 },
            { x1: 480, y1: 160, x2: 780, y2: 220 },
            { x1: 780, y1: 220, x2: 850, y2: 200 },
            { x1: 850, y1: 200, x2: 920, y2: 180 },
            { x1: 920, y1: 180, x2: 880, y2: 380 },
            { x1: 280, y1: 350, x2: 520, y2: 300 },
            { x1: 700, y1: 200, x2: 880, y2: 320 },
            { x1: 200, y1: 180, x2: 280, y2: 350 },
            { x1: 650, y1: 180, x2: 750, y2: 240 },
            { x1: 320, y1: 280, x2: 580, y2: 250 },
            { x1: 420, y1: 140, x2: 650, y2: 180 },
          ].map((line, i) => (
            <motion.path
              key={`arc-${i}`}
              d={`M${line.x1},${line.y1} Q${(line.x1 + line.x2) / 2},${Math.min(line.y1, line.y2) - 50} ${line.x2},${line.y2}`}
              fill="none"
              stroke="rgba(74, 222, 128, 0.3)"
              strokeWidth="0.8"
              strokeDasharray="6,6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{
                duration: 2,
                delay: 1.5 + i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Animated data packets along specific connection paths */}
          {[
            { x1: 150, y1: 150, x2: 420, y2: 140, duration: 12, delay: 0 },
            { x1: 200, y1: 180, x2: 480, y2: 160, duration: 10, delay: 3 },
            { x1: 480, y1: 160, x2: 780, y2: 220, duration: 14, delay: 6 },
            { x1: 780, y1: 220, x2: 850, y2: 200, duration: 8, delay: 2 },
            { x1: 280, y1: 350, x2: 520, y2: 300, duration: 11, delay: 8 },
            { x1: 700, y1: 200, x2: 880, y2: 320, duration: 13, delay: 5 },
            { x1: 200, y1: 180, x2: 280, y2: 350, duration: 9, delay: 10 },
            { x1: 650, y1: 180, x2: 750, y2: 240, duration: 7, delay: 4 },
            { x1: 320, y1: 280, x2: 580, y2: 250, duration: 15, delay: 7 },
            { x1: 420, y1: 140, x2: 650, y2: 180, duration: 10, delay: 1 },
          ].map((packet, i) => {
            const midX = (packet.x1 + packet.x2) / 2;
            const midY = Math.min(packet.y1, packet.y2) - 50;
            // Quadratic bezier curve points
            const t25X = 0.5625 * packet.x1 + 0.375 * midX + 0.0625 * packet.x2;
            const t25Y = 0.5625 * packet.y1 + 0.375 * midY + 0.0625 * packet.y2;
            const t50X = 0.25 * packet.x1 + 0.5 * midX + 0.25 * packet.x2;
            const t50Y = 0.25 * packet.y1 + 0.5 * midY + 0.25 * packet.y2;
            const t75X = 0.0625 * packet.x1 + 0.375 * midX + 0.5625 * packet.x2;
            const t75Y = 0.0625 * packet.y1 + 0.375 * midY + 0.5625 * packet.y2;

            return (
              <motion.circle
                key={`packet-${i}`}
                r="2.5"
                fill="#4ade80"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.8, 1, 1, 0.8, 0],
                  cx: [packet.x1, t25X, t50X, t75X, packet.x2],
                  cy: [packet.y1, t25Y, t50Y, t75Y, packet.y2],
                }}
                transition={{
                  duration: packet.duration,
                  delay: packet.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 2 + Math.random() * 4,
                }}
              />
            );
          })}
        </svg>
      </motion.div>

      {/* Animated gradient overlay for atmosphere */}
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 20%, rgba(74,222,128,0.08) 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 80%, rgba(74,222,128,0.08) 0%, transparent 50%)",
            "radial-gradient(ellipse at 50% 30%, rgba(74,222,128,0.08) 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 20%, rgba(74,222,128,0.08) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ zIndex: 2 }}
      />

      {/* Floating particles - MORE particles */}
      {[...Array(40)].map((_, i) => {
        const depth = i % 3;
        const size = depth === 0 ? 2 : depth === 1 ? 3 : 4;
        const opacity = depth === 0 ? 0.15 : depth === 1 ? 0.25 : 0.4;

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: i % 4 === 0 ? "#4ade80" : "rgba(255,255,255,0.5)",
              left: `${2 + Math.random() * 96}%`,
              top: `${2 + Math.random() * 96}%`,
              zIndex: depth,
            }}
            animate={{
              y: [0, -40 - depth * 15, 0],
              x: [0, (Math.random() - 0.5) * 30, 0],
              opacity: [opacity * 0.5, opacity, opacity * 0.5],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* 3D Container for avatars */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(3deg)",
        }}
      >
        {/* Animated Avatar Cards - 24 avatars */}
        {uniqueAvatars.map((avatar, index) => {
          const position = avatarPositions[index];
          const bubble = chatBubbles.find((b) => b.avatarIndex === index);
          const baseSize = position.depth === "back" ? 48 : position.depth === "middle" ? 56 : 68;

          return (
            <div
              key={avatar.id}
              ref={(el) => {
                avatarRefs.current[index] = el;
              }}
              className="absolute"
              style={{
                top: position.top,
                left: position.left,
                zIndex: position.zIndex,
                transformStyle: "preserve-3d",
                filter: position.depth === "back" ? "blur(1.5px)" : position.depth === "middle" ? "blur(0.5px)" : "none",
              }}
            >
              {/* Chat Bubble */}
              <AnimatePresence>
                {bubble && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 15, rotateX: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -15, rotateX: 20 }}
                    transition={{ duration: 0.35, ease: "backOut" }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    style={{ zIndex: 100 }}
                  >
                    <div
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        background: "rgba(30, 30, 45, 0.95)",
                        border: "1px solid rgba(74, 222, 128, 0.3)",
                        color: "#e5e5e5",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(74, 222, 128, 0.1)",
                      }}
                    >
                      {bubble.message}
                      <div
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
                        style={{
                          background: "rgba(30, 30, 45, 0.95)",
                          borderRight: "1px solid rgba(74, 222, 128, 0.3)",
                          borderBottom: "1px solid rgba(74, 222, 128, 0.3)",
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Avatar Card with 3D effect */}
              <motion.div
                whileHover={{
                  scale: 1.15,
                  rotateY: 8,
                  transition: { duration: 0.3 },
                }}
                className="relative cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Glow effect */}
                <div
                  className="absolute rounded-lg"
                  style={{
                    width: baseSize + 12,
                    height: baseSize + 12,
                    background: position.depth === "front" ? "rgba(74, 222, 128, 0.2)" : "transparent",
                    filter: "blur(12px)",
                    transform: "translateZ(-15px)",
                    top: -6,
                    left: -6,
                  }}
                />

                {/* Main Card */}
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    width: baseSize,
                    height: baseSize,
                    background: "linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)",
                    boxShadow:
                      position.depth === "front"
                        ? "0 15px 35px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
                        : "0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                    transform: "translateZ(0)",
                    border: position.depth === "front" ? "1px solid rgba(74,222,128,0.15)" : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Online indicator */}
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(74, 222, 128, 0.7)",
                      "0 0 0 8px rgba(74, 222, 128, 0)",
                      "0 0 0 0 rgba(74, 222, 128, 0.7)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.1,
                  }}
                  className="absolute -bottom-1 -right-1 bg-green-400 rounded-full"
                  style={{
                    width: position.depth === "front" ? 14 : position.depth === "middle" ? 11 : 8,
                    height: position.depth === "front" ? 14 : position.depth === "middle" ? 11 : 8,
                    transform: "translateZ(10px)",
                    border: "2px solid #1a1a2e",
                  }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Vignette overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
};

export default LoginBackground;
