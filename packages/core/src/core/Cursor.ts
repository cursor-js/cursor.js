import { GhostCursor } from './GhostCursor';
import { EventDispatcher } from './EventDispatcher';
import { generateHumanPath } from './utils';
import type { CursorPlugin } from '../plugins/CursorPlugin';

export interface CursorOptions {
  speed?: number; // 0 to 1
  humanize?: boolean; // Default true
}

export class Cursor {
  public cursor: GhostCursor;
  public state: Record<string, any> = {};
  private options: CursorOptions;
  private promise: Promise<void> = Promise.resolve();
  private plugins: CursorPlugin[] = [];
  private isPaused = false;
  private nextResolver: (() => void) | null = null;

  constructor(options: CursorOptions = {}) {
    this.options = {
      speed: 0.5,
      humanize: true,
      ...options,
    };
    this.cursor = new GhostCursor();
  }

  setConfig(newOptions: Partial<CursorOptions>): this {
    this.options = { ...this.options, ...newOptions };
    return this;
  }

  use(plugin: CursorPlugin): this {
    this.plugins.push(plugin);
    plugin.install(this);
    return this;
  }

  removePlugin(name: string): this {
    const index = this.plugins.findIndex((p) => p.name === name);
    if (index !== -1) {
      this.plugins[index].onDestroy?.();
      this.plugins.splice(index, 1);
    }
    return this;
  }

  removePlugin(name: string): this {
    const index = this.plugins.findIndex((p) => p.name === name);
    if (index !== -1) {
      this.plugins[index].onDestroy?.();
      this.plugins.splice(index, 1);
    }
    return this;
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

  // 1. Hover command
  hover(selector: string | Element): this {
    return this.enqueue(async () => {
      await this._hover(selector);
    });
  }

  private async _hover(selector: string | Element) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) throw new Error(`Element not found: ${selector}`);

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
      await new Promise((r) => setTimeout(r, 500));
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

    this.plugins.forEach((p) => p.onClickStart?.(element));

    await this._hover(element);
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
        for (let i = 0; i < text.length; i++) {
          EventDispatcher.triggerInputEvent(element, element.value + text[i]);
          await new Promise((r) => setTimeout(r, delay / 2 + Math.random() * delay)); // Human-like typing delay
        }
      }
    });
  }

  // Utilities
  wait(ms: number): this {
    return this.enqueue(() => new Promise((resolve) => setTimeout(resolve, ms)));
  }

  // Flow Control Methods
  pause(): this {
    return this.enqueue(() => {
      this.isPaused = true;
      return new Promise<void>((resolve) => {
        this.nextResolver = resolve;
      });
    });
  }

  stop(): this {
    return this.pause();
  }

  next(): void {
    if (this.isPaused && this.nextResolver) {
      this.isPaused = false;
      this.nextResolver();
      this.nextResolver = null;
    }
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

          await new Promise((r) => setTimeout(r, 0));
          await checkAndRun();
        }
      };
      await checkAndRun();
    });
  }

  setSize(scale: number): this {
    return this.enqueue(async () => {
      this.cursor.setSize(scale);
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
        await new Promise((r) => setTimeout(r, 16 / speedMultiplier)); // Speed-adjusted delay internally
      }
    } else {
      this.cursor.moveTo(targetX, targetY);
      this.plugins.forEach((p) => p.onMove?.(targetX, targetY));
    }
  }

  destroy() {
    this.plugins.forEach((p) => p.onDestroy?.());
    this.cursor.destroy();
  }

  setState(newState: Record<string, any>): this {
    return this.do(async () => {
      const oldState = { ...this.state };
      this.state = { ...this.state, ...newState };

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
