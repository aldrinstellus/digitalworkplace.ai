/**
 * DTMF Tone Generator
 * Generates authentic phone dial tones using Web Audio API
 */

// DTMF frequencies: each digit is a combination of row + column frequency
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

class DTMFGenerator {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.15; // Conservative volume
      this.masterGain.connect(this.audioContext.destination);
    }
  }

  /**
   * Play a DTMF tone for a single digit
   * @param digit - The digit (0-9, *, #)
   * @param duration - Tone duration in ms (default: 100)
   * @param pauseAfter - Pause after tone in ms (default: 50)
   */
  async playTone(digit: string, duration: number = 100, pauseAfter: number = 50): Promise<void> {
    const frequencies = DTMF_FREQUENCIES[digit];
    if (!frequencies) {
      console.warn(`Invalid DTMF digit: ${digit}`);
      return;
    }

    this.initAudioContext();
    if (!this.audioContext || !this.masterGain) return;

    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const [freq1, freq2] = frequencies;
    const now = this.audioContext.currentTime;
    const durationSec = duration / 1000;

    // Create oscillators for both frequencies
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Configure oscillators
    osc1.frequency.value = freq1;
    osc2.frequency.value = freq2;
    osc1.type = 'sine';
    osc2.type = 'sine';

    // Envelope: quick attack and release
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + 0.005);
    gainNode.gain.setValueAtTime(1, now + durationSec - 0.005);
    gainNode.gain.linearRampToValueAtTime(0, now + durationSec);

    // Connect audio graph
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Start and stop oscillators
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec);
    osc2.stop(now + durationSec);

    // Wait for tone + pause
    return new Promise((resolve) => {
      setTimeout(resolve, duration + pauseAfter);
    });
  }

  /**
   * Set master volume
   * @param level - Volume level 0-1
   */
  setVolume(level: number): void {
    if (!this.masterGain) this.initAudioContext();
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, level)) * 0.15;
    }
  }

  /**
   * Clean up audio context
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }
}

// Singleton instance
let dtmfInstance: DTMFGenerator | null = null;

export function getDTMFGenerator(): DTMFGenerator {
  if (!dtmfInstance) {
    dtmfInstance = new DTMFGenerator();
  }
  return dtmfInstance;
}

export function playDTMFTone(digit: string): Promise<void> {
  return getDTMFGenerator().playTone(digit);
}
