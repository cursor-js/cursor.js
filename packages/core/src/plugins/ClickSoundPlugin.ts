import type { Cursor } from '../core/Cursor';
import type { CursorPlugin } from './CursorPlugin';

export interface ClickSoundPluginOptions {
  volume?: number;
  soundUrl?: string; // Kullanıcı kendi .mp3 / .wav dosyasını verebilir
}

export class ClickSoundPlugin implements CursorPlugin {
  name = 'ClickSoundPlugin';
  private audioContext: AudioContext | null = null;
  private audioHtml: HTMLAudioElement | null = null;
  private options: ClickSoundPluginOptions;

  constructor(options: ClickSoundPluginOptions = {}) {
    this.options = options;
  }

  install(_cursor: Cursor) {
    if (typeof window !== 'undefined') {
      if (this.options.soundUrl) {
        // Gerçek MP3/WAV dosyası kullanma tercihi
        this.audioHtml = new Audio(this.options.soundUrl);
        this.audioHtml.volume = this.options.volume ?? 0.5;
      } else if (window.AudioContext || (window as any).webkitAudioContext) {
        // İnternet tarayıcısı sentezleyicisi (Fallback)
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      }
    }
  }

  onStateChange(newState: Record<string, any>) {
    if (newState.clickSound?.volume !== undefined) {
      this.options.volume = newState.clickSound.volume;
      if (this.audioHtml) {
        this.audioHtml.volume = this.options.volume as number;
      }
    }
  }

  onClickStart(_target: Element) {
    if (this.audioHtml) {
      // 1. Durum: Ses dosyası yüklüyse onu baştan oynat
      this.audioHtml.currentTime = 0;
      this.audioHtml.play().catch(() => {
        /* Autoplay engellerini yoksay */
      });
      return;
    }

    if (!this.audioContext) return;

    // 2. Durum: Sentetik ama geliştirilmiş (mekanik) tık sesi
    const volume = this.options.volume ?? 0.5;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Kare dalga "plastik düğme" hissiyatı için frekansı aniden düşürüyoruz
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.02);

    // Çınlamayı çok kısa (0.02s) tutuyoruz ki "bip" değil "çıt" yapsın
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.02);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.02);
  }
}
