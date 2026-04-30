import type { Cursor } from '../core/Cursor';
import type { CursorPlugin } from './CursorPlugin';
import { SayPlugin as SayPluginClass } from './SayPlugin';

export interface SpeechPluginOptions {
  enabled?: boolean;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Exact voice name to use (e.g., 'Google US English'). If not provided, best voice is auto-selected. */
  voiceName?: string;
}

export class SpeechPlugin implements CursorPlugin {
  name = 'speech';
  private options: Required<Omit<SpeechPluginOptions, 'enabled'>> & {
    enabled: boolean;
    voiceName: string;
  };
  private originalOnBeforeSay: ((text: string, options?: any) => void) | null = null;

  constructor(options: SpeechPluginOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      lang: options.lang ?? 'en-US',
      rate: options.rate ?? 1,
      pitch: options.pitch ?? 1,
      volume: options.volume ?? 1,
      voiceName: options.voiceName ?? '',
    };
  }

  install(cursor: Cursor) {
    const sayPlugin = (cursor as any).plugins?.find((p: any) => p.name === 'say');
    if (!(sayPlugin instanceof SayPluginClass)) {
      console.warn('[SpeechPlugin] SayPlugin not found. Please install SayPlugin first.');
      return;
    }

    // Store original callback
    this.originalOnBeforeSay = sayPlugin.onBeforeSay || null;

    // Override with speech synthesis
    sayPlugin.onBeforeSay = (text: string, options?: { speak?: boolean }) => {
      // Call original if exists
      this.originalOnBeforeSay?.(text, options);

      // Check if speech is enabled (global + per-call)
      const shouldSpeak = this.options.enabled && options?.speak !== false;

      if (shouldSpeak) {
        this.speak(text);
      }
    };
  }

  private speak(text: string): void {
    if (!('speechSynthesis' in window)) {
      console.warn('[SpeechPlugin] Web Speech API not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = this.options.lang;
    const trySpeak = () => {
      const voices = speechSynthesis.getVoices();
      this.applyVoiceAndSpeak(utterance, lang, voices);
    };

    // Voices may not be loaded yet in some browsers
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      trySpeak();
    } else {
      speechSynthesis.addEventListener(
        'voiceschanged',
        () => {
          trySpeak();
        },
        { once: true },
      );
    }
  }

  private applyVoiceAndSpeak(
    utterance: SpeechSynthesisUtterance,
    lang: string,
    voices: SpeechSynthesisVoice[],
  ): void {
    // Use exact voice if specified, otherwise use first matching voice
    let voice = this.options.voiceName
      ? voices.find((v) => v.name === this.options.voiceName)
      : voices.find((v) => v.lang.startsWith(lang.split('-')[0])) ||
        voices.find((v) => v.lang === lang) ||
        voices[0];

    if (voice) {
      utterance.voice = voice;
      console.debug(`[SpeechPlugin] Using voice: "${voice.name}" (${voice.lang})`);
    } else {
      console.warn('[SpeechPlugin] No voice found, using default');
    }

    utterance.lang = lang;
    utterance.rate = this.options.rate;
    utterance.pitch = this.options.pitch;
    utterance.volume = this.options.volume;

    speechSynthesis.speak(utterance);
  }

  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
  }

  setLang(lang: string): void {
    this.options.lang = lang;
  }
}
