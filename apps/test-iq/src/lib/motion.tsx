"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { forwardRef, type ReactNode, type ComponentPropsWithoutRef, useEffect, useState, useRef } from "react";

// Default easing curve - smooth and snappy
const defaultEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Pink theme color for dTQ
const PINK_ACCENT = "#ff3366";
const PINK_GLOW = "rgba(255, 51, 102, 0.3)";

// =============================================================================
// FADE IN COMPONENT
// =============================================================================
interface FadeInProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, duration = 0.4, direction = "up", distance = 20, ...props }, ref) => {
    const directionOffset = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directionOffset[direction] }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, ...directionOffset[direction] }}
        transition={{ duration, delay, ease: defaultEase }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = "FadeIn";

// =============================================================================
// SLIDE IN COMPONENT
// =============================================================================
interface SlideInProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
}

export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ children, direction = "left", delay = 0, ...props }, ref) => {
    const offset = {
      left: { x: "-100%" },
      right: { x: "100%" },
      up: { y: "-100%" },
      down: { y: "100%" },
    };

    return (
      <motion.div
        ref={ref}
        initial={{ ...offset[direction], opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ ...offset[direction], opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SlideIn.displayName = "SlideIn";

// =============================================================================
// STAGGER CONTAINER & ITEM
// =============================================================================
interface StaggerContainerProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
}

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: defaultEase,
    },
  },
};

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, staggerDelay = 0.1, delayChildren = 0.1, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren,
            },
          },
        }}
        initial="hidden"
        animate="show"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerContainer.displayName = "StaggerContainer";

interface StaggerItemProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
}

export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div ref={ref} variants={staggerItemVariants} {...props}>
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = "StaggerItem";

// =============================================================================
// SCALE ON HOVER
// =============================================================================
interface ScaleOnHoverProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  scale?: number;
  tapScale?: number;
  glowColor?: string;
}

export const ScaleOnHover = forwardRef<HTMLDivElement, ScaleOnHoverProps>(
  ({ children, scale = 1.02, tapScale = 0.98, glowColor = PINK_GLOW, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{
          scale,
          boxShadow: `0 0 20px ${glowColor}`,
        }}
        whileTap={{ scale: tapScale }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ScaleOnHover.displayName = "ScaleOnHover";

// =============================================================================
// HOVER CARD
// =============================================================================
interface HoverCardProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  hoverScale?: number;
  hoverY?: number;
}

export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(
  ({ children, hoverScale = 1.02, hoverY = -4, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{
          scale: hoverScale,
          y: hoverY,
          boxShadow: `0 20px 40px ${PINK_GLOW}`,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
HoverCard.displayName = "HoverCard";

// =============================================================================
// PAGE TRANSITION WRAPPER
// =============================================================================
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: defaultEase }}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// COLLAPSE / EXPAND ANIMATION
// =============================================================================
interface CollapseProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function Collapse({ isOpen, children, className }: CollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          className={className}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: defaultEase }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// PULSE ANIMATION
// =============================================================================
interface PulseProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  intensity?: number;
}

export const Pulse = forwardRef<HTMLDivElement, PulseProps>(
  ({ children, intensity = 1.05, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        animate={{
          scale: [1, intensity, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Pulse.displayName = "Pulse";

// =============================================================================
// BACKDROP ANIMATION (for modals)
// =============================================================================
interface BackdropProps extends ComponentPropsWithoutRef<typeof motion.div> {
  onClick?: () => void;
}

export const Backdrop = forwardRef<HTMLDivElement, BackdropProps>(
  ({ onClick, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        {...props}
      />
    );
  }
);
Backdrop.displayName = "Backdrop";

// =============================================================================
// MODAL ANIMATION WRAPPER
// =============================================================================
interface ModalAnimationProps {
  children: ReactNode;
  className?: string;
}

export function ModalAnimation({ children, className }: ModalAnimationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// ANIMATED COUNTER
// =============================================================================
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatValue?: (value: number) => string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className,
  formatValue,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formattedValue = formatValue
    ? formatValue(displayValue)
    : displayValue.toFixed(displayValue % 1 === 0 ? 0 : 1);

  return (
    <motion.span
      className={className}
      key={value}
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
}

// =============================================================================
// TYPING INDICATOR (Pink themed for dTQ)
// =============================================================================
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: PINK_ACCENT }}
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// =============================================================================
// ANIMATED ICON BUTTON
// =============================================================================
interface AnimatedIconButtonProps extends ComponentPropsWithoutRef<typeof motion.button> {
  children: ReactNode;
}

export const AnimatedIconButton = forwardRef<HTMLButtonElement, AnimatedIconButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedIconButton.displayName = "AnimatedIconButton";

// =============================================================================
// LIST ANIMATION
// =============================================================================
interface AnimatedListProps extends ComponentPropsWithoutRef<typeof motion.ul> {
  children: ReactNode;
}

export const AnimatedList = forwardRef<HTMLUListElement, AnimatedListProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.ul
        ref={ref}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
        initial="hidden"
        animate="show"
        {...props}
      >
        {children}
      </motion.ul>
    );
  }
);
AnimatedList.displayName = "AnimatedList";

interface AnimatedListItemProps extends ComponentPropsWithoutRef<typeof motion.li> {
  children: ReactNode;
}

export const AnimatedListItem = forwardRef<HTMLLIElement, AnimatedListItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.li
        ref={ref}
        variants={{
          hidden: { opacity: 0, x: -20 },
          show: {
            opacity: 1,
            x: 0,
            transition: {
              duration: 0.3,
              ease: defaultEase,
            },
          },
        }}
        {...props}
      >
        {children}
      </motion.li>
    );
  }
);
AnimatedListItem.displayName = "AnimatedListItem";

// =============================================================================
// SCROLL-TRIGGERED REVEAL
// =============================================================================
interface ScrollRevealProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
}

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  (
    {
      children,
      direction = "up",
      delay = 0,
      duration = 0.5,
      distance = 30,
      once = true,
      threshold = 0.2,
      ...props
    },
    ref
  ) => {
    const directionOffset = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directionOffset[direction] }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once, amount: threshold }}
        transition={{ duration, delay, ease: defaultEase }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ScrollReveal.displayName = "ScrollReveal";

// =============================================================================
// GLOW ANIMATION
// =============================================================================
interface GlowProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  color?: string;
}

export const Glow = forwardRef<HTMLDivElement, GlowProps>(
  ({ children, color = PINK_GLOW, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        animate={{
          boxShadow: [
            `0 0 10px ${color}`,
            `0 0 20px ${color}`,
            `0 0 10px ${color}`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Glow.displayName = "Glow";

// =============================================================================
// BORDER GLOW ANIMATION
// =============================================================================
interface BorderGlowProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  color?: string;
  borderRadius?: string;
}

export const BorderGlow = forwardRef<HTMLDivElement, BorderGlowProps>(
  ({ children, color = PINK_ACCENT, borderRadius = "0.75rem", className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`relative ${className || ''}`}
        {...props}
      >
        <motion.div
          className="absolute -inset-[1px] opacity-0 rounded-xl"
          style={{
            background: `linear-gradient(90deg, ${color}, transparent, ${color})`,
            backgroundSize: "200% 100%",
            borderRadius,
          }}
          whileHover={{
            opacity: 1,
            backgroundPosition: ["0% 0%", "200% 0%"],
          }}
          transition={{
            opacity: { duration: 0.3 },
            backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
          }}
        />
        <div className="relative">{children}</div>
      </motion.div>
    );
  }
);
BorderGlow.displayName = "BorderGlow";

// =============================================================================
// TREND ARROW WITH BOUNCE
// =============================================================================
interface TrendArrowProps {
  trend: "up" | "down" | "stable";
  className?: string;
}

export function TrendArrow({ trend, className }: TrendArrowProps) {
  if (trend === "stable") {
    return (
      <motion.span className={className}>
        —
      </motion.span>
    );
  }

  return (
    <motion.span
      className={className}
      initial={{ y: 0 }}
      animate={{ y: [0, trend === "up" ? -3 : 3, 0] }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut",
      }}
    >
      {trend === "up" ? "↑" : "↓"}
    </motion.span>
  );
}

// =============================================================================
// LOGO PULSE (Pink themed for dTQ)
// =============================================================================
interface LogoPulseProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  glowColor?: string;
  intensity?: "subtle" | "medium" | "strong";
}

export const LogoPulse = forwardRef<HTMLDivElement, LogoPulseProps>(
  ({ children, glowColor = PINK_GLOW, intensity = "subtle", ...props }, ref) => {
    const intensityMap = {
      subtle: { scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] },
      medium: { scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] },
      strong: { scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] },
    };

    const durationMap = {
      subtle: 4,
      medium: 3,
      strong: 2.5,
    };

    return (
      <motion.div
        ref={ref}
        animate={intensityMap[intensity]}
        transition={{
          duration: durationMap[intensity],
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.05,
          boxShadow: `0 0 20px ${glowColor}`,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
LogoPulse.displayName = "LogoPulse";

// =============================================================================
// STAGGER REVEAL (for lists that reveal on scroll)
// =============================================================================
interface StaggerRevealContainerProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  staggerDelay?: number;
  once?: boolean;
  threshold?: number;
}

export const StaggerRevealContainer = forwardRef<HTMLDivElement, StaggerRevealContainerProps>(
  ({ children, staggerDelay = 0.1, once = true, threshold = 0.2, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
            },
          },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once, amount: threshold }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerRevealContainer.displayName = "StaggerRevealContainer";

// =============================================================================
// NUMBER POP (for value changes)
// =============================================================================
interface NumberPopProps {
  children: ReactNode;
  trigger?: number | string;
}

export function NumberPop({ children, trigger }: NumberPopProps) {
  return (
    <motion.span
      key={trigger?.toString()}
      initial={{ scale: 1.2, color: PINK_ACCENT }}
      animate={{ scale: 1, color: "inherit" }}
      transition={{ duration: 0.3, ease: defaultEase }}
    >
      {children}
    </motion.span>
  );
}

// =============================================================================
// SHIMMER SKELETON
// =============================================================================
interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Shimmer({ className, width, height }: ShimmerProps) {
  return (
    <div
      className={`animate-shimmer rounded bg-gradient-to-r from-[var(--bg-tertiary)] via-[var(--bg-elevated)] to-[var(--bg-tertiary)] bg-[length:200%_100%] ${className || ''}`}
      style={{ width, height }}
    />
  );
}

// =============================================================================
// INTERACTIVE CARD WRAPPER
// =============================================================================
interface InteractiveCardProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  onClick?: () => void;
}

export const InteractiveCard = forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ children, onClick, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`cursor-pointer transition-colors ${className || ''}`}
        onClick={onClick}
        whileHover={{
          scale: 1.02,
          y: -2,
          boxShadow: `0 10px 30px ${PINK_GLOW}`,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
InteractiveCard.displayName = "InteractiveCard";

// =============================================================================
// EXPORT FRAMER MOTION UTILITIES
// =============================================================================
export { AnimatePresence, motion };
