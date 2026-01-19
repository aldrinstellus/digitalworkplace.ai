/**
 * ElevenLabs Text-to-Speech Client
 * Provides natural-sounding voice synthesis via ElevenLabs API
 */

import { apiUrl } from "./utils";

export interface ElevenLabsTTSOptions {
  language?: 'en' | 'es' | 'ht';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Apply pronunciation replacements for proper TTS output
 * "Doral" should be pronounced as "dough-ral"
 */
function applyPronunciationFixes(text: string): string {
  // Replace "Doral" with phonetic "dough-ral" (case-insensitive)
  // But preserve the case pattern for natural speech
  return text
    .replace(/\bDoral\b/g, 'dough-ral')
    .replace(/\bDORAL\b/g, 'DOUGH-RAL')
    .replace(/\bdoral\b/g, 'dough-ral');
}

class ElevenLabsTTS {
  private currentAudio: HTMLAudioElement | null = null;
  private audioQueue: string[] = [];
  private isPlaying: boolean = false;
  private options: ElevenLabsTTSOptions = {};

  /**
   * Speak text using ElevenLabs API
   */
  async speak(text: string, options: ElevenLabsTTSOptions = {}): Promise<void> {
    this.options = options;

    // Stop any current speech
    this.stop();

    // Apply pronunciation fixes (e.g., "Doral" -> "dough-ral")
    const spokenText = applyPronunciationFixes(text);

    try {
      options.onStart?.();

      // Call our API route
      const response = await fetch(apiUrl('/api/tts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: spokenText,
          language: options.language || 'en',
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      await this.playAudio(audioUrl);

      // Clean up
      URL.revokeObjectURL(audioUrl);
      options.onEnd?.();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      options.onError?.(error as Error);

      // Fallback to browser TTS if ElevenLabs fails
      this.fallbackSpeak(text, options);
    }
  }

  /**
   * Play audio from URL
   */
  private playAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentAudio = new Audio(url);
      this.isPlaying = true;

      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
        resolve();
      };

      this.currentAudio.onerror = () => {
        this.isPlaying = false;
        this.currentAudio = null;
        reject(new Error('Audio playback failed'));
      };

      this.currentAudio.play().catch(reject);
    });
  }

  /**
   * Fallback to Web Speech API if ElevenLabs fails
   */
  private fallbackSpeak(text: string, options: ElevenLabsTTSOptions): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    // Apply pronunciation fixes for fallback TTS as well
    const spokenText = applyPronunciationFixes(text);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    // Map language codes to BCP 47 locale codes
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'ht': 'ht-HT', // Haitian Creole (fallback to French if not available)
    };
    utterance.lang = langMap[options.language || 'en'] || 'en-US';

    utterance.onend = () => options.onEnd?.();
    utterance.onerror = () => options.onEnd?.();

    speechSynthesis.speak(utterance);
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;

    // Also stop any fallback speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthesis.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance
let ttsInstance: ElevenLabsTTS | null = null;

export function getElevenLabsTTS(): ElevenLabsTTS {
  if (!ttsInstance) {
    ttsInstance = new ElevenLabsTTS();
  }
  return ttsInstance;
}

export async function speakWithElevenLabs(
  text: string,
  options?: ElevenLabsTTSOptions
): Promise<void> {
  return getElevenLabsTTS().speak(text, options);
}

export function stopElevenLabsSpeaking(): void {
  getElevenLabsTTS().stop();
}
