import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GhostCursor } from './GhostCursor';

describe('GhostCursor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('creates DOM elements and SVGs on init', () => {
    const cursor = new GhostCursor();
    expect(cursor.el).toBeTruthy();
    expect(cursor.el.tagName).toBe('DIV');
    expect(cursor.indicator.tagName).toBe('DIV');
    expect(document.body.contains(cursor.el)).toBe(true);
    expect(document.body.contains(cursor.indicator)).toBe(true);
  });

  it('moves cursor to relative absolute coordinates', () => {
    const cursor = new GhostCursor();
    cursor.moveTo(100, 200);

    expect(cursor.x).toBe(100);
    expect(cursor.y).toBe(200);
    // Absolute position check
    expect(cursor.el.style.transform).toBe('translate(100px, 200px)');
  });

  it('shows out-of-bounds indicator strictly when out of viewport', () => {
    // Override window innerHeight for jsdom
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      writable: true,
    });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

    const cursor = new GhostCursor({ showIndicator: true });

    // In viewport
    cursor.moveTo(100, 200);
    expect(cursor.indicator.style.opacity).toBe('0');

    // Out of bounds - Bottom
    cursor.moveTo(100, 1500);
    expect(cursor.indicator.style.opacity).toBe('1');
    expect(cursor.indicator.style.bottom).toBe('6px');
    expect(cursor.indicator.style.top).toBe('auto');

    // Out of bounds - Top
    cursor.moveTo(100, -200);
    expect(cursor.indicator.style.opacity).toBe('1');
    expect(cursor.indicator.style.top).toBe('6px');
    expect(cursor.indicator.style.bottom).toBe('auto');

    cursor.destroy();
  });

  it('removes elements and unmounts event listeners on destroy', () => {
    const cursor = new GhostCursor();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    cursor.destroy();

    expect(document.body.contains(cursor.el)).toBe(false);
    expect(document.body.contains(cursor.indicator)).toBe(false);
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
