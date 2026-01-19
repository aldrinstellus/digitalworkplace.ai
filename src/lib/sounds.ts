"use client";

// Audio context singleton
let audioContext: AudioContext | null = null;
let audioInitialized = false;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

// Initialize and resume audio context - tries to auto-play
export const initAudio = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Try to resume immediately
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {
      // Silently fail - will work after user interaction
    });
  }

  // If not initialized, set up listeners to resume on any interaction
  if (!audioInitialized) {
    audioInitialized = true;

    const resumeAudio = () => {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
    };

    // Listen for any user interaction to enable audio
    ["click", "touchstart", "keydown", "scroll"].forEach((event) => {
      window.addEventListener(event, resumeAudio, { once: true, passive: true });
    });
  }
};

// Old-school CRT TV glitch sound effect - Black Mirror style
export const playGlitchSound = (intensity: number = 1): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.15 + intensity * 0.08;
  const volume = 0.25 + intensity * 0.15; // Louder, more present

  // === LAYER 1: TV Static/White Noise with crackle ===
  const staticDuration = duration;
  const staticBuffer = ctx.createBuffer(2, ctx.sampleRate * staticDuration, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const output = staticBuffer.getChannelData(channel);
    let lastValue = 0;

    for (let i = 0; i < output.length; i++) {
      // Mix of white noise and crackling
      const noise = Math.random() * 2 - 1;

      // Add sudden pops/crackles (like old TV)
      const crackle = Math.random() > 0.97 ? (Math.random() > 0.5 ? 1 : -1) * 0.8 : 0;

      // Bit-crush for that digital artifact sound
      const bitDepth = 3 + Math.floor(intensity);
      const crushed = Math.round(noise * bitDepth) / bitDepth;

      // Add some "stickiness" like analog static
      lastValue = lastValue * 0.3 + (crushed + crackle) * 0.7;

      // Envelope: sharp attack, quick decay
      const envelope = i < output.length * 0.1
        ? i / (output.length * 0.1)
        : Math.pow(1 - (i - output.length * 0.1) / (output.length * 0.9), 0.5);

      output[i] = lastValue * envelope;
    }
  }

  const staticSource = ctx.createBufferSource();
  staticSource.buffer = staticBuffer;

  // Harsh bandpass for that CRT hiss
  const staticFilter = ctx.createBiquadFilter();
  staticFilter.type = "bandpass";
  staticFilter.frequency.value = 3000 + Math.random() * 2000;
  staticFilter.Q.value = 1.5;

  const staticGain = ctx.createGain();
  staticGain.gain.setValueAtTime(volume * 0.6, now);

  staticSource.connect(staticFilter);
  staticFilter.connect(staticGain);
  staticGain.connect(ctx.destination);

  staticSource.start(now);
  staticSource.stop(now + staticDuration);

  // === LAYER 2: Low frequency "thump" / power surge ===
  const thumpOsc = ctx.createOscillator();
  thumpOsc.type = "sine";
  thumpOsc.frequency.setValueAtTime(80, now);
  thumpOsc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(volume * 0.4, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  thumpOsc.connect(thumpGain);
  thumpGain.connect(ctx.destination);

  thumpOsc.start(now);
  thumpOsc.stop(now + 0.1);

  // === LAYER 3: High frequency "zap" / scan line ===
  const zapOsc = ctx.createOscillator();
  zapOsc.type = "sawtooth";
  zapOsc.frequency.setValueAtTime(2000 + Math.random() * 1000, now);
  zapOsc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

  const zapGain = ctx.createGain();
  zapGain.gain.setValueAtTime(volume * 0.15, now);
  zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const zapFilter = ctx.createBiquadFilter();
  zapFilter.type = "highpass";
  zapFilter.frequency.value = 1000;

  zapOsc.connect(zapFilter);
  zapFilter.connect(zapGain);
  zapGain.connect(ctx.destination);

  zapOsc.start(now);
  zapOsc.stop(now + 0.05);

  // === LAYER 4: Electrical buzz/hum ===
  const buzzOsc = ctx.createOscillator();
  buzzOsc.type = "square";
  buzzOsc.frequency.value = 60; // 60Hz hum like old electronics

  const buzzOsc2 = ctx.createOscillator();
  buzzOsc2.type = "square";
  buzzOsc2.frequency.value = 120; // Harmonic

  const buzzGain = ctx.createGain();
  buzzGain.gain.setValueAtTime(0, now);
  buzzGain.gain.linearRampToValueAtTime(volume * 0.08, now + 0.02);
  buzzGain.gain.linearRampToValueAtTime(volume * 0.08, now + duration - 0.03);
  buzzGain.gain.linearRampToValueAtTime(0, now + duration);

  const buzzFilter = ctx.createBiquadFilter();
  buzzFilter.type = "lowpass";
  buzzFilter.frequency.value = 400;

  buzzOsc.connect(buzzFilter);
  buzzOsc2.connect(buzzFilter);
  buzzFilter.connect(buzzGain);
  buzzGain.connect(ctx.destination);

  buzzOsc.start(now);
  buzzOsc2.start(now);
  buzzOsc.stop(now + duration);
  buzzOsc2.stop(now + duration);

  // === LAYER 5: Random digital artifacts (for higher intensity) ===
  if (intensity > 1) {
    // Rapid clicking/ticking like a broken signal
    for (let i = 0; i < 3 + intensity; i++) {
      const clickTime = now + Math.random() * duration * 0.8;

      const clickOsc = ctx.createOscillator();
      clickOsc.type = "square";
      clickOsc.frequency.value = 1000 + Math.random() * 2000;

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(volume * 0.2, clickTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.01);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickOsc.start(clickTime);
      clickOsc.stop(clickTime + 0.015);
    }

    // Add a "degauss" sweep sound
    const sweepOsc = ctx.createOscillator();
    sweepOsc.type = "sine";
    sweepOsc.frequency.setValueAtTime(100, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(2000, now + 0.06);
    sweepOsc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

    const sweepGain = ctx.createGain();
    sweepGain.gain.setValueAtTime(volume * 0.1, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    sweepOsc.connect(sweepGain);
    sweepGain.connect(ctx.destination);

    sweepOsc.start(now);
    sweepOsc.stop(now + 0.12);
  }
};

// Data packet / node travel sound - soft blip
export const playDataPacketSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

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
  const ctx = getAudioContext();
  if (!ctx) return;

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
  const ctx = getAudioContext();
  if (!ctx) return;

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
  const ctx = getAudioContext();
  if (!ctx) return;

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
