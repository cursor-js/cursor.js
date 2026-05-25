import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Cursor } from '../core/Cursor';
import { SayPlugin } from './SayPlugin';

class FloatingProviderPlugin {
  name = 'floating';
  private positioner: any;
  constructor(positioner: any) {
    this.positioner = positioner;
  }
  install() {}
  getSayPositioner() {
    return this.positioner;
  }
}

describe('SayPlugin', () => {
  let cursor: Cursor;
  let rectSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    cursor = new Cursor();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cursor.destroy();
    rectSpy?.mockRestore();
  });

  it('should add say method to cursor', () => {
    cursor.use(new SayPlugin());
    expect(typeof (cursor as any).say).toBe('function');
  });

  it('should create a speech bubble when say is called', async () => {
    cursor.use(new SayPlugin());

    (cursor as any).say('Hello world', { duration: 50 }); // Reduce duration for test

    // Wait a bit for DOM update
    await new Promise((resolve) => setTimeout(resolve, 30));

    const bubble = document.querySelector('.cursor-js-speech-bubble');
    expect(bubble).not.toBeNull();
    expect(bubble?.textContent).toBe('Hello world');

    // Wait for the cursor queue to finish and the bubble to fade out
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  it('removes the previous bubble when a new say call starts', async () => {
    cursor.use(new SayPlugin());

    cursor.say('First line', { duration: 10_000 }).say('Second line', { duration: 50 });
    await cursor;

    const bubbles = Array.from(document.querySelectorAll('.cursor-js-speech-bubble'));

    expect(bubbles).toHaveLength(1);
    expect(bubbles[0].textContent).toBe('Second line');
  });

  it('keeps cursor speech bubbles inside the viewport', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 240 });
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });

    cursor.cursor.el.getBoundingClientRect = () =>
      ({
        left: 300,
        top: 220,
        right: 320,
        bottom: 240,
        width: 20,
        height: 20,
        x: 300,
        y: 220,
        toJSON: () => {},
      }) as DOMRect;

    rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('cursor-js-speech-bubble')) {
        return {
          left: 0,
          top: 0,
          right: 140,
          bottom: 48,
          width: 140,
          height: 48,
          x: 0,
          y: 0,
          toJSON: () => {},
        } as DOMRect;
      }

      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect;
    });

    cursor.use(new SayPlugin());
    cursor.say('Near the edge', { duration: 1000 });
    await cursor;

    const bubble = document.querySelector<HTMLElement>('.cursor-js-speech-bubble');
    expect(bubble).not.toBeNull();
    expect(Number.parseFloat(bubble?.style.left || '0')).toBeLessThanOrEqual(172);
    expect(Number.parseFloat(bubble?.style.top || '0')).toBeLessThanOrEqual(184);
  });

  it('uses a custom positioner when one is provided', async () => {
    const cleanup = vi.fn();
    const positioner = vi.fn(({ bubbleElement }) => {
      bubbleElement.style.left = '12px';
      bubbleElement.style.top = '34px';
      return cleanup;
    });

    cursor.use(new SayPlugin({ positioner }));
    cursor.say('Custom position', { duration: 1, waitUntilFinished: true });
    await cursor;

    expect(positioner).toHaveBeenCalledOnce();
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('uses the floating provider positioner when installed', async () => {
    const cleanup = vi.fn();
    const positioner = vi.fn(({ bubbleElement }) => {
      bubbleElement.style.left = '56px';
      bubbleElement.style.top = '78px';
      return cleanup;
    });

    cursor.use(new FloatingProviderPlugin(positioner) as any);
    cursor.use(new SayPlugin());
    cursor.say('Floating provider', { duration: 1, waitUntilFinished: true });
    await cursor;

    expect(positioner).toHaveBeenCalledOnce();
    expect(cleanup).toHaveBeenCalledOnce();
  });
});
