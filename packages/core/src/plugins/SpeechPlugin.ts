import type { Cursor } from '../core/Cursor';
import type { CursorPlugin } from './CursorPlugin';
import { SayPlugin as SayPluginClass } from './SayPlugin';

declare module './SayPlugin' {
  interface SayOptions {
    speech?: {
      waitUntilFinished?: boolean;
      [key: string]: any;
    };
  }
}

export interface SpeechPluginOptions {
  enabled?: boolean;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Exact voice name to use (e.g., 'Google US English'). If not provided, best voice is auto-selected. */
  voiceName?: string;
  /** Wait for the speech to finish before proceeding to the next step */
  waitUntilFinished?: boolean;
}

export class SpeechPlugin implements CursorPlugin {
  name = 'speech';
  private options: Required<Omit<SpeechPluginOptions, 'enabled'>> & {
    enabled: boolean;
    voiceName: string;
    waitUntilFinished: boolean;
  };
  private cursor: Cursor | null = null;
  private speechRequestedHandler: ((text: string, options?: any) => Promise<void>) | null = null;

  constructor(options: SpeechPluginOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      lang: options.lang ?? 'en-US',
      rate: options.rate ?? 1,
      pitch: options.pitch ?? 1,
      volume: options.volume ?? 1,
      voiceName: options.voiceName ?? '',
      waitUntilFinished: options.waitUntilFinished ?? false,
    };
  }

  install(cursor: Cursor) {
    this.cursor = cursor;
    // Note: SayPlugin's onBeforeSay override is kept for backward compatibility,
    // but SpeechPlugin now also listens to 'speech_requested' via event emitter.

    this.speechRequestedHandler = async (text: string, options?: any) => {
      const shouldSpeak = this.options.enabled && options?.speak !== false;
      const waitUntilFinished =
        options?.speech?.waitUntilFinished ??
        options?.waitUntilFinished ??
        this.options.waitUntilFinished;

      if (shouldSpeak) {
        const playPromise = this.speak(text);
        if (waitUntilFinished) {
          await playPromise;
        } else {
          playPromise.catch((e) => console.error('[SpeechPlugin]', e));
        }
      }
    };

    cursor.on('speech_requested', this.speechRequestedHandler);

    const sayPlugin = cursor.getPlugin('say');
    if (!(sayPlugin instanceof SayPluginClass)) {
      console.warn(
        '[SpeechPlugin] SayPlugin not found, but Event Emitter will still process speech_requested events.',
      );
      return;
    }

    // Keep old override method so that if folks call say without event emitter, it might still work.
    // However, event emitter is primary. To avoid double-speaking, we only bind to event emitter.
    // Actually, sayPlugin now emits `speech_requested`. So we DO NOT need to override `onBeforeSay`.
    // We will just leave it. Or remove the override.
    // Let's remove the SayPlugin override to prevent double-speaking.
  }

  onDestroy(): void {
    if (this.cursor && this.speechRequestedHandler) {
      this.cursor.off('speech_requested', this.speechRequestedHandler);
    }

    this.speechRequestedHandler = null;
    this.cursor = null;
  }

  private speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('[SpeechPlugin] Web Speech API not supported in this browser.');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const lang = this.options.lang;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      const trySpeak = () => {
        const voices = speechSynthesis.getVoices();
        this.applyVoiceAndSpeak(utterance, lang, voices);
      };

      // Voices may not be loaded yet in some browsers
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        trySpeak();
      } else {
        speechSynthesis.addEventListener('voiceschanged', () => trySpeak(), { once: true });
      }
    });
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

  onPause(): void {
    if (
      'speechSynthesis' in window &&
      window.speechSynthesis.speaking &&
      !window.speechSynthesis.paused
    ) {
      window.speechSynthesis.pause();
    }
  }

  onResume(): void {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
}
