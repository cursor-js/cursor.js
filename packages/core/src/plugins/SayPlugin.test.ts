import { describe, it, expect, beforeEach } from 'vitest';
import { Cursor } from '../core/Cursor';
import { SayPlugin } from './SayPlugin';

describe('SayPlugin', () => {
  let cursor: Cursor;

  beforeEach(() => {
    cursor = new Cursor();
    document.body.innerHTML = '';
  });

  it('should add say method to cursor', () => {
    cursor.use(new SayPlugin());
    expect(typeof (cursor as any).say).toBe('function');
  });

  it('should create a speech bubble when say is called', async () => {
    cursor.use(new SayPlugin());

    const promise = (cursor as any).say('Hello world');

    // Wait a bit for DOM update
    await new Promise((resolve) => setTimeout(resolve, 50));

    const bubble = document.querySelector('.cursor-js-speech-bubble');
    expect(bubble).not.toBeNull();
    expect(bubble?.textContent).toBe('Hello world');

    // Fast forward to end of speech
    await promise;
  });
});
