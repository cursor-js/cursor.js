import { GhostCursor } from "./core/GhostCursor";
import { EventDispatcher } from "./core/EventDispatcher";
import { generateHumanPath } from "./core/utils";

export interface CursorOptions {
  speed?: number; // 0 to 1
  humanize?: boolean; // Default true
  showIndicator?: boolean; // Out of bounds indicator
}

export class Cursor {
  private cursor: GhostCursor;
  private options: CursorOptions;
  private promise: Promise<void> = Promise.resolve();

  constructor(options: CursorOptions = {}) {
    this.options = {
      speed: 0.5,
      humanize: true,
      showIndicator: false,
      ...options,
    };
    this.cursor = new GhostCursor({ showIndicator: this.options.showIndicator });
  }

  private enqueue(task: () => Promise<void>): this {
    this.promise = this.promise.then(() => task());
    return this; // Allows chaining
  }

  then<TResult1 = void, TResult2 = never>(
    onfulfilled?:
      | ((value: void) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
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
    const element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;
    if (!element) throw new Error(`Element not found: ${selector}`);

    const rect = element.getBoundingClientRect();
    const targetX = rect.left + window.scrollX + rect.width / 2;
    const targetY = rect.top + window.scrollY + rect.height / 2;

    if (
      rect.top < 0 ||
      rect.bottom > window.innerHeight ||
      rect.left < 0 ||
      rect.right > window.innerWidth
    ) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
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
    EventDispatcher.triggerMouseEvent(element, "mouseenter");
  }

  // 2. Click command
  click(selector: string | Element): this {
    return this.enqueue(async () => {
      await this._click(selector);
    });
  }

  private async _click(selector: string | Element) {
    const element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;
    if (!element) throw new Error(`Element not found: ${selector}`);

    await this._hover(element);
    EventDispatcher.click(element as HTMLElement);
  }

  // 3. Type command
  type(
    selector: string | Element,
    text: string,
    options?: { delay?: number },
  ): this {
    return this.enqueue(async () => {
      const element =
        typeof selector === "string"
          ? document.querySelector(selector)
          : selector;
      if (!element) throw new Error(`Element not found: ${selector}`);

      await this._click(element);

      // Typing simulation
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        const delay = options?.delay || 100;
        for (let i = 0; i < text.length; i++) {
          EventDispatcher.triggerInputEvent(element, element.value + text[i]);
          await new Promise((r) =>
            setTimeout(r, delay / 2 + Math.random() * delay),
          ); // Human-like typing delay
        }
      }
    });
  }

  // Utilities
  wait(ms: number): this {
    return this.enqueue(
      () => new Promise((resolve) => setTimeout(resolve, ms)),
    );
  }

  private async moveGhostCursorTo(targetX: number, targetY: number) {
    if (this.options.humanize) {
      const points = generateHumanPath(
        this.cursor.x,
        this.cursor.y,
        targetX,
        targetY,
      );
      for (const point of points) {
        this.cursor.moveTo(point.x, point.y);
        await new Promise((r) => setTimeout(r, 16)); // Approx 60fps delay internally
      }
    } else {
      this.cursor.moveTo(targetX, targetY);
    }
  }

  destroy() {
    this.cursor.destroy();
  }
}
