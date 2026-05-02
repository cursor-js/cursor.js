import type { Cursor } from '../core/Cursor';
import type { CursorPlugin } from './CursorPlugin';

export interface SayOptions {
  duration?: number;
  requireClick?: boolean;
  position?: 'cursor' | 'bottom' | 'center' | 'subtitle';
  speak?: boolean;
}

declare module '../core/Cursor' {
  interface Cursor {
    say(text: string, options?: SayOptions): this;
  }
}

export interface SayPluginOptions {
  autoSpeak?: boolean;
  defaultPosition?: 'cursor' | 'bottom' | 'center' | 'subtitle';
}

export class SayPlugin implements CursorPlugin {
  name = 'say';
  public onBeforeSay: ((text: string, options?: SayOptions) => Promise<void> | void) | null = null;
  public onAfterSay: ((text: string) => void) | null = null;
  private options: SayPluginOptions;
  private bubbleElement: HTMLElement | null = null;
  private moveIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(options: SayPluginOptions = {}) {
    this.options = {
      autoSpeak: false,
      defaultPosition: 'cursor',
      ...options,
    };
  }

  install(cursor: Cursor) {
    const self = this;

    // @ts-ignore - Extending the prototype
    cursor.constructor.prototype.say = function (text: string, options?: SayOptions) {
      return this.addStep(async () => {
        await self.showBubble(this, text, options);
      });
    };
  }

  private async showBubble(cursor: Cursor, text: string, options?: SayOptions) {
    const position = options?.position || this.options.defaultPosition || 'cursor';

    this.bubbleElement = document.createElement('div');
    this.bubbleElement.className = `cursor-js-speech-bubble cursor-js-speech-bubble-${position}`;
    this.bubbleElement.textContent = text;

    // Common styling
    Object.assign(this.bubbleElement.style, {
      position: 'absolute',
      zIndex: '10000',
      padding: '10px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontSize: '15px',
      fontFamily: 'sans-serif',
      pointerEvents: 'none',
      transition: 'opacity 0.2s ease-in-out',
      opacity: '0',
      lineHeight: '1.4',
      maxWidth: '300px',
    });

    // Position-specific styling
    if (position === 'cursor') {
      Object.assign(this.bubbleElement.style, {
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
      });
    } else if (position === 'subtitle') {
      Object.assign(this.bubbleElement.style, {
        position: 'fixed',
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '80%',
        textAlign: 'center',
      });
    } else {
      Object.assign(this.bubbleElement.style, {
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
      });
    }

    document.body.appendChild(this.bubbleElement);

    // Position the bubble (for cursor mode, use absolute positioning)
    if (position === 'cursor') {
      const cursorRect = cursor.cursor.el.getBoundingClientRect();
      const x = cursorRect.left + window.scrollX + 30;
      const y = cursorRect.top + window.scrollY - 10;
      this.bubbleElement.style.left = `${x}px`;
      this.bubbleElement.style.top = `${y}px`;
    } else if (position === 'bottom') {
      this.bubbleElement.style.position = 'fixed';
      this.bubbleElement.style.bottom = '20px';
      this.bubbleElement.style.left = '50%';
      this.bubbleElement.style.transform = 'translateX(-50%)';
    } else if (position === 'center') {
      this.bubbleElement.style.position = 'fixed';
      this.bubbleElement.style.top = '50%';
      this.bubbleElement.style.left = '50%';
      this.bubbleElement.style.transform = 'translate(-50%, -50%)';
    } else if (position === 'subtitle') {
      this.bubbleElement.style.transform = 'translateX(-50%)';
    }

    // Fade in
    requestAnimationFrame(() => {
      if (this.bubbleElement) this.bubbleElement.style.opacity = '1';
    });

    // Trigger onBeforeSay hook (for SpeechPlugin etc.)
    await this.onBeforeSay?.(text, options);

    // Track ghost cursor position if in cursor mode
    if (position === 'cursor') {
      this.moveIntervalId = setInterval(() => {
        if (this.bubbleElement && cursor.cursor && cursor.cursor.el) {
          const cursorRect = cursor.cursor.el.getBoundingClientRect();
          const x = cursorRect.left + window.scrollX + 30;
          const y = cursorRect.top + window.scrollY - 10;
          this.bubbleElement.style.left = `${x}px`;
          this.bubbleElement.style.top = `${y}px`;
        }
      }, 16); // ~60fps
    }

    // Calculate duration based on text length if not provided
    const duration = options?.duration || Math.max(1000, text.length * 50);

    await new Promise((resolve) => setTimeout(resolve, duration));

    // Fade out
    if (this.bubbleElement) {
      this.bubbleElement.style.opacity = '0';
      await new Promise((resolve) => setTimeout(resolve, 200)); // wait for fade out
    }

    // Clear interval if in cursor mode
    if (position === 'cursor' && this.moveIntervalId) {
      clearInterval(this.moveIntervalId);
      this.moveIntervalId = null;
    }

    // Trigger onAfterSay hook
    this.onAfterSay?.(text);

    if (this.bubbleElement && this.bubbleElement.parentNode) {
      this.bubbleElement.parentNode.removeChild(this.bubbleElement);
    }
    this.bubbleElement = null;
  }
}
