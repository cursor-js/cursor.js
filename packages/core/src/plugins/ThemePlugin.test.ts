import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Cursor } from '../core/Cursor';
import { ThemePlugin } from './ThemePlugin';

describe('ThemePlugin', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <button id="test-btn">Click me</button>
        <input id="test-input" type="text" />
      </div>
    `;

    // Mock document.elementFromPoint
    document.elementFromPoint = vi.fn((x, y) => {
      // Mock simple bounds just for cursor detection
      if (x > 10 && x < 50 && y > 10 && y < 50) return document.getElementById('test-input');
      if (x > 60 && x < 100 && y > 10 && y < 50) return document.getElementById('test-btn');
      return document.getElementById('container');
    });
    
    // JS dom might not have matchMedia or such? Let's just mock what's needed.
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('can be initialized with a theme pack', () => {
    const themePlugin = new ThemePlugin({
      default: { html: '<svg id="default-svg"></svg>' },
    });
    expect(themePlugin.name).toBe('ThemePlugin');
  });

  it('appends wrapper and default cursor svg when installed', () => {
    const themePlugin = new ThemePlugin({
      default: { html: '<svg id="default-svg"></svg>' },
    });
    const c = new Cursor();
    c.use(themePlugin);

    // GhostCursor should have our wrapper now
    const wrapper = c.cursor.el.querySelector('.cursor-theme-wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.innerHTML).toContain('default-svg');
    
    c.destroy();
  });

  it('changes state/theme cursor when requested via setState', async () => {
    const themePlugin = new ThemePlugin({
      default: { html: '<svg id="default-svg"></svg>' },
      text: { html: '<svg id="text-svg"></svg>', hotspot: 'center' },
    });
    const c = new Cursor();
    c.use(themePlugin);

    await c.setState({ theme: { cursor: 'text' } });

    const wrapper = c.cursor.el.querySelector('.cursor-theme-wrapper') as HTMLElement;
    expect(wrapper.innerHTML).toContain('text-svg');
    expect(wrapper.style.transform).toBe('translate(-50%, -50%)');

    c.destroy();
  });

  it('auto detects text inputs via elementFromPoint on move', async () => {
    const themePlugin = new ThemePlugin({
      default: { html: '<svg id="default-svg"></svg>' },
      text: { html: '<svg id="text-svg"></svg>' },
    }, { auto: true });
    
    const c = new Cursor();
    c.use(themePlugin);

    // move over input
    c.cursor.moveTo(30, 30);
    // Theme plugin hooks into onMove maybe, we can simulate move directly
    themePlugin.onMove?.(30, 30);

    // await cursor queue
    await c;

    const wrapper = c.cursor.el.querySelector('.cursor-theme-wrapper') as HTMLElement;
    expect(wrapper.innerHTML).toContain('text-svg');

    c.destroy();
  });
});