import type { Cursor } from '../core/Cursor';
import type { CursorPlugin } from './CursorPlugin';

export interface SayOptions {
  duration?: number;
  requireClick?: boolean;
  position?: 'cursor' | 'bottom' | 'center';
}

declare module '../core/Cursor' {
  interface Cursor {
    say(text: string, options?: SayOptions): this;
  }
}

export interface SayPluginOptions {
  autoSpeak?: boolean;
  defaultPosition?: 'cursor' | 'bottom' | 'center';
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

  private async showBubble(_cursor: Cursor, text: string, options?: SayOptions) {
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
      borderRadius: '4px'
    });

    document.body.appendChild(this.bubbleElement);

    // Calculate duration based on text length if not provided
    const duration = options?.duration || Math.max(1000, text.length * 50);

    await new Promise(resolve => setTimeout(resolve, duration));

    if (this.bubbleElement && this.bubbleElement.parentNode) {
      this.bubbleElement.parentNode.removeChild(this.bubbleElement);
    }
    this.bubbleElement = null;
  }
}
