import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Cursor } from './Cursor';

describe('Cursor', () => {
  let btn: HTMLButtonElement;
  let input: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="test-btn">Click me</button>
      <input id="test-input" type="text" />
    `;
    btn = document.getElementById('test-btn') as HTMLButtonElement;
    input = document.getElementById('test-input') as HTMLInputElement;

    // Mock functions for jsdom since it doesn't implement layout rendering properly
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 50,
      top: 100,
      left: 100,
      bottom: 150,
      right: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));

    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, 'innerWidth', {
      value: 1000,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
    });
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('can be instantiated', () => {
    const actor = new Cursor();
    expect(actor).toBeInstanceOf(Cursor);
  });

  it('starts at the viewport center when no startPoint is provided', () => {
    const actor = new Cursor();

    expect(actor.cursor.x).toBe(500);
    expect(actor.cursor.y).toBe(400);
  });

  it('accepts startPoint coordinates, elements, and selectors', () => {
    const fromCoordinates = new Cursor({
      startPoint: { x: 10, y: 20 },
    });
    expect(fromCoordinates.cursor.x).toBe(10);
    expect(fromCoordinates.cursor.y).toBe(20);

    const fromElement = new Cursor({
      startPoint: btn,
    });
    expect(fromElement.cursor.x).toBe(150);
    expect(fromElement.cursor.y).toBe(125);

    const fromSelector = new Cursor({
      startPoint: '#test-btn',
    });
    expect(fromSelector.cursor.x).toBe(150);
    expect(fromSelector.cursor.y).toBe(125);
  });

  it('falls back to the viewport center when a selector startPoint is missing', () => {
    const actor = new Cursor({
      startPoint: '#missing',
    });

    expect(actor.cursor.x).toBe(500);
    expect(actor.cursor.y).toBe(400);
  });

  it('chains and resolves hover promise successfully', async () => {
    const actor = new Cursor({ humanize: false, speed: 1.0 }); // Fast for tests
    let hovered = false;
    btn.addEventListener('mouseenter', () => (hovered = true));

    await actor.hover('#test-btn');

    expect(hovered).toBe(true);
    expect(btn.classList.contains('actor-hover')).toBe(true);
  });

  it('chains and resolves click promise successfully', async () => {
    const actor = new Cursor({ humanize: false, speed: 1.0 });
    let clicked = false;
    btn.addEventListener('click', () => (clicked = true));

    await actor.click('#test-btn');

    expect(clicked).toBe(true);
  });

  it('types recursively using simulated events', async () => {
    const actor = new Cursor({ humanize: false, speed: 1.0 });
    const delaySpy = vi.spyOn(window, 'setTimeout');

    await actor.type('#test-input', 'Hello', { delay: 10 }); // Fast typing parameter

    expect(input.value).toBe('Hello');
    expect(delaySpy).toHaveBeenCalled(); // Since it has delays between keystrokes
  });

  it('can set cursor size and teleport with move', async () => {
    const actor = new Cursor({ humanize: false });

    await actor.setState({ size: 5 }).move(300, 400);

    expect(actor.cursor.scale).toBe(5);
    expect(actor.cursor.x).toBe(300);
    expect(actor.cursor.y).toBe(400);

    // Can change size over element
    await actor.move('#test-btn').setState({ size: 1 });

    expect(actor.cursor.scale).toBe(1);
    expect(actor.cursor.x).toBe(150); // width:100, x:100 => 100 + 100/2
    expect(actor.cursor.y).toBe(125); // height:50, y:100 => 100 + 50/2
  });

  it('supports chaining API through Promise resolve sequence', async () => {
    const actor = new Cursor({ humanize: false, speed: 1.0 });
    let clickCount = 0;

    btn.addEventListener('click', () => clickCount++);

    await actor.hover('#test-btn').wait(10).click('#test-btn').wait(10).click('#test-btn');

    expect(clickCount).toBe(2);
  });

  it('throws when target element is not found', async () => {
    const actor = new Cursor();

    await expect(actor.hover('#non-existing')).rejects.toThrow('Element not found');
  });

  describe('Flow Control', () => {
    it('.do() executes custom async function in queue', async () => {
      const actor = new Cursor({ humanize: false });
      let counter = 0;

      await actor
        .wait(10)
        .do(async (c) => {
          expect(c).toBe(actor);
          counter++;
          await new Promise((r) => setTimeout(r, 10));
        })
        .wait(10);

      expect(counter).toBe(1);
    });

    it('.if() executes actions only if condition is true', async () => {
      const actor = new Cursor({ humanize: false });
      let clicked = 0;
      btn.addEventListener('click', () => clicked++);

      await actor
        .if(
          () => false,
          (c) => c.click('#test-btn'),
        )
        .if(
          () => true,
          (c) => c.click('#test-btn'),
        )
        .wait(10);

      expect(clicked).toBe(1);
    });

    it('.until() loops condition and applies action when false', async () => {
      const actor = new Cursor({ humanize: false });
      let state = 0;
      let clicked = 0;

      btn.addEventListener('click', () => {
        clicked++;
        state++;
      });

      await actor
        .until(
          () => state >= 3,
          (c) => c.click('#test-btn').wait(5),
        )
        .wait(10);

      expect(state).toBe(3);
      expect(clicked).toBe(3);
    });

    it('.pause() immediately halts execution in realtime, .play() resumes, .next() jumps current delay', async () => {
      const actor = new Cursor({ humanize: false });
      let counter = 0;

      actor
        .do(() => counter++)
        .wait(100)
        .do(() => counter++)
        .wait(100)
        .do(() => counter++);

      // Let first step run
      await new Promise((r) => setTimeout(r, 20));
      expect(counter).toBe(1);

      actor.pause(); // Realtime pause
      await new Promise((r) => setTimeout(r, 150));
      expect(counter).toBe(1); // Still 1

      actor.play(); // Resume
      await new Promise((r) => setTimeout(r, 120));
      expect(counter).toBe(2);

      actor.next(); // Skip second wait
      await new Promise((r) => setTimeout(r, 20));
      expect(counter).toBe(3);
    });

    it('.waitForEvent() pauses the queue until the specified event is dispatched', async () => {
      const actor = new Cursor({ humanize: false });
      let counter = 0;

      actor.waitForEvent('#test-btn', 'custom-event').do(() => counter++);

      // Should not increment until event fires
      await new Promise((r) => setTimeout(r, 50));
      expect(counter).toBe(0);

      // Dispatch event
      const btn = document.getElementById('test-btn');
      btn?.dispatchEvent(new Event('custom-event'));

      // Should now resume and increment
      await new Promise((r) => setTimeout(r, 50));
      expect(counter).toBe(1);
    });
  });

  describe('State Management', () => {
    it('.setState() updates instance state and triggers plugin hooks in sequence', async () => {
      const actor = new Cursor({ humanize: false });
      let pluginCalled = false;
      let hookOldState = null;
      let hookNewState = null;

      const mockPlugin = {
        name: 'MockThemePlugin',
        install: () => {},
        onStateChange: (ns: any, os: any) => {
          pluginCalled = true;
          hookNewState = ns;
          hookOldState = os;
        },
      };

      actor.use(mockPlugin);

      expect(actor.state).toEqual({ speed: 0.5, humanize: false, size: 1 });

      await actor.wait(10).setState({ cursorType: 'pointer', color: 'red' }).wait(10);

      expect(actor.state).toEqual({
        speed: 0.5,
        humanize: false,
        cursorType: 'pointer',
        color: 'red',
        size: 1,
      });
      expect(pluginCalled).toBe(true);
      expect(hookOldState).toEqual({ speed: 0.5, humanize: false, size: 1 });
      expect(hookNewState).toEqual({
        speed: 0.5,
        humanize: false,
        cursorType: 'pointer',
        color: 'red',
        size: 1,
      });

      await actor.setState({ size: 2 });
      expect(actor.state).toEqual({
        speed: 0.5,
        humanize: false,
        cursorType: 'pointer',
        color: 'red',
        size: 2,
      });
      // The cursor itself supports scaling directly through state
      expect((actor as any).cursor.el.style.transform).toContain('scale(2)');
    });
  });
});
