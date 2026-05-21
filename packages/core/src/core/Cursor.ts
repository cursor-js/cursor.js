import { GhostCursor } from './GhostCursor';
import { EventDispatcher } from './EventDispatcher';
import { generateHumanPath } from './utils';
import type { CursorPlugin } from '../plugins/CursorPlugin';

export type CursorEvent = 'pause' | 'play' | 'destroy' | string;
export type EventCallback = (...args: any[]) => void;
export type CursorStartPoint = { x: number; y: number } | Element | string;

export interface CursorOptions {
  speed?: number; // 0 to 1
  humanize?: boolean; // Default true
  size?: number; // Cursor scale size default 1
  startPoint?: CursorStartPoint;
}

export class Cursor {
  public cursor: GhostCursor;
  public state: Record<string, any> = {};
  private options: CursorOptions;
  private promise: Promise<void> = Promise.resolve();
  private plugins: CursorPlugin[] = [];
  public isGlobalPaused = false;
  private activeDelayResolvers = new Set<() => void>();
  private currentHoveredElement: Element | null = null;
  private listeners: Record<string, EventCallback[]> = {};

  constructor(options: CursorOptions = {}) {
    this.options = {
      speed: 0.5,
      humanize: true,
      size: 1,
      ...options,
    };
    const { startPoint, ...stateOptions } = this.options;
    this.state = { ...stateOptions }; // Initialize state with serializable runtime options
    const initialPosition = this.resolveInitialPosition(startPoint);
    this.cursor = new GhostCursor({
      initialX: initialPosition.x,
      initialY: initialPosition.y,
    });

    if (this.options.size !== undefined) {
      this.cursor.setSize(this.options.size);
    }
  }

  use(plugin: CursorPlugin): this {
    this.plugins.push(plugin);
    plugin.install(this);
    return this;
  }

  getPlugin(name: string): CursorPlugin | undefined {
    return this.plugins.find((p) => p.name === name);
  }

  removePlugin(name: string): this {
    const index = this.plugins.findIndex((p) => p.name === name);
    if (index !== -1) {
      this.plugins[index].onDestroy?.();
      this.plugins.splice(index, 1);
    }
    return this;
  }

  public addStep(task: () => Promise<void>): this {
    return this.enqueue(task);
  }

  private enqueue(task: () => Promise<void>): this {
    this.promise = this.promise.then(() => task());
    return this; // Allows chaining
  }

  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  private async delay(ms: number) {
    if (ms <= 0) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0); // JSDOM might hang on requestAnimationFrame
      });
      return;
    }
    return new Promise<void>((resolve) => {
      let start = performance.now();
      let elapsed = 0;

      this.activeDelayResolvers.add(resolve);

      const loop = () => {
        if (!this.activeDelayResolvers.has(resolve)) return; // Means skipped/aborted

        const current = performance.now();
        const delta = current - start;
        start = current;

        if (!this.isGlobalPaused) {
          elapsed += delta;
        }

        if (elapsed >= ms) {
          this.activeDelayResolvers.delete(resolve);
          resolve();
        } else {
          // Use setTimeout as a fallback in non-browser environments like tests
          if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            window.requestAnimationFrame(loop);
          } else {
            setTimeout(loop, 16);
          }
        }
      };

      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(loop);
      } else {
        setTimeout(loop, 16);
      }
    });
  }

  private resolveInitialPosition(startPoint?: CursorStartPoint): { x: number; y: number } {
    if (startPoint && typeof startPoint === 'object' && 'x' in startPoint && 'y' in startPoint) {
      return startPoint;
    }

    const element =
      typeof startPoint === 'string'
        ? document.querySelector(startPoint)
        : startPoint instanceof Element
          ? startPoint
          : null;

    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY + rect.height / 2,
      };
    }

    return {
      x: window.scrollX + window.innerWidth / 2,
      y: window.scrollY + window.innerHeight / 2,
    };
  }

  // 1. Hover command
  hover(selector: string | Element): this {
    return this.enqueue(async () => {
      await this._hover(selector);
    });
  }

  private async _hover(selector: string | Element) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) throw new Error(`Element not found: ${selector}`);

    if (this.currentHoveredElement && this.currentHoveredElement !== element) {
      EventDispatcher.toggleMimicHover(this.currentHoveredElement, false);
      EventDispatcher.triggerMouseEvent(this.currentHoveredElement, 'mouseleave');
    }

    this.currentHoveredElement = element;

    this.plugins.forEach((p) => p.onHoverStart?.(element));

    const rect = element.getBoundingClientRect();
    const targetX = rect.left + window.scrollX + rect.width / 2;
    const targetY = rect.top + window.scrollY + rect.height / 2;

    if (
      rect.top < 0 ||
      rect.bottom > window.innerHeight ||
      rect.left < 0 ||
      rect.right > window.innerWidth
    ) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.delay(500);
      const newRect = element.getBoundingClientRect();
      await this.moveGhostCursorTo(
        newRect.left + window.scrollX + newRect.width / 2,
        newRect.top + window.scrollY + newRect.height / 2,
      );
    } else {
      await this.moveGhostCursorTo(targetX, targetY);
    }

    EventDispatcher.toggleMimicHover(element, true);
    EventDispatcher.triggerMouseEvent(element, 'mouseenter');

    // Simulate mouseleave and revert to default state logically when focus is done
    // But since it's a script sequence, we just wait a tiny bit to give the user time
    // and let the next action trigger elements.
    // To restore the default cursor, we trigger an empty state update since ThemePlugin resets on 'default'
    // Usually hover stays until next move. If they want default instantly after it finishes:
    // Actually, in auto mode, it should be naturally handled if we reset state when moving away.
    // Let's explicitly trigger a mouseleave from the previous element if we had one.
    // However, the cleanest way to revert to default is to let the user chain a `move(x,y)` out.
  }

  // 2. Click command
  click(selector: string | Element): this {
    return this.enqueue(async () => {
      await this._click(selector);
    });
  }

  private async _click(selector: string | Element) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) throw new Error(`Element not found: ${selector}`);

    await this._hover(element);
    this.plugins.forEach((p) => p.onClickStart?.(element));

    // Give browser a tiny frame window to start rendering visual click
    // effects (like ripple or particles) before synchronously taking focus
    await this.delay(300);

    EventDispatcher.click(element as HTMLElement);
  }

  // 3. Type command
  type(selector: string | Element, text: string, options?: { delay?: number }): this {
    return this.enqueue(async () => {
      const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!element) throw new Error(`Element not found: ${selector}`);

      await this._click(element);

      this.plugins.forEach((p) => p.onTypeStart?.(text));

      // Typing simulation
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        const delay = options?.delay || 100;
        await this.delay(delay * 2 + Math.random() * delay); // Initial hesitation before starting to type
        let currentText = element.value; // Cache value to avoid React state sync issues during pauses
        for (let i = 0; i < text.length; i++) {
          currentText += text[i];
          EventDispatcher.triggerInputEvent(element, currentText);
          await this.delay(delay / 2 + Math.random() * delay); // Human-like typing delay
        }
      }

      this.plugins.forEach((p) => p.onTypeEnd?.());
    });
  }

  // Utilities
  wait(ms: number): this {
    return this.enqueue(() => this.delay(ms));
  }

  // Flow Control Methods
  pause(): this {
    this.isGlobalPaused = true;
    this.emit('pause');
    this.plugins.forEach((p) => p.onPause?.());
    return this;
  }

  play(): this {
    this.isGlobalPaused = false;
    this.emit('play');
    this.plugins.forEach((p) => p.onResume?.());
    return this;
  }

  stop(): this {
    return this.pause();
  }

  next(): this {
    // Skip current delays/actions if any
    for (const resolve of this.activeDelayResolvers) {
      resolve(); // Advance immediately
    }
    this.activeDelayResolvers.clear();

    // Also resume playing
    this.play();
    return this;
  }

  waitForEvent(selector: string | Element, eventName: string): this {
    return this.enqueue(() => {
      return new Promise<void>((resolve) => {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;

        if (!element) {
          console.warn(`Element not found for waitForEvent: ${selector}`);
          resolve();
          return;
        }

        const handler = () => {
          element.removeEventListener(eventName, handler);
          resolve();
        };

        element.addEventListener(eventName, handler);
      });
    });
  }

  do(actionFn: (cursor: this) => void): this {
    return this.enqueue(async () => {
      const subQueue: (() => Promise<void>)[] = [];
      const originalEnqueue = this.enqueue;

      // Override enqueue temporarily to push to subQueue
      this.enqueue = (task: () => Promise<void>): this => {
        subQueue.push(task);
        return this;
      };

      try {
        actionFn(this);
        for (const task of subQueue) {
          await task();
        }
      } finally {
        this.enqueue = originalEnqueue; // Restore
      }
    });
  }

  if(conditionFn: () => boolean, actionFn: (cursor: this) => void): this {
    return this.enqueue(async () => {
      if (conditionFn()) {
        const subQueue: (() => Promise<void>)[] = [];
        const originalEnqueue = this.enqueue;

        this.enqueue = (task: () => Promise<void>): this => {
          subQueue.push(task);
          return this;
        };

        try {
          actionFn(this);
          for (const task of subQueue) {
            await task();
          }
        } finally {
          this.enqueue = originalEnqueue;
        }
      }
    });
  }

  until(conditionFn: () => boolean, actionFn: (cursor: this) => void): this {
    return this.enqueue(async () => {
      const checkAndRun = async (): Promise<void> => {
        if (!conditionFn()) {
          const subQueue: (() => Promise<void>)[] = [];
          const originalEnqueue = this.enqueue;

          this.enqueue = (task: () => Promise<void>): this => {
            subQueue.push(task);
            return this;
          };

          try {
            actionFn(this);
            for (const task of subQueue) {
              await task();
            }
          } finally {
            this.enqueue = originalEnqueue;
          }

          await this.delay(0);
          await checkAndRun();
        }
      };
      await checkAndRun();
    });
  }

  move(selectorOrX: string | Element | number, y?: number): this {
    return this.enqueue(async () => {
      let targetX: number;
      let targetY: number;

      if (typeof selectorOrX === 'number' && typeof y === 'number') {
        targetX = selectorOrX;
        targetY = y;
      } else {
        const element =
          typeof selectorOrX === 'string' ? document.querySelector(selectorOrX) : selectorOrX;
        if (!element || !(element instanceof Element))
          throw new Error(`Element not found: ${selectorOrX}`);

        const rect = element.getBoundingClientRect();
        targetX = rect.left + window.scrollX + rect.width / 2;
        targetY = rect.top + window.scrollY + rect.height / 2;
      }

      this.cursor.moveTo(targetX, targetY);
      this.plugins.forEach((p) => p.onMove?.(targetX, targetY));

      // Remove hover state logically from the previous element if any
      // Since move is explicit coordinates and not a physical element, we can force a generic move reset
      if (this.currentHoveredElement) {
        EventDispatcher.toggleMimicHover(this.currentHoveredElement, false);
        EventDispatcher.triggerMouseEvent(this.currentHoveredElement, 'mouseleave');
        this.currentHoveredElement = null;
      }
    });
  }

  private async moveGhostCursorTo(targetX: number, targetY: number) {
    this.plugins.forEach((p) => p.onMoveStart?.(targetX, targetY));

    const speedMultiplier = this.options.speed ?? 0.5;

    if (this.options.humanize) {
      const points = generateHumanPath(this.cursor.x, this.cursor.y, targetX, targetY);
      for (const point of points) {
        this.cursor.moveTo(point.x, point.y);
        this.plugins.forEach((p) => p.onMove?.(point.x, point.y));
        await this.delay(16 / speedMultiplier); // Speed-adjusted delay internally
      }
    } else {
      this.cursor.moveTo(targetX, targetY);
      this.plugins.forEach((p) => p.onMove?.(targetX, targetY));
    }
  }

  destroy() {
    this.emit('destroy');
    this.plugins.forEach((p) => p.onDestroy?.());
    this.cursor.destroy();
  }

  // Events
  on(event: CursorEvent, callback: EventCallback): this {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this;
  }

  off(event: CursorEvent, callback: EventCallback): this {
    if (!this.listeners[event]) return this;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    return this;
  }

  public async emitAsync(event: CursorEvent, ...args: any[]): Promise<void> {
    if (this.listeners[event]) {
      await Promise.all(this.listeners[event].map((cb) => cb(...args)));
    }
  }

  public emit(event: CursorEvent, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(...args));
    }
  }

  setState(newState: Record<string, any>): this {
    return this.do(async () => {
      const oldState = { ...this.state };
      this.state = { ...this.state, ...newState };

      if (newState.speed !== undefined) {
        this.options.speed = newState.speed;
      }
      if (newState.humanize !== undefined) {
        this.options.humanize = newState.humanize;
      }
      if (newState.size !== undefined) {
        this.cursor.setSize(newState.size);
      }

      for (const plugin of this.plugins) {
        if (plugin.onStateChange) {
          plugin.onStateChange(this.state, oldState);
        }
      }
    });
  }
}
