import type { CursorPlugin } from './CursorPlugin';
import type { Cursor } from '../core/Cursor';

export interface ThemeCursorItem {
  html: string;
  hotspot?: { x: number; y: number } | 'center' | 'top-left';
  onStateChange?: (wrapperEl: HTMLElement, state: Record<string, any>) => void;
}

export type ThemePack = Record<string, ThemeCursorItem>;

export interface ThemePluginOptions {
  auto?: boolean; // Default true
}

export const defaultTheme: ThemePack = {
  default: {
    html: `<svg width="24" height="24" viewBox="-1 -1 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0 L 13 13 H 5 L 1.5 18 L 0 0 Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`,
    hotspot: 'top-left',
  },
  pointer: {
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="cursor-pointer" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11v-5a3 3 0 0 1 6 0v2" stroke="black" stroke-width="2" stroke-linecap="round"/>
      <path d="M15 8v2a3 3 0 0 1 6 0v5a7 7 0 0 1-14 0v-4" stroke="black" stroke-width="2" stroke-linecap="round"/>
    </svg>`, // Not the exact windows pointer, but a placeholder SVG
  },
  text: {
    html: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16m-4-16h8m-8 16h8" stroke="black" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    hotspot: 'center',
  },
};

export class ThemePlugin implements CursorPlugin {
  public name = 'ThemePlugin';
  private cursorRef: Cursor | null = null;
  private wrapper: HTMLDivElement | null = null;
  private themePack: ThemePack;
  private options: ThemePluginOptions;
  private currentCursorType: string = 'default';
  private lastElement: Element | null = null;

  constructor(themePack: ThemePack = defaultTheme, options: ThemePluginOptions = {}) {
    this.themePack = themePack;
    this.options = { auto: true, ...options };
  }

  install(cursor: Cursor): void {
    this.cursorRef = cursor;
    
    // Clear GhostCursor default inner HTML if it has the default SVG
    if (this.cursorRef.cursor.el) {
      const el = this.cursorRef.cursor.el;
      el.innerHTML = '';
      el.style.width = '0px';
      el.style.height = '0px';
      el.style.margin = '0px';
      el.style.background = 'transparent';
      
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'cursor-theme-wrapper';
      this.wrapper.style.position = 'absolute';
      this.wrapper.style.top = '0';
      this.wrapper.style.left = '0';
      
      this.cursorRef.cursor.el.appendChild(this.wrapper);
    }

    this.renderCursor('default');
  }

  private renderCursor(type: string): void {
    if (!this.wrapper) return;
    
    const themeItem = this.themePack[type] || this.themePack.default;
    if (!themeItem) return;

    this.wrapper.innerHTML = themeItem.html;
    this.currentCursorType = type;

    if (themeItem.hotspot === 'center') {
      this.wrapper.style.transform = 'translate(-50%, -50%)';
    } else if (themeItem.hotspot === 'top-left' || !themeItem.hotspot) {
      this.wrapper.style.transform = 'translate(0, 0)';
    } else if (typeof themeItem.hotspot === 'object') {
      this.wrapper.style.transform = `translate(-${themeItem.hotspot.x}px, -${themeItem.hotspot.y}px)`;
    }

    // Run initial state change if needed
    if (themeItem.onStateChange && this.cursorRef) {
      themeItem.onStateChange(this.wrapper, this.cursorRef.state);
    }
  }

  onStateChange(newState: Record<string, any>, _oldState: Record<string, any>): void {
    if (newState.theme && typeof newState.theme.cursor === 'string') {
      if (newState.theme.cursor !== this.currentCursorType) {
        this.renderCursor(newState.theme.cursor);
      }
    }

    // Call customized state lifecycle on the element wrapper
    if (this.wrapper) {
      const themeItem = this.themePack[this.currentCursorType];
      // Attribute binding for simple CSS animations
      // Flat properties on state
      for (const [key, value] of Object.entries(newState)) {
        if (typeof value === 'boolean') {
          this.wrapper.setAttribute(`data-cursor-${key}`, value.toString());
        }
      }
      
      if (themeItem && themeItem.onStateChange) {
        themeItem.onStateChange(this.wrapper, newState);
      }
    }
  }

  onMove(x: number, y: number): void {
    if (!this.options.auto || !this.cursorRef || typeof document === 'undefined') return;

    // Detect element
    try {
      // Need viewport coordinates
      const clientX = x - window.scrollX;
      const clientY = y - window.scrollY;
      
      // Temporarily hide wrapper so elementFromPoint works correctly underneath it
      if (this.wrapper) this.wrapper.style.pointerEvents = 'none';

      const element = document.elementFromPoint(clientX, clientY);
      
      if (element && element !== this.lastElement) {
        this.lastElement = element;
        this.autoDetectCursor(element);
      }
    } catch (e) {
      // ignore
    }
  }

  private autoDetectCursor(element: Element): void {
    if (!this.cursorRef) return;
    
    // Simplistic heuristic, could use getComputedStyle
    const tag = element.tagName.toLowerCase();
    const style = window.getComputedStyle(element);
    const cssCursor = style.cursor;

    let targetCursor = 'default';

    if (cssCursor === 'pointer' || tag === 'a' || tag === 'button') {
      targetCursor = 'pointer';
    } else if (tag === 'input' || tag === 'textarea' || (element as HTMLElement).isContentEditable) {
      // Ignore some inputs
      if (tag === 'input') {
        const type = (element as HTMLInputElement).type;
        if (['button', 'submit', 'checkbox', 'radio', 'color', 'file'].includes(type)) {
          targetCursor = 'pointer';
        } else {
          targetCursor = 'text';
        }
      } else {
        targetCursor = 'text';
      }
    } else {
       targetCursor = 'default';
    }

    // Only update if it targets something that exists in theme explicitly,
    // or if we just want to fallback.
    this.cursorRef.setState({ theme: { cursor: targetCursor } });
  }

  onDestroy(): void {
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}
