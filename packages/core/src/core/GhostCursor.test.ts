import { describe, it, expect, beforeEach } from 'vitest';
import { GhostCursor } from './GhostCursor';

describe('GhostCursor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('creates DOM elements and SVGs on init', () => {
    const cursor = new GhostCursor();
    expect(cursor.el).toBeTruthy();
    expect(cursor.el.tagName).toBe('DIV');
    expect(document.body.contains(cursor.el)).toBe(true);
  });

  it('moves cursor to relative absolute coordinates', () => {
    const cursor = new GhostCursor();
    cursor.moveTo(100, 200);

    expect(cursor.x).toBe(100);
    expect(cursor.y).toBe(200);
    // Absolute position check
    expect(cursor.el.style.transform).toBe('translate(100px, 200px) scale(1)'); 
  });

  it('can scale the cursor size', () => {
    const cursor = new GhostCursor();
    cursor.setSize(2.5);
    cursor.moveTo(100, 200);

    expect(cursor.el.style.transform).toBe('translate(100px, 200px) scale(2.5)');
    expect(cursor.scale).toBe(2.5);
  });

  it('removes elements on destroy', () => {        
    const cursor = new GhostCursor();

    cursor.destroy();

    expect(document.body.contains(cursor.el)).toBe(false);
  });
});
