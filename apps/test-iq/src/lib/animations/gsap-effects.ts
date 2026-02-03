'use client';

import { gsap } from 'gsap';

// Pink theme color for glow effects
const PINK_GLOW = 'rgba(255, 51, 102, 0.5)';

/**
 * Logo Glitch Effect
 * Creates chromatic aberration with double-tap stutter effect
 */
export interface GlitchOptions {
  element: HTMLElement;
  intensity?: 'low' | 'medium' | 'high';
  duration?: number;
  doubleTap?: boolean;
}

export function logoGlitch({
  element,
  intensity = 'medium',
  duration = 0.15,
  doubleTap = true,
}: GlitchOptions): gsap.core.Timeline {
  const intensityMap = {
    low: { x: 2, skew: 1 },
    medium: { x: 4, skew: 2 },
    high: { x: 8, skew: 4 },
  };

  const config = intensityMap[intensity];
  const tl = gsap.timeline();

  // Create chromatic aberration layers if they don't exist
  const parent = element.parentElement;
  const redLayer = parent?.querySelector('.glitch-red') as HTMLElement | null;
  const cyanLayer = parent?.querySelector('.glitch-cyan') as HTMLElement | null;

  // Initial glitch burst
  tl.to(element, {
    x: config.x,
    skewX: config.skew,
    duration: duration * 0.3,
    ease: 'power2.out',
  })
    .to(element, {
      x: -config.x * 0.5,
      skewX: -config.skew * 0.5,
      duration: duration * 0.2,
      ease: 'power1.inOut',
    })
    .to(element, {
      x: config.x * 0.25,
      skewX: config.skew * 0.25,
      duration: duration * 0.2,
      ease: 'power1.out',
    })
    .to(element, {
      x: 0,
      skewX: 0,
      duration: duration * 0.3,
      ease: 'elastic.out(1, 0.5)',
    });

  // Chromatic aberration on layers
  if (redLayer && cyanLayer) {
    tl.to(
      redLayer,
      {
        x: config.x * 1.5,
        opacity: 0.8,
        duration: duration * 0.4,
        ease: 'power2.out',
      },
      0
    )
      .to(
        cyanLayer,
        {
          x: -config.x * 1.5,
          opacity: 0.8,
          duration: duration * 0.4,
          ease: 'power2.out',
        },
        0
      )
      .to(
        [redLayer, cyanLayer],
        {
          x: 0,
          opacity: 0,
          duration: duration * 0.6,
          ease: 'power2.inOut',
        },
        duration * 0.4
      );
  }

  // Double-tap stutter effect
  if (doubleTap && Math.random() > 0.4) {
    const stutterTl = gsap.timeline({ delay: duration + 0.05 });

    stutterTl
      .to(element, {
        x: config.x * 0.5,
        duration: 0.05,
        ease: 'power2.out',
      })
      .to(element, {
        x: 0,
        duration: 0.08,
        ease: 'elastic.out(1, 0.8)',
      });

    tl.add(stutterTl, '>');
  }

  return tl;
}

/**
 * Auto-triggering glitch at random intervals
 */
export function autoGlitch(
  element: HTMLElement,
  options: Partial<GlitchOptions> = {}
): { start: () => void; stop: () => void } {
  let intervalId: NodeJS.Timeout | null = null;
  let isRunning = false;

  const triggerGlitch = () => {
    if (!isRunning) return;

    // Random intensity
    const intensities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const randomIntensity = intensities[Math.floor(Math.random() * intensities.length)];

    logoGlitch({
      element,
      intensity: randomIntensity,
      doubleTap: Math.random() > 0.3,
      ...options,
    });
  };

  return {
    start: () => {
      if (isRunning) return;
      isRunning = true;

      // Initial glitch after short delay
      setTimeout(triggerGlitch, 500);

      // Random interval glitches (2-5 seconds)
      const scheduleNext = () => {
        if (!isRunning) return;
        const delay = 2000 + Math.random() * 3000;
        intervalId = setTimeout(() => {
          triggerGlitch();
          scheduleNext();
        }, delay);
      };

      scheduleNext();
    },
    stop: () => {
      isRunning = false;
      if (intervalId) {
        clearTimeout(intervalId);
        intervalId = null;
      }
    },
  };
}

/**
 * Animated Number Counter
 * Counts up from start to end with optional formatting
 */
export interface CounterOptions {
  element: HTMLElement;
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  easing?: string;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

export function numberCounter({
  element,
  start = 0,
  end,
  duration = 1.5,
  decimals = 0,
  prefix = '',
  suffix = '',
  easing = 'power2.out',
  onUpdate,
  onComplete,
}: CounterOptions): gsap.core.Tween {
  const counter = { value: start };

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    // Add thousand separators
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return prefix + parts.join('.') + suffix;
  };

  return gsap.to(counter, {
    value: end,
    duration,
    ease: easing,
    onUpdate: () => {
      element.textContent = formatNumber(counter.value);
      onUpdate?.(counter.value);
    },
    onComplete,
  });
}

/**
 * Number Counter with snap effect at the end
 */
export function numberCounterSnap({
  element,
  start = 0,
  end,
  duration = 1.2,
  decimals = 0,
  prefix = '',
  suffix = '',
  snapDuration = 0.15,
}: CounterOptions & { snapDuration?: number }): gsap.core.Timeline {
  const tl = gsap.timeline();

  // Main count animation (goes slightly past target)
  const overshoot = end * 0.02; // 2% overshoot

  tl.add(
    numberCounter({
      element,
      start,
      end: end + overshoot,
      duration: duration * 0.85,
      decimals,
      prefix,
      suffix,
      easing: 'power2.out',
    })
  );

  // Snap back to exact value
  tl.add(
    numberCounter({
      element,
      start: end + overshoot,
      end,
      duration: snapDuration,
      decimals,
      prefix,
      suffix,
      easing: 'back.out(2)',
    })
  );

  // Scale pop effect on snap
  tl.to(
    element,
    {
      scale: 1.08,
      duration: snapDuration * 0.5,
      ease: 'power2.out',
    },
    `-=${snapDuration}`
  ).to(element, {
    scale: 1,
    duration: snapDuration * 0.5,
    ease: 'elastic.out(1, 0.4)',
  });

  return tl;
}

/**
 * Hover Glow Timeline
 * Coordinated shadow and scale effect for interactive elements
 */
export interface HoverGlowOptions {
  element: HTMLElement;
  glowColor?: string;
  scale?: number;
  shadowBlur?: number;
  duration?: number;
}

export function createHoverGlow({
  element,
  glowColor = PINK_GLOW,
  scale = 1.02,
  shadowBlur = 20,
  duration = 0.25,
}: HoverGlowOptions): { enter: () => void; leave: () => void } {
  const enterTl = gsap.timeline({ paused: true });
  const leaveTl = gsap.timeline({ paused: true });

  // Get computed styles for initial values
  const computedStyle = getComputedStyle(element);
  const initialShadow = computedStyle.boxShadow || 'none';

  // Build enter animation
  enterTl
    .to(element, {
      scale,
      boxShadow: `0 0 ${shadowBlur}px ${glowColor}, 0 4px 12px rgba(0, 0, 0, 0.3)`,
      duration,
      ease: 'power2.out',
    })
    .to(
      element,
      {
        y: -2,
        duration: duration * 0.8,
        ease: 'power2.out',
      },
      0
    );

  // Build leave animation
  leaveTl
    .to(element, {
      scale: 1,
      boxShadow: initialShadow === 'none' ? '0 0 0 transparent' : initialShadow,
      duration: duration * 0.8,
      ease: 'power2.inOut',
    })
    .to(
      element,
      {
        y: 0,
        duration: duration * 0.8,
        ease: 'power2.inOut',
      },
      0
    );

  return {
    enter: () => {
      leaveTl.pause();
      enterTl.restart();
    },
    leave: () => {
      enterTl.pause();
      leaveTl.restart();
    },
  };
}

/**
 * Apply hover glow to element with automatic event binding
 */
export function applyHoverGlow(
  element: HTMLElement,
  options: Partial<HoverGlowOptions> = {}
): () => void {
  const glow = createHoverGlow({ element, ...options });

  const handleEnter = () => glow.enter();
  const handleLeave = () => glow.leave();

  element.addEventListener('mouseenter', handleEnter);
  element.addEventListener('mouseleave', handleLeave);

  // Return cleanup function
  return () => {
    element.removeEventListener('mouseenter', handleEnter);
    element.removeEventListener('mouseleave', handleLeave);
  };
}

/**
 * Stagger reveal animation for lists
 */
export interface StaggerRevealOptions {
  elements: HTMLElement[] | NodeListOf<Element>;
  duration?: number;
  stagger?: number;
  fromY?: number;
  fromOpacity?: number;
  ease?: string;
}

export function staggerReveal({
  elements,
  duration = 0.5,
  stagger = 0.08,
  fromY = 20,
  fromOpacity = 0,
  ease = 'power2.out',
}: StaggerRevealOptions): gsap.core.Tween {
  // Set initial state
  gsap.set(elements, {
    y: fromY,
    opacity: fromOpacity,
  });

  return gsap.to(elements, {
    y: 0,
    opacity: 1,
    duration,
    stagger,
    ease,
  });
}

/**
 * Chart line draw animation
 */
export function chartDraw(
  pathElement: SVGPathElement,
  duration = 1.5,
  ease = 'power2.inOut'
): gsap.core.Timeline {
  const length = pathElement.getTotalLength();
  const tl = gsap.timeline();

  // Set initial state
  gsap.set(pathElement, {
    strokeDasharray: length,
    strokeDashoffset: length,
  });

  tl.to(pathElement, {
    strokeDashoffset: 0,
    duration,
    ease,
  });

  return tl;
}

/**
 * Progress bar fill animation
 */
export function progressFill(
  element: HTMLElement,
  percentage: number,
  duration = 0.8,
  ease = 'power2.out'
): gsap.core.Tween {
  return gsap.to(element, {
    width: `${percentage}%`,
    duration,
    ease,
  });
}

/**
 * Pulse glow animation
 */
export function pulseGlow(
  element: HTMLElement,
  options: {
    glowColor?: string;
    minBlur?: number;
    maxBlur?: number;
    duration?: number;
    repeat?: number;
  } = {}
): gsap.core.Timeline {
  const {
    glowColor = PINK_GLOW,
    minBlur = 5,
    maxBlur = 15,
    duration = 1.5,
    repeat = -1,
  } = options;

  const tl = gsap.timeline({ repeat, yoyo: true });

  tl.to(element, {
    boxShadow: `0 0 ${maxBlur}px ${glowColor}`,
    duration: duration / 2,
    ease: 'sine.inOut',
  }).to(element, {
    boxShadow: `0 0 ${minBlur}px ${glowColor}`,
    duration: duration / 2,
    ease: 'sine.inOut',
  });

  return tl;
}

/**
 * Shake animation for attention/error states
 */
export function shake(
  element: HTMLElement,
  intensity = 5,
  duration = 0.5
): gsap.core.Timeline {
  const tl = gsap.timeline();

  tl.to(element, {
    x: intensity,
    duration: duration * 0.1,
    ease: 'power2.out',
  })
    .to(element, {
      x: -intensity,
      duration: duration * 0.1,
      ease: 'power2.inOut',
    })
    .to(element, {
      x: intensity * 0.6,
      duration: duration * 0.1,
      ease: 'power2.inOut',
    })
    .to(element, {
      x: -intensity * 0.6,
      duration: duration * 0.1,
      ease: 'power2.inOut',
    })
    .to(element, {
      x: intensity * 0.3,
      duration: duration * 0.1,
      ease: 'power2.inOut',
    })
    .to(element, {
      x: 0,
      duration: duration * 0.2,
      ease: 'elastic.out(1, 0.5)',
    });

  return tl;
}

/**
 * Typing cursor blink animation
 */
export function cursorBlink(
  element: HTMLElement,
  blinkDuration = 0.8
): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1 });

  tl.to(element, {
    opacity: 0,
    duration: blinkDuration / 2,
    ease: 'steps(1)',
  }).to(element, {
    opacity: 1,
    duration: blinkDuration / 2,
    ease: 'steps(1)',
  });

  return tl;
}

/**
 * Modal entrance animation
 */
export function modalEntrance(
  modalElement: HTMLElement,
  backdropElement?: HTMLElement,
  duration = 0.4
): gsap.core.Timeline {
  const tl = gsap.timeline();

  // Backdrop fade
  if (backdropElement) {
    gsap.set(backdropElement, { opacity: 0 });
    tl.to(backdropElement, {
      opacity: 1,
      duration: duration * 0.5,
      ease: 'power2.out',
    });
  }

  // Modal slide and scale
  gsap.set(modalElement, {
    opacity: 0,
    scale: 0.95,
    y: 20,
  });

  tl.to(
    modalElement,
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration,
      ease: 'back.out(1.5)',
    },
    backdropElement ? '-=0.2' : 0
  );

  return tl;
}

/**
 * Modal exit animation
 */
export function modalExit(
  modalElement: HTMLElement,
  backdropElement?: HTMLElement,
  duration = 0.3
): gsap.core.Timeline {
  const tl = gsap.timeline();

  tl.to(modalElement, {
    opacity: 0,
    scale: 0.95,
    y: 20,
    duration,
    ease: 'power2.in',
  });

  if (backdropElement) {
    tl.to(
      backdropElement,
      {
        opacity: 0,
        duration: duration * 0.7,
        ease: 'power2.out',
      },
      '-=0.15'
    );
  }

  return tl;
}

// Export all effects
export const gsapEffects = {
  logoGlitch,
  autoGlitch,
  numberCounter,
  numberCounterSnap,
  createHoverGlow,
  applyHoverGlow,
  staggerReveal,
  chartDraw,
  progressFill,
  pulseGlow,
  shake,
  cursorBlink,
  modalEntrance,
  modalExit,
};

export default gsapEffects;
