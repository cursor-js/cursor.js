'use client';

import { useEffect, useState } from 'react';
import {
  Cursor,
  ThemePlugin,
  RipplePlugin,
  IndicatorPlugin,
  ClickSoundPlugin,
  LoggingPlugin,
} from '@cursor.js/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX } from 'lucide-react';

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
            isActive &&
            (document.querySelector<HTMLInputElement>('#demo-theme-input')!.value = ''),
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
    <div className="space-y-4 w-full h-full p-4 flex flex-col justify-center max-w-sm mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">Theme Plugin</h4>
      <p className="text-xs text-muted-foreground mb-3">
        Core plugin for high-quality SVG themes, dynamic "I-beam" text cursors on inputs, and hotspot awareness. Required for standard visually optimal behavior.
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
    <div className="space-y-4 w-full h-full p-4 flex flex-col justify-center max-w-sm mx-auto text-left">
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
      <div className="w-full max-w-sm space-y-4 p-4 relative min-h-[400px]">
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

export function ClickSoundDemo() {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    let isActive = true;
    const c = new Cursor({ speed: 0.6 });
    c.use(new RipplePlugin({ size: 30, color: '#10b98180' }));
    if (soundEnabled) {
      c.use(new ClickSoundPlugin());
    }

    const run = () => {
      if (!isActive) return;
      c.hover('#demo-sound-btn')
        .wait(300)
        .click('#demo-sound-btn')
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
    <div className="space-y-4 w-full h-full p-4 flex flex-col justify-center max-w-sm mx-auto text-left">
      <h4 className="text-sm font-semibold mb-2">ClickSound Plugin</h4>
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
    <div className="space-y-4 w-full h-full p-4 flex flex-col justify-center max-w-sm mx-auto text-left">
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
