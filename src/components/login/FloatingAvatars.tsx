"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";

// Unique avatar data - diverse names and colors
const avatarData = [
  { initials: "AJ", name: "Alex Johnson", color: "#6366f1" },
  { initials: "SM", name: "Sarah Miller", color: "#ec4899" },
  { initials: "MK", name: "Mike Chen", color: "#14b8a6" },
  { initials: "EP", name: "Emma Park", color: "#f59e0b" },
  { initials: "JD", name: "James Davis", color: "#8b5cf6" },
  { initials: "LW", name: "Lisa Wang", color: "#ef4444" },
  { initials: "RB", name: "Ryan Brown", color: "#10b981" },
  { initials: "KT", name: "Kate Taylor", color: "#3b82f6" },
  { initials: "DM", name: "David Martinez", color: "#f97316" },
  { initials: "NR", name: "Nina Rodriguez", color: "#a855f7" },
  { initials: "TH", name: "Tom Harris", color: "#06b6d4" },
  { initials: "ZK", name: "Zoe Kim", color: "#d946ef" },
];

// Conversation snippets (will be blurred but give visual interest)
const conversations = [
  "Great work on the project!",
  "Let's sync up later today",
  "Did you see the new update?",
  "This looks amazing!",
  "Thanks for the help!",
  "Meeting in 10 mins",
  "Love the new design",
  "Can we chat quickly?",
  "Awesome progress!",
  "See you at standup",
];

interface FloatingAvatar {
  id: number;
  initials: string;
  name: string;
  color: string;
  x: number;
  y: number;
  scale: number;
  showBubble: boolean;
  bubbleText: string;
  bubbleDirection: "left" | "right";
}

const FloatingAvatars = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [avatars, setAvatars] = useState<FloatingAvatar[]>([]);
  const animationsRef = useRef<gsap.core.Tween[]>([]);

  // Initialize avatars with random positions
  useEffect(() => {
    const initialAvatars: FloatingAvatar[] = avatarData.map((data, index) => ({
      id: index,
      ...data,
      x: Math.random() * 70 + 10, // 10-80% of container width
      y: Math.random() * 70 + 10, // 10-80% of container height
      scale: 0.8 + Math.random() * 0.4, // 0.8-1.2 scale
      showBubble: false,
      bubbleText: conversations[Math.floor(Math.random() * conversations.length)],
      bubbleDirection: Math.random() > 0.5 ? "left" : "right",
    }));
    setAvatars(initialAvatars);
  }, []);

  // GSAP floating animation
  useEffect(() => {
    if (avatars.length === 0) return;

    // Clear existing animations
    animationsRef.current.forEach((anim) => anim.kill());
    animationsRef.current = [];

    avatarsRef.current.forEach((avatarEl, index) => {
      if (!avatarEl) return;

      // Random floating animation for each avatar
      const floatAnimation = () => {
        const randomX = (Math.random() - 0.5) * 100;
        const randomY = (Math.random() - 0.5) * 80;
        const duration = 4 + Math.random() * 4; // 4-8 seconds

        const tween = gsap.to(avatarEl, {
          x: randomX,
          y: randomY,
          duration,
          ease: "sine.inOut",
          onComplete: floatAnimation,
        });
        animationsRef.current.push(tween);
      };

      // Start with slight delay for each avatar
      setTimeout(floatAnimation, index * 200);

      // Subtle rotation
      const rotationTween = gsap.to(avatarEl, {
        rotation: (Math.random() - 0.5) * 10,
        duration: 3 + Math.random() * 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      animationsRef.current.push(rotationTween);
    });

    return () => {
      animationsRef.current.forEach((anim) => anim.kill());
    };
  }, [avatars]);

  // Show conversation bubbles randomly
  useEffect(() => {
    if (avatars.length === 0) return;

    const showRandomBubble = () => {
      const randomIndex = Math.floor(Math.random() * avatars.length);
      const newBubbleText =
        conversations[Math.floor(Math.random() * conversations.length)];

      setAvatars((prev) =>
        prev.map((avatar, idx) =>
          idx === randomIndex
            ? { ...avatar, showBubble: true, bubbleText: newBubbleText }
            : avatar
        )
      );

      // Hide bubble after delay
      setTimeout(() => {
        setAvatars((prev) =>
          prev.map((avatar, idx) =>
            idx === randomIndex ? { ...avatar, showBubble: false } : avatar
          )
        );
      }, 2500 + Math.random() * 1500);
    };

    // Show bubbles at random intervals
    const interval = setInterval(showRandomBubble, 1500 + Math.random() * 2000);

    // Show initial bubbles
    setTimeout(showRandomBubble, 500);
    setTimeout(showRandomBubble, 1200);

    return () => clearInterval(interval);
  }, [avatars.length]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800" />

      {/* Subtle dark overlay for better avatar visibility */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Floating Avatars */}
      {avatars.map((avatar, index) => (
        <div
          key={avatar.id}
          ref={(el) => {
            avatarsRef.current[index] = el;
          }}
          className="absolute"
          style={{
            left: `${avatar.x}%`,
            top: `${avatar.y}%`,
            transform: `scale(${avatar.scale})`,
            zIndex: Math.floor(avatar.scale * 10),
          }}
        >
          {/* Chat Bubble */}
          <AnimatePresence>
            {avatar.showBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`absolute bottom-full mb-2 ${
                  avatar.bubbleDirection === "left" ? "right-0" : "left-0"
                }`}
              >
                <div
                  className="relative px-4 py-2 rounded-2xl max-w-[180px] backdrop-blur-sm"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <p
                    className="text-white/90 text-sm whitespace-nowrap overflow-hidden"
                    style={{
                      filter: "blur(3px)",
                      userSelect: "none",
                    }}
                  >
                    {avatar.bubbleText}
                  </p>
                  {/* Typing indicator dots */}
                  <motion.div
                    className="flex gap-1 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/60"
                        animate={{
                          y: [0, -4, 0],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </motion.div>
                  {/* Bubble tail */}
                  <div
                    className={`absolute -bottom-2 ${
                      avatar.bubbleDirection === "left" ? "right-4" : "left-4"
                    } w-0 h-0`}
                    style={{
                      borderLeft: "8px solid transparent",
                      borderRight: "8px solid transparent",
                      borderTop: "8px solid rgba(255, 255, 255, 0.15)",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avatar Circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: index * 0.1,
              duration: 0.5,
              ease: "backOut",
            }}
            whileHover={{ scale: 1.1 }}
            className="relative"
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-40"
              style={{ backgroundColor: avatar.color }}
            />

            {/* Avatar */}
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-2xl cursor-pointer transition-transform"
              style={{
                background: `linear-gradient(135deg, ${avatar.color} 0%, ${avatar.color}dd 100%)`,
                border: "3px solid rgba(255, 255, 255, 0.3)",
                boxShadow: `0 8px 32px ${avatar.color}66, inset 0 2px 4px rgba(255,255,255,0.2)`,
              }}
            >
              {avatar.initials}
            </div>

            {/* Online indicator */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white/30"
              style={{
                boxShadow: "0 0 10px rgba(74, 222, 128, 0.6)",
              }}
            />
          </motion.div>
        </div>
      ))}

      {/* Connection lines between nearby avatars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
        </defs>
        {avatars.slice(0, 6).map((avatar, i) => {
          const nextAvatar = avatars[(i + 1) % avatars.length];
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${avatar.x}%`}
              y1={`${avatar.y}%`}
              x2={`${nextAvatar.x}%`}
              y2={`${nextAvatar.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, delay: i * 0.3 }}
            />
          );
        })}
      </svg>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingAvatars;
