"use client";

// Upbeat, cheerful background music generator using Web Audio API
// Perfect for team building and positive vibes!

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let schedulerInterval: NodeJS.Timeout | null = null;

// Musical parameters - upbeat and cheerful!
const BPM = 120; // Nice energetic tempo
const BEAT_LENGTH = 60 / BPM; // Duration of one beat in seconds

// Happy major chord progressions (C major scale based)
// I - V - vi - IV progression (the "happy" progression)
const CHORD_PROGRESSIONS = [
  [261.63, 329.63, 392.00], // C major (C-E-G)
  [392.00, 493.88, 587.33], // G major (G-B-D)
  [440.00, 523.25, 659.25], // A minor (A-C-E)
  [349.23, 440.00, 523.25], // F major (F-A-C)
];

// Upbeat bass notes following the chord roots
const BASS_NOTES = [130.81, 196.00, 220.00, 174.61]; // C2, G2, A2, F2

// Cheerful melody notes (pentatonic for pleasant sound)
const MELODY_NOTES = [
  523.25, 587.33, 659.25, 783.99, 880.00,
  783.99, 659.25, 587.33, 523.25, 440.00,
];

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

// Create soft kick drum sound
const playKick = (ctx: AudioContext, time: number, output: GainNode) => {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

  osc.connect(gain);
  gain.connect(output);

  osc.start(time);
  osc.stop(time + 0.3);
};

// Create hi-hat sound
const playHiHat = (ctx: AudioContext, time: number, output: GainNode, accent: boolean = false) => {
  const bufferSize = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(accent ? 0.15 : 0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  source.start(time);
};

// Create snare sound
const playSnare = (ctx: AudioContext, time: number, output: GainNode) => {
  // Noise component
  const bufferSize = Math.floor(ctx.sampleRate * 0.15);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const envelope = Math.exp(-i / (bufferSize * 0.1));
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3000;
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  source.start(time);

  // Tonal body
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.15, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

  osc.connect(oscGain);
  oscGain.connect(output);

  osc.start(time);
  osc.stop(time + 0.15);
};

// Play bass note
const playBass = (ctx: AudioContext, time: number, frequency: number, output: GainNode) => {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = frequency;

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = frequency * 2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.35, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + BEAT_LENGTH * 0.8);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0, time);
  gain2.gain.linearRampToValueAtTime(0.1, time + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.001, time + BEAT_LENGTH * 0.6);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500;

  osc.connect(filter);
  osc2.connect(gain2);
  filter.connect(gain);
  gain.connect(output);
  gain2.connect(output);

  osc.start(time);
  osc2.start(time);
  osc.stop(time + BEAT_LENGTH);
  osc2.stop(time + BEAT_LENGTH);
};

// Play chord pad
const playChord = (ctx: AudioContext, time: number, frequencies: number[], output: GainNode) => {
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = freq * 1.005; // Slight detune

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.1);
    gain.gain.setValueAtTime(0.08, time + BEAT_LENGTH * 3.5);
    gain.gain.linearRampToValueAtTime(0, time + BEAT_LENGTH * 4);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2500;

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    osc.start(time + i * 0.02);
    osc2.start(time + i * 0.02);
    osc.stop(time + BEAT_LENGTH * 4 + 0.1);
    osc2.stop(time + BEAT_LENGTH * 4 + 0.1);
  });
};

// Play melody note
const playMelody = (ctx: AudioContext, time: number, frequency: number, duration: number, output: GainNode) => {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = frequency;

  // Vibrato
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 5;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 4;

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.15, time + 0.03);
  gain.gain.setValueAtTime(0.12, time + duration * 0.7);
  gain.gain.linearRampToValueAtTime(0, time + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 4000;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  lfo.start(time);
  osc.start(time);
  lfo.stop(time + duration + 0.1);
  osc.stop(time + duration + 0.1);
};

// Play sparkle accent
const playSparkle = (ctx: AudioContext, time: number, output: GainNode) => {
  const frequencies = [1046.50, 1318.51, 1567.98]; // High C, E, G

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, time + i * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5 + i * 0.03);

    osc.connect(gain);
    gain.connect(output);

    osc.start(time + i * 0.03);
    osc.stop(time + 0.6);
  });
};

// Scheduler state
let currentBar = 0;
let currentBeat = 0;
let nextNoteTime = 0;
let melodyIndex = 0;

const scheduleMusic = () => {
  const ctx = audioContext;
  if (!ctx || !masterGain || !isPlaying) return;

  const scheduleAheadTime = 0.2;

  while (nextNoteTime < ctx.currentTime + scheduleAheadTime) {
    const chordIndex = currentBar % 4;
    const beatInBar = currentBeat % 4;

    // Kick on beats 1 and 3
    if (beatInBar === 0 || beatInBar === 2) {
      playKick(ctx, nextNoteTime, masterGain);
    }

    // Snare on beats 2 and 4
    if (beatInBar === 1 || beatInBar === 3) {
      playSnare(ctx, nextNoteTime, masterGain);
    }

    // Hi-hat on every 8th note
    playHiHat(ctx, nextNoteTime, masterGain, beatInBar === 0);
    playHiHat(ctx, nextNoteTime + BEAT_LENGTH / 2, masterGain, false);

    // Bass
    if (beatInBar === 0) {
      playBass(ctx, nextNoteTime, BASS_NOTES[chordIndex], masterGain);
    }
    if (beatInBar === 2) {
      playBass(ctx, nextNoteTime + BEAT_LENGTH / 2, BASS_NOTES[chordIndex] * 1.5, masterGain);
    }

    // Chord pad at start of each bar
    if (beatInBar === 0) {
      playChord(ctx, nextNoteTime, CHORD_PROGRESSIONS[chordIndex], masterGain);
    }

    // Melody
    if (beatInBar === 0 || beatInBar === 2) {
      const melodyNote = MELODY_NOTES[melodyIndex % MELODY_NOTES.length];
      playMelody(ctx, nextNoteTime, melodyNote, BEAT_LENGTH * 0.8, masterGain);
      melodyIndex++;
    }

    // Sparkle accent
    if (currentBeat % 16 === 15) {
      playSparkle(ctx, nextNoteTime, masterGain);
    }

    nextNoteTime += BEAT_LENGTH;
    currentBeat++;
    if (currentBeat % 4 === 0) {
      currentBar++;
    }
  }
};

// Start the music
export const startBackgroundMusic = async (volume: number = 0.3): Promise<boolean> => {
  // Prevent multiple starts
  if (isPlaying) {
    return true;
  }

  const ctx = getAudioContext();
  if (!ctx) {
    console.log("No audio context available");
    return false;
  }

  // Resume if suspended (required by browsers)
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      console.log("Audio context resumed");
    } catch (e) {
      console.error("Failed to resume audio context:", e);
      return false;
    }
  }

  // Create master gain
  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime); // Start at target volume
  masterGain.connect(ctx.destination);

  // Reset timing
  currentBar = 0;
  currentBeat = 0;
  melodyIndex = 0;
  nextNoteTime = ctx.currentTime + 0.05; // Small delay to ensure context is ready
  isPlaying = true;

  // Schedule first batch immediately
  scheduleMusic();

  // Start the scheduler loop
  schedulerInterval = setInterval(scheduleMusic, 25);

  console.log("Background music started!");
  return true;
};

// Stop the music
export const stopBackgroundMusic = (): void => {
  console.log("Stopping background music");

  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }

  const ctx = audioContext;
  if (masterGain && ctx) {
    try {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    } catch {
      // Context might be closed
    }
  }

  setTimeout(() => {
    isPlaying = false;
    masterGain = null;
  }, 400);
};

// Set volume
export const setMusicVolume = (volume: number): void => {
  if (masterGain && audioContext) {
    masterGain.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(1, volume)),
      audioContext.currentTime + 0.1
    );
  }
};

// Check if playing
export const isMusicPlaying = (): boolean => isPlaying;
