import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RipplePlugin } from './RipplePlugin';
import { Cursor } from '../core/Cursor';

describe('RipplePlugin', () => {
  let plugin: RipplePlugin;
  let cursor: Cursor;

  beforeEach(() => {
    document.body.innerHTML = '';
    plugin = new RipplePlugin({
      color: 'rgba(255, 0, 0, 0.5)',
      duration: 500,
      size: 100,
    });
    cursor = new Cursor();
    plugin.install(cursor);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('should create a ripple element on click start', () => {
    const target = document.createElement('button');
    document.body.appendChild(target);

    // Mock getBoundingClientRect
    target.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 40,
      top: 10,
      left: 20,
      bottom: 50,
      right: 120,
      x: 20,
      y: 10,
      toJSON: () => {},
    }));

    cursor.cursor.x = 50;
    cursor.cursor.y = 30;

    plugin.onClickStart(target);

    const ripple = document.body.querySelector('div[style*="border-radius: 50%"]');
    expect(ripple).toBeTruthy();
    if (ripple instanceof HTMLElement) {
      expect(ripple.style.backgroundColor).toBe('rgba(255, 0, 0, 0.5)');
      expect(ripple.style.width).toBe('100px');
      expect(ripple.style.height).toBe('100px');
      expect(ripple.style.position).toBe('absolute');
    }
  });

  it('should remove the ripple element after duration', async () => {
    vi.useFakeTimers();

    const target = document.createElement('button');
    document.body.appendChild(target);

    cursor.cursor.x = 50;
    cursor.cursor.y = 30;

    plugin.onClickStart(target);

    let ripple = document.body.querySelector('div[style*="border-radius: 50%"]');
    expect(ripple).toBeTruthy();

    vi.advanceTimersByTime(550);

    ripple = document.body.querySelector('div[style*="border-radius: 50%"]');
    expect(ripple).toBeNull();

    vi.useRealTimers();
  });
});
