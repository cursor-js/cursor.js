import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { IndicatorPlugin } from './IndicatorPlugin';
import { Cursor } from '../core/Cursor';

describe('IndicatorPlugin', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Mock window sizes and scroll for boundaries
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create an indicator element on install', () => {
    const plugin = new IndicatorPlugin();
    const cursor = new Cursor();
    
    plugin.install(cursor);
    
    // An indicator element should be appended to the body
    const indicatorEl = document.body.querySelector('div[style*="position: fixed"]');
    expect(indicatorEl).toBeTruthy();
    expect((indicatorEl as HTMLElement).style.backgroundColor).toBe('rgb(255, 71, 87)'); // #ff4757 computed
  });

  it('should show indicator when cursor moves out of top viewport bounds', () => {
    const plugin = new IndicatorPlugin();
    const cursor = new Cursor();
    plugin.install(cursor);
    
    const indicatorEl = document.body.querySelector('div[style*="position: fixed"]') as HTMLElement;
    
    // Simulate moving out of top boundary
    cursor.cursor.y = -100;
    cursor.cursor.x = 100;
    plugin.onMove(100, -100);
    
    expect(indicatorEl.style.opacity).toBe('1');
    expect(indicatorEl.style.top).toBe('6px');
  });

  it('should show indicator when cursor moves out of bottom viewport bounds', () => {
    const plugin = new IndicatorPlugin();
    const cursor = new Cursor();
    plugin.install(cursor);
    
    const indicatorEl = document.body.querySelector('div[style*="position: fixed"]') as HTMLElement;
    
    // Simulate moving out of bottom boundary
    cursor.cursor.y = 1500;
    cursor.cursor.x = 100;
    plugin.onMove(100, 1500);
    
    expect(indicatorEl.style.opacity).toBe('1');
    expect(indicatorEl.style.bottom).toBe('6px');
  });

  it('should clean up the element and event listeners on destroy', () => {
    const plugin = new IndicatorPlugin();
    const cursor = new Cursor();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    plugin.install(cursor);
    const indicatorEl = document.body.querySelector('div[style*="position: fixed"]');
    expect(document.body.contains(indicatorEl!)).toBe(true);
    
    plugin.onDestroy();
    
    expect(document.body.contains(indicatorEl!)).toBe(false);
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
