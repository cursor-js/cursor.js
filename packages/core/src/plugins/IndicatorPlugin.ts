import type { CursorPlugin } from './CursorPlugin';
import type { Cursor } from '../core/Cursor';

export interface IndicatorPluginOptions {
  color?: string;
  size?: number;
}

export class IndicatorPlugin implements CursorPlugin {
  public name = 'IndicatorPlugin';
  private indicator: HTMLDivElement | null = null;
  private cursorRef: Cursor | null = null;
  private options: IndicatorPluginOptions;

  constructor(options: IndicatorPluginOptions = {}) {
    this.options = {
      color: '#ff4757',
      size: 40,
      ...options,
    };
  }

  install(cursor: Cursor): void {
    this.cursorRef = cursor;

    this.indicator = document.createElement('div');
    this.indicator.style.cssText = `
      position: fixed;
      width: ${this.options.size}px; height: 6px;
      background: ${this.options.color};
      border-radius: 4px;
      pointer-events: none;
      z-index: 999998;
      opacity: 0;
      transition: opacity 0.2s, transform 0.1s linear;
      transform: translateX(-50%);
      box-shadow: 0 0 8px rgba(255, 71, 87, 0.6);
    `;
    document.body.appendChild(this.indicator);

    window.addEventListener('scroll', this.updateIndicator);
    window.addEventListener('resize', this.updateIndicator);

    // Initial update
    this.updateIndicator();
  }

  private updateIndicator = () => {
    if (!this.indicator || !this.cursorRef) return;

    // Calculate viewport relative positions
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const vHeight = window.innerHeight;
    const vWidth = window.innerWidth;

    const clientY = this.cursorRef.cursor.y - scrollY;
    const clientX = this.cursorRef.cursor.x - scrollX;

    let isVisible = false;

    if (clientY < 0) {
      // GhostCursor is above the viewport
      this.indicator.style.top = '6px';
      this.indicator.style.bottom = 'auto';
      this.indicator.style.left = `${Math.max(20, Math.min(vWidth - 20, clientX))}px`;
      isVisible = true;
    } else if (clientY > vHeight) {
      // GhostCursor is below the viewport
      this.indicator.style.top = 'auto';
      this.indicator.style.bottom = '6px';
      this.indicator.style.left = `${Math.max(20, Math.min(vWidth - 20, clientX))}px`;
      isVisible = true;
    }

    this.indicator.style.opacity = isVisible ? '1' : '0';
  };

  onMove(_x: number, _y: number): void {
    this.updateIndicator();
  }

  onDestroy(): void {
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }
    window.removeEventListener('scroll', this.updateIndicator);
    window.removeEventListener('resize', this.updateIndicator);
  }
}
