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

    await actor.setSize(5).move(300, 400);

    expect(actor.cursor.scale).toBe(5);
    expect(actor.cursor.x).toBe(300);
    expect(actor.cursor.y).toBe(400);

    // Can change size over element
    await actor.move('#test-btn').setSize(1);

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
  });
});
