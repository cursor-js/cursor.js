import type { Cursor } from '../core/Cursor';
import type { CursorPlugin } from './CursorPlugin';

export type SayBubblePosition = 'cursor' | 'bottom' | 'center' | 'subtitle';

export interface SayOptions {
  duration?: number;
  requireClick?: boolean;
  position?: SayBubblePosition;
  speak?: boolean;
  /** Wait for the bubble to disappear before continuing the sequence. Default: false */
  waitUntilFinished?: boolean;
}

declare module '../core/Cursor' {
  interface Cursor {
    say(text: string, options?: SayOptions): this;
  }
}

export interface SayPositionerContext {
  cursor: Cursor;
  cursorElement: HTMLElement;
  bubbleElement: HTMLElement;
  position: SayBubblePosition;
  options?: SayOptions;
}

export type SayPositionerCleanup = () => void;

export type SayPositioner = (
  context: SayPositionerContext,
) => void | SayPositionerCleanup | Promise<void | SayPositionerCleanup>;

export interface SayPluginOptions {
  autoSpeak?: boolean;
  defaultPosition?: SayBubblePosition;
  positioner?: SayPositioner;
}

interface FloatingSayProvider {
  getSayPositioner: () => SayPositioner | undefined;
}

export class SayPlugin implements CursorPlugin {
  name = 'say';
  public onBeforeSay: ((text: string, options?: SayOptions) => Promise<void> | void) | null = null;
  public onAfterSay: ((text: string) => void) | null = null;
  private options: SayPluginOptions;
  private bubbleElement: HTMLElement | null = null;
  private moveIntervalId: ReturnType<typeof setInterval> | null = null;
  private positionCleanup: SayPositionerCleanup | null = null;

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
    const positioner = this.resolvePositioner(cursor);

    this.cleanupActiveBubble();

    const bubbleElement = document.createElement('div');
    bubbleElement.className = `cursor-js-speech-bubble cursor-js-speech-bubble-${position}`;
    bubbleElement.textContent = text;
    this.bubbleElement = bubbleElement;

    // Common styling
    // bubbleElement.style.setProperty('corner-shape', 'squircle');
    Object.assign(bubbleElement.style, {
      position: 'absolute',
      zIndex: '10000',
      padding: '10px 16px',
      borderRadius: '16px',
      cornerShape: 'squircle',
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
      Object.assign(bubbleElement.style, {
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
      });
    } else if (position === 'subtitle') {
      Object.assign(bubbleElement.style, {
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
      Object.assign(bubbleElement.style, {
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
      });
    }

    document.body.appendChild(bubbleElement);

    const positionCleanup = await this.positionBubble(
      cursor,
      bubbleElement,
      position,
      options,
      positioner,
    );
    this.positionCleanup = positionCleanup;

    // Fade in
    requestAnimationFrame(() => {
      if (bubbleElement.isConnected) bubbleElement.style.opacity = '1';
    });

    // Trigger onBeforeSay hook (for backward compatibility if needed)
    await this.onBeforeSay?.(text, options);

    // Trigger speech event via emitAsync
    await cursor.emitAsync('speech_requested', text, options);

    // Track ghost cursor position if in cursor mode
    if (position === 'cursor' && !positioner) {
      this.moveIntervalId = setInterval(() => {
        if (bubbleElement.isConnected && cursor.cursor && cursor.cursor.el) {
          this.positionCursorBubble(cursor, bubbleElement);
        }
      }, 16); // ~60fps
    }

    // Calculate duration based on text length if not provided
    const duration = options?.duration || Math.max(1000, text.length * 50);
    // Default to false as requested
    const waitUntilFinished = options?.waitUntilFinished ?? false;

    const finalizeBubble = async () => {
      await cursor.sleep(duration);

      if (bubbleElement.isConnected) {
        bubbleElement.style.opacity = '0';
        await cursor.sleep(200); // wait for fade out
        bubbleElement.remove();
      }

      if (this.bubbleElement === bubbleElement) {
        this.bubbleElement = null;
      }

      if (this.positionCleanup === positionCleanup) {
        this.cleanupPosition();
      }

      // Trigger onAfterSay hook
      this.onAfterSay?.(text);
    };

    if (waitUntilFinished) {
      await finalizeBubble();
    } else {
      // Fire and forget without holding the promise execution sequence
      finalizeBubble().catch(() => {});
    }
  }

  onDestroy() {
    this.cleanupActiveBubble();
  }

  private async positionBubble(
    cursor: Cursor,
    bubbleElement: HTMLElement,
    position: SayBubblePosition,
    options?: SayOptions,
    positioner?: SayPositioner,
  ): Promise<SayPositionerCleanup | null> {
    if (positioner) {
      const cleanup = await positioner({
        cursor,
        cursorElement: cursor.cursor.el,
        bubbleElement,
        position,
        options,
      });

      return cleanup || null;
    }

    if (position === 'cursor') {
      this.positionCursorBubble(cursor, bubbleElement);
    } else if (position === 'bottom') {
      bubbleElement.style.position = 'fixed';
      bubbleElement.style.bottom = '20px';
      bubbleElement.style.left = '50%';
      bubbleElement.style.transform = 'translateX(-50%)';
    } else if (position === 'center') {
      bubbleElement.style.position = 'fixed';
      bubbleElement.style.top = '50%';
      bubbleElement.style.left = '50%';
      bubbleElement.style.transform = 'translate(-50%, -50%)';
    } else if (position === 'subtitle') {
      bubbleElement.style.transform = 'translateX(-50%)';
    }

    return null;
  }

  private positionCursorBubble(cursor: Cursor, bubbleElement: HTMLElement) {
    const cursorRect = cursor.cursor.el.getBoundingClientRect();
    const bubbleRect = bubbleElement.getBoundingClientRect();
    const x = cursorRect.left + window.scrollX + 30;
    const y = cursorRect.top + window.scrollY - 10;
    const padding = 8;
    const maxX = window.scrollX + window.innerWidth - bubbleRect.width - padding;
    const maxY = window.scrollY + window.innerHeight - bubbleRect.height - padding;
    const minX = window.scrollX + padding;
    const minY = window.scrollY + padding;

    bubbleElement.style.left = `${this.clamp(x, minX, maxX)}px`;
    bubbleElement.style.top = `${this.clamp(y, minY, maxY)}px`;
  }

  private clamp(value: number, min: number, max: number) {
    if (max < min) return min;
    return Math.min(Math.max(value, min), max);
  }

  private cleanupPosition() {
    if (this.moveIntervalId) {
      clearInterval(this.moveIntervalId);
      this.moveIntervalId = null;
    }

    this.positionCleanup?.();
    this.positionCleanup = null;
  }

  private cleanupActiveBubble() {
    this.cleanupPosition();
    this.bubbleElement?.remove();
    this.bubbleElement = null;
  }

  private resolvePositioner(cursor: Cursor): SayPositioner | undefined {
    if (this.options.positioner) {
      return this.options.positioner;
    }

    const floatingPlugin = cursor.getPlugin('floating');
    return isFloatingSayProvider(floatingPlugin) ? floatingPlugin.getSayPositioner() : undefined;
  }
}

function isFloatingSayProvider(plugin: unknown): plugin is FloatingSayProvider {
  return (
    typeof plugin === 'object' &&
    plugin !== null &&
    'getSayPositioner' in plugin &&
    typeof plugin.getSayPositioner === 'function'
  );
}
