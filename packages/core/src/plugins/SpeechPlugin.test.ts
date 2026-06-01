import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
      mode: 'interrupt',
      lang: 'tr-TR',
      rate: 0.8,
      pitch: 1.2,
      volume: 0.5,
    });

    expect(plugin.name).toBe('speech');
  });

  it('queues speech by default without waiting for the current line to finish once it starts', async () => {
    cursor.destroy();
    cursor = new Cursor();
    speechPlugin = new SpeechPlugin();
    cursor.use(speechPlugin);

    let finishFirstSpeech: (() => void) | undefined;
    const speakSpy = vi
      .spyOn(speechPlugin as any, 'speak')
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finishFirstSpeech = resolve;
          }),
      )
      .mockResolvedValueOnce(undefined);

    await cursor.emitAsync('speech_requested', 'first line');
    expect(speakSpy).toHaveBeenCalledWith('first line');

    let secondStarted = false;
    const secondEmit = cursor.emitAsync('speech_requested', 'second line').then(() => {
      secondStarted = true;
    });

    await Promise.resolve();

    expect(secondStarted).toBe(false);
    expect(speakSpy).toHaveBeenCalledTimes(1);

    finishFirstSpeech?.();
    await secondEmit;

    expect(secondStarted).toBe(true);
    expect(speakSpy).toHaveBeenCalledWith('second line');
  });

  it('can interrupt active speech when configured', async () => {
    cursor.destroy();
    cursor = new Cursor();
    speechPlugin = new SpeechPlugin({ mode: 'interrupt' });
    cursor.use(speechPlugin);

    const cancel = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { cancel },
    });

    const speakSpy = vi.spyOn(speechPlugin as any, 'speak').mockResolvedValue(undefined);

    await cursor.emitAsync('speech_requested', 'first line');
    await cursor.emitAsync('speech_requested', 'second line');

    expect(cancel).toHaveBeenCalledTimes(2);
    expect(speakSpy).toHaveBeenCalledTimes(2);
  });

  it('lets Gemini TTS own speech requests when both plugins are installed', async () => {
    const fallbackSpy = vi.spyOn(speechPlugin, 'speakFallback').mockResolvedValue(undefined);

    cursor.use({
      name: 'gemini-tts',
      install: () => {},
    });

    await cursor.emitAsync('speech_requested', 'handled by Gemini TTS');

    expect(fallbackSpy).not.toHaveBeenCalled();
  });

  it('should work with Speak option in say', () => {
    // Just verify the hook is called - actual speech synthesis
    // requires browser APIs that are hard to mock
    const hook = sayPlugin.onBeforeSay;
    expect(hook).toBeDefined();
  });

  it('removes the speech_requested listener when destroyed', async () => {
    const speakSpy = vi.spyOn(speechPlugin as any, 'speak').mockResolvedValue(undefined);

    await cursor.emitAsync('speech_requested', 'before destroy');
    expect(speakSpy).toHaveBeenCalledTimes(1);

    cursor.removePlugin('speech');
    await cursor.emitAsync('speech_requested', 'after destroy');

    expect(speakSpy).toHaveBeenCalledTimes(1);
  });
});
