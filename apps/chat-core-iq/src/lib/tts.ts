/**
 * Text-to-Speech Manager
 * Uses Web Speech API for browser-native voice synthesis
 */

export interface TTSOptions {
  rate?: number;      // 0.1 to 10, default 1
  pitch?: number;     // 0 to 2, default 1
  volume?: number;    // 0 to 1, default 1
  language?: 'en' | 'es';
  naturalPauses?: boolean; // Add pauses between sentences
}

// Known female voice names across different platforms
// Ordered by quality/naturalness - premium voices first
const FEMALE_VOICE_PREFERENCES = {
  en: [
    // Premium/Enhanced voices (most natural)
    'Samantha (Enhanced)',  // macOS premium
    'Samantha',             // macOS high-quality
    'Ava (Premium)',        // macOS premium
    'Ava',                  // macOS
    'Allison (Enhanced)',   // macOS premium
    'Allison',              // macOS
    // Standard high-quality voices
    'Karen',                // macOS Australian - very natural
    'Moira',                // macOS Irish - natural accent
    'Tessa',                // macOS South African
    'Victoria',             // macOS
    'Fiona',                // macOS Scottish
    'Nicky',                // macOS
    // Windows voices
    'Microsoft Jenny Online', // Windows 11 neural voice
    'Microsoft Jenny',      // Windows 11
    'Microsoft Aria',       // Windows neural
    'Microsoft Zira',       // Windows
    // Chrome/Edge voices
    'Google US English',    // Chrome
  ],
  es: [
    'Paulina (Enhanced)',   // macOS premium
    'Paulina',              // macOS Mexican Spanish - very natural
    'Monica (Enhanced)',    // macOS premium
    'Monica',               // macOS
    'Microsoft Elena Online', // Windows neural
    'Microsoft Helena',     // Windows
    'Google español',       // Chrome
    'Conchita',             // macOS
  ],
};

class TTSManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voicesLoaded: boolean = false;
  private voiceLoadPromise: Promise<void> | null = null;

  constructor() {
    this.loadVoices();
  }

  private loadVoices(): Promise<void> {
    if (this.voiceLoadPromise) return this.voiceLoadPromise;

    this.voiceLoadPromise = new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;
        resolve();
        return;
      }

      // Voices load asynchronously in some browsers
      speechSynthesis.onvoiceschanged = () => {
        this.voicesLoaded = true;
        resolve();
      };

      // Fallback timeout
      setTimeout(() => {
        this.voicesLoaded = true;
        resolve();
      }, 1000);
    });

    return this.voiceLoadPromise;
  }

  /**
   * Get all available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }

  /**
   * Select a female voice for the given language
   */
  selectFemaleVoice(language: 'en' | 'es' = 'en'): SpeechSynthesisVoice | null {
    const voices = speechSynthesis.getVoices();
    const preferences = FEMALE_VOICE_PREFERENCES[language];
    const langPrefix = language === 'es' ? 'es' : 'en';

    // Try preferred voices first
    for (const pref of preferences) {
      const match = voices.find(v =>
        v.name.includes(pref) && v.lang.startsWith(langPrefix)
      );
      if (match) return match;
    }

    // Try any voice with "Female" in name
    const femaleVoice = voices.find(v =>
      v.name.toLowerCase().includes('female') && v.lang.startsWith(langPrefix)
    );
    if (femaleVoice) return femaleVoice;

    // Try known feminine names
    const feminineNames = ['mary', 'emma', 'jessica', 'susan', 'lisa', 'anna', 'sarah'];
    const feminineVoice = voices.find(v =>
      feminineNames.some(name => v.name.toLowerCase().includes(name)) &&
      v.lang.startsWith(langPrefix)
    );
    if (feminineVoice) return feminineVoice;

    // Fallback to first voice matching language
    const langVoice = voices.find(v => v.lang.startsWith(langPrefix));
    if (langVoice) return langVoice;

    // Last resort: first available voice
    return voices[0] || null;
  }

  /**
   * Split text into sentences for natural pauses
   */
  private splitIntoSentences(text: string): string[] {
    // Split on sentence-ending punctuation, keeping the punctuation
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Speak a single sentence
   */
  private speakSentence(text: string, voice: SpeechSynthesisVoice | null, options: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      if (voice) {
        utterance.voice = voice;
      }

      // Natural speech parameters - more conversational
      utterance.rate = options.rate ?? 0.92;     // Slightly slower, more natural
      utterance.pitch = options.pitch ?? 1.0;    // Natural pitch
      utterance.volume = options.volume ?? 1;
      utterance.lang = (options.language === 'es') ? 'es-ES' : 'en-US';

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        if (event.error === 'interrupted' || event.error === 'canceled') {
          resolve();
        } else {
          reject(new Error(`Speech error: ${event.error}`));
        }
      };

      this.currentUtterance = utterance;
      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Natural delay between sentences
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Speak text with female voice - natural cadence
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    // Ensure voices are loaded
    await this.loadVoices();

    // Cancel any existing speech
    this.stop();

    const language = options.language || 'en';
    const voice = this.selectFemaleVoice(language);
    const useNaturalPauses = options.naturalPauses !== false; // Default true

    if (useNaturalPauses) {
      // Split into sentences and speak with pauses
      const sentences = this.splitIntoSentences(text);

      for (let i = 0; i < sentences.length; i++) {
        await this.speakSentence(sentences[i], voice, options);

        // Add natural pause between sentences (not after last one)
        if (i < sentences.length - 1) {
          // Vary pause length slightly for natural rhythm
          const pauseMs = 250 + Math.random() * 150; // 250-400ms
          await this.delay(pauseMs);
        }
      }
    } else {
      // Speak all at once (old behavior)
      await this.speakSentence(text, voice, options);
    }

    this.currentUtterance = null;
  }

  /**
   * Stop current speech
   */
  stop(): void {
    speechSynthesis.cancel();
    this.currentUtterance = null;
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return speechSynthesis.speaking;
  }

  /**
   * Pause speech
   */
  pause(): void {
    speechSynthesis.pause();
  }

  /**
   * Resume speech
   */
  resume(): void {
    speechSynthesis.resume();
  }
}

// Singleton instance
let ttsInstance: TTSManager | null = null;

export function getTTSManager(): TTSManager {
  if (!ttsInstance) {
    ttsInstance = new TTSManager();
  }
  return ttsInstance;
}

export async function speak(text: string, options?: TTSOptions): Promise<void> {
  return getTTSManager().speak(text, options);
}

export function stopSpeaking(): void {
  getTTSManager().stop();
}
