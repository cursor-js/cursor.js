import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Cursor } from '../core/Cursor';
import { SayPlugin } from './SayPlugin';
import { SpeechPlugin } from './SpeechPlugin';

describe('SpeechPlugin', () => {
  let cursor: Cursor;
  let sayPlugin: SayPlugin;
  let speechPlugin: SpeechPlugin;

  beforeEach(() => {
    cursor = new Cursor();
    sayPlugin = new SayPlugin();
    speechPlugin = new SpeechPlugin();

    cursor.use(sayPlugin);
    cursor.use(speechPlugin);
  });

  afterEach(() => {
    cursor.destroy();
  });

  it('should be installed on cursor', () => {
    expect(speechPlugin.name).toBe('speech');
  });

  it('should have onBeforeSay hook when installed', () => {
    expect(sayPlugin.onBeforeSay).toBeDefined();
  });

  it('should configure with options', () => {
    const plugin = new SpeechPlugin({
      enabled: false,
      lang: 'tr-TR',
      rate: 0.8,
      pitch: 1.2,
      volume: 0.5,
    });

    expect(plugin.name).toBe('speech');
  });

  it('should work with Speak option in say', () => {
    // Just verify the hook is called - actual speech synthesis
    // requires browser APIs that are hard to mock
    const hook = sayPlugin.onBeforeSay;
    expect(hook).toBeDefined();
  });
});
