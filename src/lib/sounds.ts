"use client";

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

// Resume audio context on user interaction (required by browsers)
export const initAudio = (): void => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume();
  }
};

// Glitch/shudder sound effect - digital distortion
export const playGlitchSound = (intensity: number = 1): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.08 + intensity * 0.04;
  const volume = 0.15 + intensity * 0.1; // Louder for higher intensity

  // Create noise buffer
  const bufferSize = ctx.sampleRate * duration;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  // Generate glitchy noise with bit-crushing effect
  for (let i = 0; i < bufferSize; i++) {
    // Random noise with digital artifacts
    const noise = Math.random() * 2 - 1;
    // Bit crush effect (reduce resolution)
    const bitDepth = 4 + intensity * 2;
    const crushed = Math.round(noise * bitDepth) / bitDepth;
    output[i] = crushed * (1 - (i / bufferSize) * 0.5); // Fade out
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  // High-pass filter for digital crackle
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 800 + intensity * 400;

  // Bandpass for focused "digital" sound
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 2000 + Math.random() * 1000;
  bandpass.Q.value = 5;

  // Gain node for volume control
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  // Connect nodes
  noiseSource.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start(now);
  noiseSource.stop(now + duration);

  // Add a secondary "click" for extra punch
  if (intensity > 1) {
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(100 + Math.random() * 50, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.02);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.1, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);

    osc.connect(clickGain);
    clickGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
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
