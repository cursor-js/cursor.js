'use client';

import { useEffect, useRef, useState, useReducer, ReactNode } from 'react';
import {
  Cursor,
  IndicatorPlugin,
  RipplePlugin,
  ClickSoundPlugin,
  LoggingPlugin,
} from '@cursor.js/core';
import Link from 'next/link';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  SettingsSection,
  SettingsSectionHeader,
  SettingsSectionBody,
} from '@/components/app/settings-section';

type SettingsState = {
  coreConfig: {
    humanize: boolean;
    speed: number;
  };
  plugins: {
    ripple: boolean;
    indicator: boolean;
    clickSound: boolean;
    logging: boolean;
  };
  rippleConfig: {
    color: string;
    duration: number;
    size: number;
  };
};

type SettingsAction =
  | { type: 'TOGGLE_PLUGIN'; plugin: keyof SettingsState['plugins']; enabled: boolean }
  | {
      type: 'UPDATE_CORE_CONFIG';
      key: keyof SettingsState['coreConfig'];
      value: string | number | boolean;
    }
  | {
      type: 'UPDATE_RIPPLE_CONFIG';
      key: keyof SettingsState['rippleConfig'];
      value: string | number;
    };

const initialSettings: SettingsState = {
  coreConfig: {
    humanize: true,
    speed: 0.5,
  },
  plugins: {
    ripple: true,
    indicator: true,
    clickSound: false,
    logging: false,
  },
  rippleConfig: {
    color: '#3b82f6',
    duration: 800,
    size: 70,
  },
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'TOGGLE_PLUGIN':
      return { ...state, plugins: { ...state.plugins, [action.plugin]: action.enabled } };
    case 'UPDATE_CORE_CONFIG':
      return { ...state, coreConfig: { ...state.coreConfig, [action.key]: action.value } };
    case 'UPDATE_RIPPLE_CONFIG':
      return { ...state, rippleConfig: { ...state.rippleConfig, [action.key]: action.value } };
    default:
      return state;
  }
}

export function ClientPage() {
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'done'>('idle');
  const actorRef = useRef<Cursor | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Consolidated settings state via useReducer
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  useEffect(() => {
    const c = new Cursor({
      humanize: settings.coreConfig.humanize,
      speed: settings.coreConfig.speed,
    });
    actorRef.current = c;
    let isActive = true;

    // Wrap the repeatable scenario in a function and link recursively
    const buildDemoSequence = () => {
      if (!isActive) return;
      c.stop()
        .do(() => setDemoState('running'))
        .wait(500)
        .until(
          () => {
            const prevBtn = document.querySelector('.carousel-prev');
            return prevBtn?.hasAttribute('disabled') || false;
          },
          (ctx) => ctx.click('.carousel-prev').wait(500),
        )
        .setSize(1)
        .if(
          () =>
            document.querySelector<HTMLInputElement>('#demo-email')?.value !== 'hello@cursor.js',
          (ctx) =>
            ctx
              .hover('#demo-email')
              .wait(300)
              .do(() => isActive && setEmail(''))
              .type('#demo-email', 'hello@cursor.js', { delay: 60 })
              .wait(500),
        )
        .if(
          () => document.querySelector<HTMLInputElement>('#demo-password')?.value !== 'secret',
          (ctx) =>
            ctx
              .hover('#demo-password')
              .wait(300)
              .do(() => isActive && setPassword(''))
              .type('#demo-password', 'secret', { delay: 60 })
              .wait(600),
        )
        .hover('#demo-submit')
        .wait(300)
        .click('#demo-submit')
        .wait(1000)
        .do(() => isActive && setSubmitted(true))
        .hover('.carousel-next')
        .wait(400)
        .click('.carousel-next')
        .wait(1000)
        .hover('#demo-accordion-1')
        .setState({ rippleColor: '#10b98180', size: 1.5 })
        .wait(400)
        .click('#demo-accordion-1')
        .setState({ rippleColor: settings.rippleConfig.color + '80', size: 1 })
        .wait(1200)
        .hover('#demo-accordion-2')
        .wait(400)
        .click('#demo-accordion-2')
        .wait(1000)
        .hover('#cursor-beginning')
        .setSize(5)
        .do(() => {
          if (!isActive) return;
          setDemoState('done');
          setTimeout(() => isActive && setDemoState('idle'), 3000);
        })
        .do(buildDemoSequence); // Re-queue the scenario at the end
    };

    c.wait(100).setSize(5).move('#cursor-beginning').do(buildDemoSequence);

    return () => {
      isActive = false;
      c.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cursor plugins whenever settings change
  useEffect(() => {
    const c = actorRef.current;
    if (!c) return;

    const { coreConfig, plugins, rippleConfig } = settings;

    c.setConfig({ humanize: coreConfig.humanize, speed: coreConfig.speed });

    if (plugins.indicator) {
      c.use(new IndicatorPlugin());
    } else {
      c.removePlugin('IndicatorPlugin');
    }

    if (plugins.logging) {
      c.use(new LoggingPlugin());
    } else {
      c.removePlugin('LoggingPlugin');
    }

    if (plugins.clickSound) {
      c.use(new ClickSoundPlugin());
    } else {
      c.removePlugin('ClickSoundPlugin');
    }

    if (plugins.ripple) {
      c.removePlugin('RipplePlugin');
      c.use(
        new RipplePlugin({
          color: rippleConfig.color + '80',
          duration: rippleConfig.duration,
          size: rippleConfig.size,
        }),
      );
    } else {
      c.removePlugin('RipplePlugin');
    }
  }, [settings]);

  const runDemo = () => {
    if (!actorRef.current || demoState === 'running') return;
    setSubmitted(false);
    setEmail('');
    setPassword('');
    actorRef.current.next();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center space-y-6 pt-24 pb-8 md:pt-7 text-center px-6">
          <div className="flex flex-col items-center space-y-8">
            <div className="relative w-20 h-26">
              <div id="cursor-beginning" className="absolute left-0 top-0 size-px" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              cursor.js
            </h1>
          </div>
          <div className="flex space-x-4">
            <Button size="lg" onClick={runDemo} disabled={demoState === 'running'}>
              {demoState === 'running' ? 'Demo is running...' : 'Run Live Demo'}
            </Button>
            <Link
              href="https://github.com/cihad/cursor.js"
              className={buttonVariants({ size: 'lg', variant: 'outline' })}
            >
              GitHub
            </Link>
          </div>
        </section>

        <section className="container mx-auto flex flex-col md:flex-row items-stretch justify-center gap-6 py-12 px-6">
          {/* Left Side: Carousel */}
          <div className="flex-1 w-full max-w-3xl rounded-xl border bg-card text-card-foreground shadow p-8">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Step 1: Fill Forms</h2>
                    <p className="text-muted-foreground mb-6">
                      Cursor.js precisely moves, focuses, and mimics human typing delays.
                    </p>

                    <div className="space-y-4 max-w-sm border p-6 rounded-lg bg-background">
                      <div className="space-y-2">
                        <Label htmlFor="demo-email">Email</Label>
                        <Input
                          id="demo-email"
                          type="email"
                          placeholder="m@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demo-password">Password</Label>
                        <Input
                          id="demo-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        id="demo-submit"
                        className="w-full"
                        onClick={() => setSubmitted(true)}
                      >
                        {submitted ? 'Signed In!' : 'Sign In'}
                      </Button>
                    </div>
                  </div>
                </CarouselItem>

                <CarouselItem>
                  <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Step 2: Interact with Details</h2>
                    <p className="text-muted-foreground mb-6">
                      Effortlessly click on targets, wait for animations, and trigger complex Shadcn
                      elements.
                    </p>

                    <Accordion
                      type="single"
                      collapsible
                      className="w-full max-w-lg border px-4 rounded-lg bg-background"
                    >
                      <AccordionItem value="item-1">
                        <AccordionTrigger id="demo-accordion-1">Is it accessible?</AccordionTrigger>
                        <AccordionContent>
                          Yes. Cursor.js strictly interacts with normal DOM nodes.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger id="demo-accordion-2">Can it be styled?</AccordionTrigger>
                        <AccordionContent>
                          Yes. It comes with default styles that you can override with CSS.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger id="demo-accordion-3">Is it animated?</AccordionTrigger>
                        <AccordionContent>
                          Yes. Using simulated spring algorithms for maximum realism.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="carousel-prev" />
              <CarouselNext className="carousel-next" />
            </Carousel>
          </div>

          {/* Right Side: Settings */}
          <Card className="min-w-xs">
            <CardHeader>Cursor Settings</CardHeader>
            <CardContent>
              {/* Core Settings Section */}
              <div className="space-y-3 pb-3 border-b">
                <SettingsSection>
                  <SettingsSectionHeader
                    id="enable-humanize"
                    title="humanize"
                    checked={settings.coreConfig.humanize}
                    onCheckedChange={(checked) =>
                      dispatch({ type: 'UPDATE_CORE_CONFIG', key: 'humanize', value: checked })
                    }
                  />
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <Label htmlFor="core-speed" className="text-sm font-medium">
                      speed
                    </Label>
                    <div className="flex items-center gap-1">
                      <Input
                        id="core-speed"
                        type="number"
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={settings.coreConfig.speed}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_CORE_CONFIG',
                            key: 'speed',
                            value: Number(e.target.value),
                          })
                        }
                        className="h-7 w-16 text-right px-2 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">x</span>
                    </div>
                  </div>
                </SettingsSection>
              </div>

              {/* Ripple Plugin Section */}
              <div className="pt-1">
                <SettingsSection>
                  <SettingsSectionHeader
                    id="enable-ripple"
                    title="Ripple"
                    checked={settings.plugins.ripple}
                    onCheckedChange={(checked) =>
                      dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'ripple', enabled: checked })
                    }
                  />
                  <SettingsSectionBody open={settings.plugins.ripple}>
                    <div className="space-y-3 pl-3 mt-3 border-l-2 ml-1 border-muted">
                      <div className="flex flex-row items-center justify-between gap-2">
                      <Label htmlFor="ripple-color" className="text-xs font-normal">
                        color
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {settings.rippleConfig.color}
                        </span>
                        <Input
                          id="ripple-color"
                          type="color"
                          value={settings.rippleConfig.color}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_RIPPLE_CONFIG',
                              key: 'color',
                              value: e.target.value,
                            })
                          }
                          className="w-6 h-6 p-0 border-0 cursor-pointer rounded-full overflow-hidden"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-2">
                      <Label htmlFor="ripple-duration" className="text-xs font-normal">
                        duration
                      </Label>
                      <div className="flex items-center gap-1">
                        <Input
                          id="ripple-duration"
                          type="number"
                          min={100}
                          max={3000}
                          step={100}
                          value={settings.rippleConfig.duration}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_RIPPLE_CONFIG',
                              key: 'duration',
                              value: Number(e.target.value),
                            })
                          }
                          className="h-7 w-16 text-right px-2 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">ms</span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-2">
                      <Label htmlFor="ripple-size" className="text-xs font-normal">
                        size
                      </Label>
                      <div className="flex items-center gap-1">
                        <Input
                          id="ripple-size"
                          type="number"
                          min={10}
                          max={200}
                          step={10}
                          value={settings.rippleConfig.size}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_RIPPLE_CONFIG',
                              key: 'size',
                              value: Number(e.target.value),
                            })
                          }
                          className="h-7 w-16 text-right px-2 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                      </div>
                    </div>
                  </div>
                  </SettingsSectionBody>
                </SettingsSection>
              </div>

              {/* Indicator Plugin Section */}
              <div className="pt-3 border-t">
                <SettingsSection>
                  <SettingsSectionHeader
                    id="enable-indicator"
                    title="Indicator"
                    checked={settings.plugins.indicator}
                    onCheckedChange={(checked) =>
                      dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'indicator', enabled: checked })
                    }
                  />
                </SettingsSection>
              </div>

              {/* ClickSound Plugin Section */}
              <div className="pt-3 border-t">
                <SettingsSection>
                  <SettingsSectionHeader
                    id="enable-clicksound"
                    title="ClickSound"
                    checked={settings.plugins.clickSound}
                    onCheckedChange={(checked) =>
                      dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'clickSound', enabled: checked })
                    }
                  />
                </SettingsSection>
              </div>

              {/* Logging Plugin Section */}
              <div className="pt-3 border-t">
                <SettingsSection>
                  <SettingsSectionHeader
                    id="enable-logging"
                    title="Logging"
                    checked={settings.plugins.logging}
                    onCheckedChange={(checked) =>
                      dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'logging', enabled: checked })
                    }
                  />
                </SettingsSection>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
