"use client";

// Audio context singleton
let audioContext: AudioContext | null = null;
let audioEnabled = true;
let interactionListenerAdded = false;
let audioContextResumed = false;

// Check if audio has been enabled by user
export const isAudioEnabled = (): boolean => audioEnabled;

// Enable audio (called when user clicks Enable Audio button)
export const enableAudio = (): void => {
  audioEnabled = true;
  initAudio();
};

// Disable audio (called when user clicks Disable Audio button)
export const disableAudio = (): void => {
  audioEnabled = false;
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

// Resume audio context - called on user interaction
const resumeAudioContext = async (): Promise<void> => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      audioContextResumed = true;
      console.log("Audio context resumed after user interaction");
    } catch (e) {
      console.log("Failed to resume audio context:", e);
    }
  } else if (ctx.state === "running") {
    audioContextResumed = true;
  }
};

// Handler for user interaction - resumes audio context
const handleUserInteraction = (): void => {
  resumeAudioContext();
  // Remove listeners after first interaction
  if (audioContextResumed) {
    removeInteractionListeners();
  }
};

// Add interaction listeners for any user activity
const addInteractionListeners = (): void => {
  if (typeof window === "undefined" || interactionListenerAdded) return;

  const events = ["click", "touchstart", "keydown", "mousedown", "pointerdown"];
  events.forEach(event => {
    document.addEventListener(event, handleUserInteraction, { once: false, passive: true });
  });
  interactionListenerAdded = true;
};

// Remove interaction listeners
const removeInteractionListeners = (): void => {
  if (typeof window === "undefined") return;

  const events = ["click", "touchstart", "keydown", "mousedown", "pointerdown"];
  events.forEach(event => {
    document.removeEventListener(event, handleUserInteraction);
  });
};

// Initialize and resume audio context
export const initAudio = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Try to resume immediately (works if there was prior interaction)
  resumeAudioContext();

  // Also add listeners for future interaction
  addInteractionListeners();
};

// Check if audio context is ready to play
export const isAudioReady = (): boolean => {
  const ctx = getAudioContext();
  return ctx !== null && ctx.state === "running";
};

// Pleasant digital glitch sound effect - softer, more musical
export const playGlitchSound = (intensity: number = 1): void => {
  // Only play if audio has been enabled by user
  if (!audioEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Ensure audio context is running - try to resume on every play attempt
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
    return; // Don't play if suspended, will play on next attempt after interaction
  }

  if (ctx.state !== "running") return;

  const now = ctx.currentTime;
  const duration = 0.25 + intensity * 0.1; // Longer, smoother duration
  const volume = 0.12 + intensity * 0.06; // Much softer overall

  // === LAYER 1: Soft filtered noise shimmer ===
  const shimmerDuration = duration;
  const shimmerBuffer = ctx.createBuffer(2, ctx.sampleRate * shimmerDuration, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const output = shimmerBuffer.getChannelData(channel);
    let lastValue = 0;

    for (let i = 0; i < output.length; i++) {
      // Softer noise with smooth interpolation
      const noise = Math.random() * 2 - 1;

      // Smooth the noise for a more pleasant texture
      lastValue = lastValue * 0.85 + noise * 0.15;

      // Smooth envelope: gradual attack, gradual decay
      const progress = i / output.length;
      const envelope = Math.sin(progress * Math.PI); // Smooth bell curve

      output[i] = lastValue * envelope;
    }
  }

  const shimmerSource = ctx.createBufferSource();
  shimmerSource.buffer = shimmerBuffer;

  // Soft highpass for airy shimmer
  const shimmerFilter = ctx.createBiquadFilter();
  shimmerFilter.type = "bandpass";
  shimmerFilter.frequency.value = 2000 + Math.random() * 1000;
  shimmerFilter.Q.value = 0.7; // Lower Q for smoother sound

  const shimmerGain = ctx.createGain();
  shimmerGain.gain.setValueAtTime(volume * 0.4, now);

  shimmerSource.connect(shimmerFilter);
  shimmerFilter.connect(shimmerGain);
  shimmerGain.connect(ctx.destination);

  shimmerSource.start(now);
  shimmerSource.stop(now + shimmerDuration);

  // === LAYER 2: Soft sub bass pulse ===
  const subOsc = ctx.createOscillator();
  subOsc.type = "sine";
  subOsc.frequency.setValueAtTime(60, now);
  subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.03);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  subOsc.connect(subGain);
  subGain.connect(ctx.destination);

  subOsc.start(now);
  subOsc.stop(now + 0.2);

  // === LAYER 3: Gentle high frequency sweep ===
  const sweepOsc = ctx.createOscillator();
  sweepOsc.type = "sine";
  sweepOsc.frequency.setValueAtTime(1200 + Math.random() * 400, now);
  sweepOsc.frequency.exponentialRampToValueAtTime(400, now + 0.12);

  const sweepGain = ctx.createGain();
  sweepGain.gain.setValueAtTime(0, now);
  sweepGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.02);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  // Soft lowpass to remove harshness
  const sweepFilter = ctx.createBiquadFilter();
  sweepFilter.type = "lowpass";
  sweepFilter.frequency.value = 3000;

  sweepOsc.connect(sweepFilter);
  sweepFilter.connect(sweepGain);
  sweepGain.connect(ctx.destination);

  sweepOsc.start(now);
  sweepOsc.stop(now + 0.12);

  // === LAYER 4: Soft harmonic tone (musical element) ===
  const toneOsc = ctx.createOscillator();
  toneOsc.type = "sine";
  toneOsc.frequency.value = 220; // A3 note - musical

  const toneOsc2 = ctx.createOscillator();
  toneOsc2.type = "sine";
  toneOsc2.frequency.value = 330; // E4 - perfect fifth harmony

  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0, now);
  toneGain.gain.linearRampToValueAtTime(volume * 0.08, now + 0.05);
  toneGain.gain.linearRampToValueAtTime(volume * 0.08, now + duration - 0.08);
  toneGain.gain.linearRampToValueAtTime(0, now + duration);

  toneOsc.connect(toneGain);
  toneOsc2.connect(toneGain);
  toneGain.connect(ctx.destination);

  toneOsc.start(now);
  toneOsc2.start(now);
  toneOsc.stop(now + duration);
  toneOsc2.stop(now + duration);

  // === LAYER 5: Subtle digital sparkle (for higher intensity) ===
  if (intensity > 1) {
    // Soft chime-like tones instead of harsh clicks
    for (let i = 0; i < 2 + Math.floor(intensity); i++) {
      const chimeTime = now + Math.random() * duration * 0.6 + 0.02;

      const chimeOsc = ctx.createOscillator();
      chimeOsc.type = "sine";
      chimeOsc.frequency.value = 800 + Math.random() * 800;

      const chimeGain = ctx.createGain();
      chimeGain.gain.setValueAtTime(volume * 0.1, chimeTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.08);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      chimeOsc.start(chimeTime);
      chimeOsc.stop(chimeTime + 0.1);
    }
  }
};

// Data packet / node travel sound - soft blip
export const playDataPacketSound = (): void => {
  if (!audioEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Ensure audio context is running
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
    return;
  }
  if (ctx.state !== "running") return;

  const now = ctx.currentTime;

  // Soft sine wave blip
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.03, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  // Low-pass filter for soft sound
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1500;

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
};

// Ambient floating/cascade sound - very subtle pad
export const playAmbientPulse = (): void => {
  if (!audioEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Ensure audio context is running
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
    return;
  }
  if (ctx.state !== "running") return;

  const now = ctx.currentTime;
  const duration = 2;

  // Very soft oscillator chord
  const frequencies = [220, 277.18, 329.63]; // A minor chord

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * (1 + Math.random() * 0.01); // Slight detune

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.008, now + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.008, now + duration - 0.5);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    // Low-pass for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + i * 0.1);
    osc.stop(now + duration);
  });
};

// Chat bubble pop sound - soft notification
export const playChatBubbleSound = (): void => {
  if (!audioEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Ensure audio context is running
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
    return;
  }
  if (ctx.state !== "running") return;

  const now = ctx.currentTime;

  // Soft "pop" sound
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.02, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
};

// Connection line pulse sound - very subtle
export const playConnectionSound = (): void => {
  if (!audioEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Ensure audio context is running
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
    return;
  }
  if (ctx.state !== "running") return;

  const now = ctx.currentTime;

  // Ultra-soft high frequency ping
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 1200 + Math.random() * 200;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.01, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1000;

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
};
