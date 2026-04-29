import type { Cursor } from '../core/Cursor';
import type { CursorPlugin } from './CursorPlugin';

export interface SayOptions {
  duration?: number;
  requireClick?: boolean;
  position?: 'cursor' | 'bottom' | 'center' | 'subtitle';
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
  private options: SayPluginOptions;
  private bubbleElement: HTMLElement | null = null;

  constructor(options: SayPluginOptions = {}) {
    this.options = {
      autoSpeak: false,
      defaultPosition: 'cursor',
      ...options
    };
  }

  install(cursor: Cursor) {
    const self = this;
    
    // @ts-ignore - Extending the prototype
    cursor.constructor.prototype.say = function(text: string, options?: SayOptions) {
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
    
    // Basic styling for the test to pass
    Object.assign(this.bubbleElement.style, {
      position: 'absolute',
      zIndex: '10000',
      background: 'white',
      border: '1px solid black',
      padding: '8px',
      borderRadius: '4px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      fontSize: '14px',
      fontFamily: 'sans-serif',
      pointerEvents: 'none',
      transition: 'opacity 0.2s ease-in-out',
      opacity: '0'
    });

    document.body.appendChild(this.bubbleElement);

    // Position the bubble
    if (position === 'cursor') {
      this.bubbleElement.style.position = 'fixed';
      this.bubbleElement.style.top = '50%';
      this.bubbleElement.style.left = '50%';
      this.bubbleElement.style.transform = 'translate(-50%, -50%)';
      this.bubbleElement.style.maxWidth = '80%';
      this.bubbleElement.style.textAlign = 'center';
      this.bubbleElement.style.background = 'rgba(0, 0, 0, 0.85)';
      this.bubbleElement.style.color = 'white';
      this.bubbleElement.style.borderRadius = '8px';
      this.bubbleElement.style.fontSize = '16px';
      this.bubbleElement.style.lineHeight = '1.4';
      this.bubbleElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
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
      this.bubbleElement.style.position = 'fixed';
      this.bubbleElement.style.bottom = '40px';
      this.bubbleElement.style.left = '50%';
      this.bubbleElement.style.transform = 'translateX(-50%)';
      this.bubbleElement.style.maxWidth = '80%';
      this.bubbleElement.style.textAlign = 'center';
      this.bubbleElement.style.background = 'rgba(0, 0, 0, 0.85)';
      this.bubbleElement.style.color = 'white';
      this.bubbleElement.style.borderRadius = '8px';
      this.bubbleElement.style.fontSize = '16px';
      this.bubbleElement.style.lineHeight = '1.4';
    }

    // Fade in
    requestAnimationFrame(() => {
      if (this.bubbleElement) this.bubbleElement.style.opacity = '1';
    });

    // Calculate duration based on text length if not provided
    const duration = options?.duration || Math.max(1000, text.length * 50);

    await new Promise(resolve => setTimeout(resolve, duration));

    // Fade out
    if (this.bubbleElement) {
      this.bubbleElement.style.opacity = '0';
      await new Promise(resolve => setTimeout(resolve, 200)); // wait for fade out
    }

    if (this.bubbleElement && this.bubbleElement.parentNode) {
      this.bubbleElement.parentNode.removeChild(this.bubbleElement);
    }
    this.bubbleElement = null;
  }
}
