'use client';

import { useEffect, useState } from 'react';
import {
  Cursor,
  ThemePlugin,
  RipplePlugin,
  IndicatorPlugin,
  SoundPlugin,
  LoggingPlugin,
} from '@cursor.js/core';
import {
  TrailPlugin,
  ParticlePlugin,
  OutlinePlugin,
  FloatingPlugin,
  WaitForUserPlugin,
  SpotlightPlugin,
} from '@cursor.js/pro';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Volume2, VolumeX } from 'lucide-react';

export function ThemeDemo() {
  useEffect(() => {
    let isActive = true;
    const c = new Cursor({ speed: 0.8 });
    c.use(new ThemePlugin()); // Enable theme rendering

    const run = () => {
      if (!isActive) return;
      c.hover('#demo-theme-input')
        .wait(300)
        .type('#demo-theme-input', 'Autodetected!', { delay: 30 })
        .wait(600)
        .hover('#demo-theme-button')
        .wait(300)
        .click('#demo-theme-button')
        .wait(600)
        .hover('.carousel') // arbitrary container
        .do(
          () =>
            isActive && (document.querySelector<HTMLInputElement>('#demo-theme-input')!.value = ''),
        )
        .do(() => {
          if (isActive) setTimeout(run, 0);
        });
    };

    c.setState({ size: 1 });
    c.wait(200).do(() => run());

    return () => {
      isActive = false;
      c.destroy();
    };
  }, []);

  return (
    <div className="box-border flex h-full w-full max-w-sm flex-col justify-center space-y-4 overflow-hidden p-4 mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Theme Plugin</h4>
      <p className="text-xs text-muted-foreground mb-3">
        Core plugin for high-quality SVG themes, dynamic "I-beam" text cursors on inputs, and
        hotspot awareness. Required for standard visually optimal behavior.
      </p>

      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="demo-theme-toggle-main" className="cursor-pointer text-xs font-semibold">
          Enable Theme
        </Label>
        <Switch id="demo-theme-toggle-main" checked={true} disabled onCheckedChange={() => {}} />
      </div>

      <div className="space-y-3 p-4 border rounded-md">
        <Input id="demo-theme-input" placeholder="Watch the SVG change to I-beam..." />
        <Button id="demo-theme-button" className="w-full">
          Pointer Arrow
        </Button>
      </div>
    </div>
  );
}

export function RippleDemo() {
  useEffect(() => {
    let isActive = true;
    const c = new Cursor({ speed: 0.8 });
    c.use(new RipplePlugin({ color: '#3b82f680', size: 25 }));

    const run = () => {
      if (!isActive) return;
      c.setState({ ripple: { color: '#3b82f680', size: 25 } })
        .hover('#demo-ripple-input')
        .wait(300)
        .click('#demo-ripple-input')
        .type('#demo-ripple-input', 'Ripple test', { delay: 30 })
        .wait(500)
        .setState({ ripple: { color: '#ef444480', size: 40 } })
        .hover('#demo-ripple-button')
        .wait(300)
        .click('#demo-ripple-button')
        .wait(500)
        .do(
          () =>
            isActive &&
            (document.querySelector<HTMLInputElement>('#demo-ripple-input')!.value = ''),
        )
        .do(() => {
          if (isActive) setTimeout(run, 0);
        });
    };

    c.setState({ size: 1 });
    c.wait(200).do(() => run());

    return () => {
      isActive = false;
      c.destroy();
    };
  }, []);

  return (
    <div className="box-border flex h-full w-full max-w-sm flex-col justify-center space-y-4 overflow-hidden p-4 mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Ripple Plugin</h4>
      <p className="text-xs text-muted-foreground mb-4">
        A visually appealing material design ripple effect that appears on every click.
      </p>
      <div className="space-y-3">
        <Input id="demo-ripple-input" placeholder="Watch the ripple..." />
        <Button id="demo-ripple-button" className="w-full">
          Click Here
        </Button>
      </div>
    </div>
  );
}

export function ParticleDemo() {
  useEffect(() => {
    let isActive = true;
    const c = new Cursor({ speed: 0.8 });
    c.use(new ParticlePlugin({ color: '#f59e0b', size: 6, particleCount: 12 }));

    const run = () => {
      if (!isActive) return;
      c.setState({ particle: { color: '#f59e0b' } })
        .hover('#demo-particle-input')
        .wait(300)
        .click('#demo-particle-input')
        .type('#demo-particle-input', 'Particle test', { delay: 30 })
        .wait(500)
        .setState({ particle: { color: '#ec4899', particleCount: 20 } })
        .hover('#demo-particle-button')
        .wait(300)
        .click('#demo-particle-button')
        .wait(500)
        .do(
          () =>
            isActive &&
            (document.querySelector<HTMLInputElement>('#demo-particle-input')!.value = ''),
        )
        .do(() => {
          if (isActive) setTimeout(run, 0);
        });
    };

    c.setState({ size: 1 });
    c.wait(200).do(() => run());

    return () => {
      isActive = false;
      c.destroy();
    };
  }, []);

  return (
    <div className="box-border flex h-full w-full max-w-sm flex-col justify-center space-y-4 overflow-hidden p-4 mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Particle Plugin</h4>
      <p className="text-xs text-muted-foreground mb-4">
        A subtle, visually pleasing particle explosion effect around your cursor whenever you click.
      </p>
      <div className="space-y-3">
        <Input id="demo-particle-input" placeholder="Watch the particles..." />
        <Button id="demo-particle-button" className="w-full">
          Click Here
        </Button>
      </div>
    </div>
  );
}

export function IndicatorDemo() {
  useEffect(() => {
    let isActive = true;
    const c = new Cursor({ speed: 0.8 });
    c.use(new IndicatorPlugin());

    const run = () => {
      if (!isActive) return;
      c.hover('#demo-indicator-top')
        .wait(800)
        .hover('#demo-indicator-bottom')
        .wait(800)
        .do(() => {
          if (isActive) setTimeout(run, 0);
        });
    };

    c.setState({ size: 1 });
    c.wait(200).do(() => run());

    return () => {
      isActive = false;
      c.destroy();
    };
  }, []);

  return (
    <div className="w-full flex justify-center text-left">
      <div className="box-border relative h-full w-full max-w-sm space-y-4 overflow-hidden p-4">
        <h4 className="text-sm font-semibold mb-2">Indicator Plugin</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Watch the arrow pointing to the cursor's location when it goes completely out of the
          screen boundaries. Start scrolling down.
        </p>

        <div
          className="flex flex-col justify-between py-6 items-center border rounded-md"
          style={{ height: '800px' }}
        >
          <Button
            id="demo-indicator-top"
            variant="outline"
            className="border-dashed cursor-default mt-4"
          >
            Top Element
          </Button>

          <Button
            id="demo-indicator-bottom"
            variant="outline"
            className="border-dashed cursor-default mb-4"
          >
            Bottom Element
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SoundDemo() {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    let isActive = true;
    const c = new Cursor({ speed: 0.6 });
    c.use(new RipplePlugin({ size: 30, color: '#10b98180' }));
    if (soundEnabled) {
      c.use(
        new SoundPlugin({
          volume: 0.5,
          clickSoundUrl: '/click.mp3',
          typingSoundUrl: '/typing.mp3',
        }),
      );
    }

    const run = () => {
      if (!isActive) return;
      c.hover('#demo-sound-btn')
        .wait(300)
        .click('#demo-sound-btn')
        .wait(400)
        .type('#demo-sound-input', 'hello', { delay: 100 })
        .wait(400)
        .do(() => {
          const input = document.getElementById('demo-sound-input') as HTMLInputElement;
          if (input) input.value = '';
        })
        .wait(800)
        .do(() => {
          if (isActive) setTimeout(run, 0);
        });
    };

    c.setState({ size: 1 });
    c.wait(200).do(() => run());

    return () => {
      isActive = false;
      c.destroy();
    };
  }, [soundEnabled]);

  return (
    <div className="box-border flex h-full w-full max-w-sm flex-col justify-center space-y-4 overflow-hidden p-4 mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Sound Plugin</h4>
      <p className="text-xs text-muted-foreground mb-4">
        Immersive keyboard and mouse sound effects.
      </p>
      <div className="flex flex-col items-center justify-center gap-4 py-8 border rounded-md">
        <Button
          variant={soundEnabled ? 'default' : 'outline'}
          className="gap-2"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </Button>
        <span
          id="demo-sound-btn"
          className="px-4 py-2 border rounded shadow-sm text-sm cursor-pointer select-none"
        >
          Click Target
        </span>
        <Input
          id="demo-sound-input"
          placeholder="Type here..."
          className="w-40 text-center pointer-events-none"
          readOnly
        />
      </div>
    </div>
  );
}

export function LoggingDemo() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let isActive = true;
    const c = new Cursor({ speed: 1 });
    c.use(new RipplePlugin({ size: 25 }));

    if (enabled) {
      c.use(new LoggingPlugin());
    } else {
      c.removePlugin('LoggingPlugin');
    }

    const run = () => {
      if (!isActive) return;
      c.hover('#demo-log-input1')
        .wait(300)
        .click('#demo-log-input1')
        .type('#demo-log-input1', 'hello', { delay: 40 })
        .wait(400)
        .hover('#demo-log-submit')
        .wait(300)
        .click('#demo-log-submit')
        .wait(600)
        .do(
          () =>
            isActive && (document.querySelector<HTMLInputElement>('#demo-log-input1')!.value = ''),
        )
        .do(() => {
          if (isActive) setTimeout(run, 0);
        });
    };

    c.setState({ size: 1 });
    c.wait(200).do(() => run());

    return () => {
      isActive = false;
      c.destroy();
    };
  }, [enabled]);

  return (
    <div className="box-border flex h-full w-full max-w-sm flex-col justify-center space-y-4 overflow-hidden p-4 mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Logging Plugin</h4>
      <p className="text-xs text-muted-foreground mb-3">
        Open Developer Tools (F12) to see verbose logging of the cursor's coordinates, steps, and
        plugin states.
      </p>

      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="demo-logging-toggle-main" className="cursor-pointer text-xs font-semibold">
          Enable Logging
        </Label>
        <Switch id="demo-logging-toggle-main" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="flex flex-col gap-2 p-4 border rounded-md">
        <Input id="demo-log-input1" placeholder="Type here..." />
        <Button id="demo-log-submit" className="w-full">
          Submit
        </Button>
      </div>
    </div>
  );
}

export function TrailDemo() {
  useEffect(() => {
    let isActive = true;
    const c = new Cursor({ speed: 0.8 });
    c.use(new TrailPlugin({ color: '#3b82f6', thickness: 3, fadeDuration: 600 }));

    const run = () => {
      if (!isActive) return;
      c.hover('#demo-trail-input')
        .wait(300)
        .click('#demo-trail-input')
        .type('#demo-trail-input', 'Smooth trail', { delay: 30 })
        .wait(500)
        .hover('#demo-trail-button')
        .wait(300)
        .click('#demo-trail-button')
        .wait(500)
        .do(
          () =>
            isActive && (document.querySelector<HTMLInputElement>('#demo-trail-input')!.value = ''),
        )
        .do(() => {
          if (isActive) setTimeout(run, 0);
        });
    };

    c.setState({ size: 1 });
    c.wait(200).do(() => run());

    return () => {
      isActive = false;
      c.destroy();
    };
  }, []);

  return (
    <div className="box-border flex h-full w-full max-w-sm flex-col justify-center space-y-4 overflow-hidden p-4 mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Trail Plugin</h4>
      <p className="text-xs text-muted-foreground mb-4">
        Leaves a custom trail behind the cursor movement, resembling an airplane contrail.
      </p>
      <div className="space-y-3">
        <Input id="demo-trail-input" placeholder="Watch the trail..." />
        <Button id="demo-trail-button" className="w-full">
          Move Here
        </Button>
      </div>
    </div>
  );
}

export function SayDemo() {
  useEffect(() => {
    let isActive = true;
    let cursor: any;

    async function init() {
      // Dynamic imports to avoid SSR issues with some plugins if any
      const { Cursor, SayPlugin } = await import('@cursor.js/core');
      if (!isActive) return;

      cursor = new Cursor({ speed: 0.8 });
      cursor.use(new SayPlugin({}));

      async function runLoop() {
        if (!isActive) return;
        await cursor.hover('#say-btn').say('Clicking this button!').click().wait(1000);
        if (!isActive) return;
        await cursor.move({ x: 50, y: 50 }).say('Done.').wait(1000);
        if (!isActive) return;
        runLoop();
      }
      runLoop();
    }
    init();

    return () => {
      isActive = false;
      if (cursor) cursor.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-900 border rounded-xl overflow-hidden relative">
      <Button id="say-btn">Say Action</Button>
    </div>
  );
}

export function SpeechDemo() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;

    let isActive = true;
    let cursor: any;

    async function init() {
      const { Cursor, SpeechPlugin } = await import('@cursor.js/core');
      if (!isActive) return;

      cursor = new Cursor({ speed: 0.8 });
      cursor.use(
        new SpeechPlugin({
          lang: 'en-GB',
        }),
      );

      async function runLoop() {
        if (!isActive) return;
        await cursor
          .hover('#speech-btn')
          .speak('I am about to click this button')
          .click('#speech-btn')
          .wait(2000);
        if (!isActive) return;
        runLoop();
      }
      runLoop();
    }
    init();

    return () => {
      isActive = false;
      if (cursor) cursor.destroy();
    };
  }, [started]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-900 border rounded-xl overflow-hidden relative">
      {!started ? (
        <Button onClick={() => setStarted(true)}>Play Demo</Button>
      ) : (
        <Button id="speech-btn">Speech Action</Button>
      )}
    </div>
  );
}

export function GeminiTTSDemo() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let isActive = true;
    let cursor: any;

    async function init() {
      const { Cursor, SayPlugin } = await import('@cursor.js/core');
      const { GeminiTTSPlugin } = await import('@cursor.js/pro');
      if (!isActive) return;

      cursor = new Cursor({ speed: 0.8 });
      cursor.use(new SayPlugin({}));
      cursor.use(
        new GeminiTTSPlugin({
          licenseKey: process.env.NEXT_PUBLIC_CURSORJS_INTERNAL_DEMO_LICENSE_KEY,
          speaker: 'Aoede',
          style: 'conversational',
          model: 'gemini-3.1-flash-tts-preview',
          language: 'en-US',
        }),
      );

      async function runLoop() {
        if (!isActive) return;
        await cursor
          .hover('#gemini-tts-btn')
          .say('I have a realistic voice now.')
          .click('#gemini-tts-btn')
          .wait(3000);
        if (!isActive) return;
        runLoop();
      }
      // Delay before start
      setTimeout(() => runLoop(), 1000);
    }
    init();

    return () => {
      isActive = false;
      if (cursor) cursor.destroy(); // Important to stop the audio when demo unmounts
    };
  }, [started]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-900 border rounded-xl overflow-hidden relative">
      {!started ? (
        <Button onClick={() => setStarted(true)}>Play Demo</Button>
      ) : (
        <>
          <Button id="gemini-tts-btn">Gemini TTS Action</Button>
          <div className="absolute bottom-4 right-4 max-w-[240px] rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/80 dark:text-amber-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>panele gidip lütfen onaylayınız.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function OutlineDemo() {
  useEffect(() => {
    let isActive = true;
    const c = new Cursor({ speed: 0.8 });
    c.use(new OutlinePlugin());

    const loop = async () => {
      if (!isActive) return;
      c.move('#btn1').wait(300);

      // Outline circle
      (c as any).outlineCircle('#btn1', { duration: 1000 }).wait(500).move('#btn2').wait(300);

      // Outline underline
      (c as any)
        .outlineUnderline('#btn2', { duration: 1000, loopCount: 2 })
        .wait(500)
        .move(10, 10)
        .wait(500)
        .do(loop);
    };

    loop();

    return () => {
      isActive = false;
      c.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-12 w-full h-full pt-12">
      <button id="btn1" className="px-8 py-3 bg-indigo-500 text-white rounded-lg">
        Circle Target
      </button>
      <div id="btn2" className="text-xl font-bold text-slate-700 select-none">
        Underline Target
      </div>
    </div>
  );
}

export function PromptDemo() {
  useEffect(() => {
    let isActive = true;
    let cursor: any;

    async function init() {
      const { Cursor, PromptPlugin } = await import('@cursor.js/core');
      if (!isActive) return;

      cursor = new Cursor({ speed: 0.8 });
      cursor.use(new PromptPlugin());

      async function runLoop() {
        if (!isActive) return;
        await cursor
          .hover('#prompt-btn-1')
          .prompt('Displaying near cursor...', { position: 'cursor' })
          .wait(500)
          .hover('#prompt-btn-2')
          .prompt('Displaying at the bottom...', { position: 'bottom' })
          .wait(500)
          .hover('#prompt-btn-3')
          .prompt('Displaying in the center modal style...', { position: 'center' })
          .wait(1000);

        if (!isActive) return;
        runLoop();
      }
      runLoop();
    }
    init();

    return () => {
      isActive = false;
      if (cursor) cursor.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full h-full p-4">
      <button
        id="prompt-btn-1"
        className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded shadow-sm w-32 hover:opacity-90"
      >
        Cursor Pos
      </button>
      <button
        id="prompt-btn-2"
        className="px-3 py-1.5 text-sm bg-green-500 text-white rounded shadow-sm w-32 hover:opacity-90"
      >
        Bottom Pos
      </button>
      <button
        id="prompt-btn-3"
        className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded shadow-sm w-32 hover:opacity-90"
      >
        Center Pos
      </button>
    </div>
  );
}

export function WaitForUserDemo() {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'confirmed'>('idle');

  useEffect(() => {
    let isActive = true;
    const cursor = new Cursor({ speed: 0.75 });
    cursor.use(new SpotlightPlugin());
    cursor.use(new WaitForUserPlugin());

    const resetUi = () => {
      if (!isActive) return;
      setStatus('idle');
      const consent = document.querySelector<HTMLInputElement>('#wait-for-user-consent');
      if (consent) consent.checked = false;
    };

    const run = async () => {
      if (!isActive) return;

      resetUi();
      setStatus('waiting');

      await cursor
        .hover('#wait-for-user-trigger')
        .click('#wait-for-user-trigger')
        .wait(400)
        .do((c) =>
          (c as any).waitForUser({
            target: '#wait-for-user-confirm',
            event: 'click',
            message: 'Your turn: accept the handoff and confirm this step.',
            spotlight: true,
            backdrop: true,
            pauseEffects: true,
            resumeLabel: 'Skip manually',
          }),
        );

      if (!isActive) return;

      setStatus('confirmed');

      await cursor.move('#wait-for-user-status').wait(1200);

      if (!isActive) return;
      setTimeout(() => {
        if (isActive) {
          void run();
        }
      }, 250);
    };

    cursor.wait(200).do(() => {
      void run();
    });

    return () => {
      isActive = false;
      cursor.destroy();
    };
  }, []);

  return (
    <div className="box-border flex h-full w-full max-w-sm flex-col justify-center space-y-4 overflow-hidden p-4 mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Wait For User Plugin</h4>
      <p className="text-xs text-muted-foreground mb-4">
        Pause the scripted flow, spotlight the target, and let a real person complete the next step
        before the cursor continues.
      </p>

      <div className="space-y-3 rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/40">
        <Button id="wait-for-user-trigger" className="w-full">
          Start handoff
        </Button>

        <label className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs">
          <input id="wait-for-user-consent" type="checkbox" className="size-4" />I reviewed this
          step and I am ready to continue.
        </label>

        <Button
          id="wait-for-user-confirm"
          variant={status === 'confirmed' ? 'default' : 'outline'}
          className="w-full"
        >
          Confirm and continue
        </Button>

        <div
          id="wait-for-user-status"
          className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground"
        >
          {status === 'idle' && 'The cursor will trigger a handoff.'}
          {status === 'waiting' && 'Waiting for a real user click on the confirm button.'}
          {status === 'confirmed' && 'Confirmed. The scripted flow resumed successfully.'}
        </div>
      </div>
    </div>
  );
}

export function FloatingWaitForUserDemo() {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'confirmed'>('idle');

  useEffect(() => {
    let isActive = true;
    const cursor = new Cursor({ speed: 0.75 });
    cursor.use(new FloatingPlugin({ waitForUser: true }));
    cursor.use(new SpotlightPlugin());
    cursor.use(new WaitForUserPlugin());

    const resetUi = () => {
      if (!isActive) return;
      setStatus('idle');
      const consent = document.querySelector<HTMLInputElement>('#floating-wait-consent');
      if (consent) consent.checked = false;
    };

    const run = async () => {
      if (!isActive) return;

      resetUi();
      setStatus('waiting');

      await cursor
        .hover('#floating-wait-trigger')
        .click('#floating-wait-trigger')
        .wait(400)
        .do((c) =>
          (c as any).waitForUser({
            target: '#floating-wait-confirm',
            event: 'click',
            message: 'Your turn: review the floating handoff and continue.',
            position: 'cursor',
            spotlight: true,
            backdrop: true,
            pauseEffects: true,
            speak: true,
            waitUntilFinished: false,
            resumeLabel: 'Skip manually',
          }),
        );

      if (!isActive) return;

      setStatus('confirmed');

      await cursor.move('#floating-wait-status').wait(1200);

      if (!isActive) return;
      setTimeout(() => {
        if (isActive) {
          void run();
        }
      }, 250);
    };

    cursor.wait(200).do(() => {
      void run();
    });

    return () => {
      isActive = false;
      cursor.destroy();
    };
  }, []);

  return (
    <div className="box-border flex h-full w-full max-w-sm flex-col justify-center space-y-4 overflow-hidden p-4 mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Floating Plugin + Wait For User</h4>
      <p className="text-xs text-muted-foreground mb-4">
        Uses Floating UI to keep the handoff panel near the cursor while still supporting spotlight
        focus and speech/TTS narration.
      </p>

      <div className="space-y-3 rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/40">
        <Button id="floating-wait-trigger" className="w-full">
          Start floating handoff
        </Button>

        <label className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs">
          <input id="floating-wait-consent" type="checkbox" className="size-4" />I checked the step
          and I want the cursor flow to continue.
        </label>

        <Button
          id="floating-wait-confirm"
          variant={status === 'confirmed' ? 'default' : 'outline'}
          className="w-full"
        >
          Continue from floating panel
        </Button>

        <div
          id="floating-wait-status"
          className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground"
        >
          {status === 'idle' && 'The cursor will trigger a floating handoff.'}
          {status === 'waiting' &&
            'Waiting for a real user click with the floating panel anchored near the cursor.'}
          {status === 'confirmed' && 'Confirmed. The floating handoff resumed successfully.'}
        </div>
      </div>
    </div>
  );
}

export function SpotlightDemo() {
  useEffect(() => {
    let isActive = true;
    const cursor = new Cursor({ speed: 0.8 });
    cursor.use(new SpotlightPlugin());

    const run = async () => {
      if (!isActive) return;

      await cursor
        .move('#spotlight-card-a')
        .do((c) => (c as any).spotlight('#spotlight-card-a', { backdrop: true, padding: 14 }))
        .wait(900)
        .move('#spotlight-card-b')
        .do((c) => (c as any).spotlight('#spotlight-card-b', { backdrop: false, padding: 12 }))
        .wait(900)
        .do((c) => (c as any).removeSpotlight())
        .wait(500);

      if (!isActive) return;
      setTimeout(() => {
        if (isActive) {
          void run();
        }
      }, 0);
    };

    cursor.wait(200).do(() => {
      void run();
    });

    return () => {
      isActive = false;
      cursor.destroy();
    };
  }, []);

  return (
    <div className="box-border flex h-full w-full max-w-sm flex-col justify-center space-y-4 overflow-hidden p-4 mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Spotlight Plugin</h4>
      <p className="text-xs text-muted-foreground mb-4">
        Highlight the exact element that matters and optionally dim the rest of the interface for
        guided attention.
      </p>
      <div className="grid gap-3">
        <div
          id="spotlight-card-a"
          className="rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/40"
        >
          <div className="text-sm font-medium">Primary callout</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Uses the dimmed backdrop to isolate the next target.
          </div>
        </div>
        <div
          id="spotlight-card-b"
          className="rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/40"
        >
          <div className="text-sm font-medium">Inline highlight</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Keeps the frame without dimming the rest of the screen.
          </div>
        </div>
      </div>
    </div>
  );
}
