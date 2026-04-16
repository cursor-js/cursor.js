import type { Cursor } from '../core/Cursor';
import type { CursorPlugin } from './CursorPlugin';

export interface RipplePluginOptions {
  color?: string;
  duration?: number; // ms
  size?: number; // px
}

export class RipplePlugin implements CursorPlugin {
  name = 'RipplePlugin';
  private cursor: Cursor | null = null;
  private options: RipplePluginOptions;

  constructor(options: RipplePluginOptions = {}) {
    this.options = {
      color: 'rgba(0, 0, 0, 0.3)',
      duration: 600,
      size: 50,
      ...options,
    };
  }

  install(cursor: Cursor) {
    this.cursor = cursor;
  }

  onStateChange(newState: Record<string, any>) {
    if (newState.rippleColor !== undefined) {
      this.options.color = newState.rippleColor;
    }
    if (newState.rippleDuration !== undefined) {
      this.options.duration = newState.rippleDuration;
    }
    if (newState.rippleSize !== undefined) {
      this.options.size = newState.rippleSize;
    }
  }

  onClickStart(_target: Element) {
    if (!this.cursor || typeof window === 'undefined') return;

    const { x, y } = this.cursor.cursor;

    const ripple = document.createElement('div');
    const size = this.options.size!;
    const duration = this.options.duration!;

    ripple.style.position = 'absolute';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.backgroundColor = this.options.color!;
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.transition = `transform ${duration}ms linear, opacity ${duration}ms linear`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.zIndex = '999999';

    document.body.appendChild(ripple);

    // Trigger animation in next frame
    requestAnimationFrame(() => {
      ripple.style.transform = 'translate(-50%, -50%) scale(1)';
      ripple.style.opacity = '0';
    });

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
  }
}
