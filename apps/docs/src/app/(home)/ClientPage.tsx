'use client';

import { useEffect, useRef, useState, useReducer, ReactNode } from 'react';
import {
  Cursor,
  ThemePlugin,
  IndicatorPlugin,
  RipplePlugin,
  ClickSoundPlugin,
  LoggingPlugin,
} from '@cursor.js/core';
import { TrailPlugin } from '@cursor.js/pro';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import {
  RippleDemo,
  ThemeDemo,
  IndicatorDemo,
  ClickSoundDemo,
  LoggingDemo,
} from '@/components/app/PluginDemos';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
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
    theme: boolean;
    ripple: boolean;
    indicator: boolean;
    clickSound: boolean;
    logging: boolean;
    trail: boolean;
  };
  rippleConfig: {
    color: string;
    duration: number;
    size: number;
  };
  trailConfig: {
    length: number;
    thickness: number;
    color: string;
    fadeDuration: number;
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
    }
  | {
      type: 'UPDATE_TRAIL_CONFIG';
      key: keyof SettingsState['trailConfig'];
      value: string | number;
    };

const initialSettings: SettingsState = {
  coreConfig: {
    humanize: true,
    speed: 0.5,
  },
  plugins: {
    theme: true,
    ripple: true,
    indicator: true,
    clickSound: false,
    logging: false,
    trail: true,
  },
  rippleConfig: {
    color: '#3b82f6',
    duration: 800,
    size: 70,
  },
  trailConfig: {
    length: 135,
    thickness: 6,
    color: '#FF000080',
    fadeDuration: 100,
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
    case 'UPDATE_TRAIL_CONFIG':
      return { ...state, trailConfig: { ...state.trailConfig, [action.key]: action.value } };
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
        .setState({ size: 1 })
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
        .setState({ ripple: { color: '#10b98180' }, size: 1.5 })
        .wait(400)
        .click('#demo-accordion-1')
        .setState({ ripple: { color: settings.rippleConfig.color + '80' }, size: 1 })
        .wait(1200)
        .hover('#demo-accordion-2')
        .wait(400)
        .click('#demo-accordion-2')
        .wait(1000)
        .hover('#cursor-beginning')
        .setState({ size: 5 })
        .do(() => {
          if (!isActive) return;
          setDemoState('done');
          setTimeout(() => isActive && setDemoState('idle'), 3000);
        })
        .do(buildDemoSequence); // Re-queue the scenario at the end
    };

    c.setState({ size: 5 }).move('#cursor-beginning').do(buildDemoSequence);

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

    const { coreConfig, plugins, rippleConfig, trailConfig } = settings;

    c.setState({ humanize: coreConfig.humanize, speed: coreConfig.speed });

    if (plugins.theme) {
      c.use(new ThemePlugin());
    } else {
      c.removePlugin('ThemePlugin');
    }

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

    if (plugins.trail) {
      c.removePlugin('trail');
      c.use(
        new TrailPlugin({
          color: trailConfig.color,
          fadeDuration: trailConfig.fadeDuration,
          thickness: trailConfig.thickness,
          length: trailConfig.length,
        }),
      );
    } else {
      c.removePlugin('trail');
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
            <CardContent className="divide-y">
              {/* Core Settings Section */}
              <div className="space-y-2 py-2">
                <div className="flex items-center justify-between gap-2 mt-2">
                  <Label htmlFor="core-speed">humanize</Label>
                  <div className="flex items-center gap-1">
                    <Switch
                      id="enable-humanize"
                      checked={settings.coreConfig.humanize}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'UPDATE_CORE_CONFIG', key: 'humanize', value: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2">
                  <Label htmlFor="core-speed">speed</Label>
                  <InputGroup className="h-7 w-24">
                    <InputGroupInput
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
                      className="h-7 text-right"
                    />
                    <InputGroupAddon align="inline-end">x</InputGroupAddon>
                  </InputGroup>
                </div>
              </div>

              {/* Theme Plugin Section */}
              <SettingsSection>
                <SettingsSectionHeader
                  id="enable-theme"
                  checked={settings.plugins.theme}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'theme', enabled: checked })
                  }
                >
                  <div className="flex items-center gap-1.5">
                    Default Theme
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="left"
                        className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                      >
                        <iframe
                          src="/demos/theme"
                          className="w-full h-full border-0 overflow-hidden"
                          scrolling="no"
                        />
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </SettingsSectionHeader>
              </SettingsSection>

              {/* Trail Plugin Section */}
              <SettingsSection>
                <SettingsSectionHeader
                  id="enable-trail"
                  checked={settings.plugins.trail}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'trail', enabled: checked })
                  }
                >
                  <div className="flex items-center gap-1.5">
                    Trail
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="left"
                        className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                      >
                        <iframe
                          src="/demos/trail"
                          className="w-full h-full border-0 overflow-hidden"
                          scrolling="no"
                        />
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </SettingsSectionHeader>
                <SettingsSectionBody open={settings.plugins.trail}>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Label htmlFor="trail-length" className="text-xs font-normal">
                      length
                    </Label>
                    <InputGroup className="h-7 w-24">
                      <InputGroupInput
                        id="trail-length"
                        type="number"
                        min={5}
                        max={200}
                        step={5}
                        value={settings.trailConfig.length}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_TRAIL_CONFIG',
                            key: 'length',
                            value: Number(e.target.value),
                          })
                        }
                      />
                      <InputGroupAddon align="inline-end">px</InputGroupAddon>
                    </InputGroup>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Label htmlFor="trail-color" className="text-xs font-normal">
                      color
                    </Label>
                    <InputGroup className="h-7 w-28">
                      <InputGroupInput
                        className="w-10"
                        id="trail-color"
                        type="color"
                        value={settings.trailConfig.color}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_TRAIL_CONFIG',
                            key: 'color',
                            value: e.target.value,
                          })
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        {settings.trailConfig.color}
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Label htmlFor="trail-fade" className="text-xs font-normal">
                      fadeDuration
                    </Label>
                    <InputGroup className="h-7 w-24">
                      <InputGroupInput
                        id="trail-fade"
                        type="number"
                        min={100}
                        max={3000}
                        step={100}
                        value={settings.trailConfig.fadeDuration}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_TRAIL_CONFIG',
                            key: 'fadeDuration',
                            value: Number(e.target.value),
                          })
                        }
                      />
                      <InputGroupAddon align="inline-end">ms</InputGroupAddon>
                    </InputGroup>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Label htmlFor="trail-thickness" className="text-xs font-normal">
                      thickness
                    </Label>
                    <InputGroup className="h-7 w-24">
                      <InputGroupInput
                        id="trail-thickness"
                        type="number"
                        min={1}
                        max={20}
                        step={1}
                        value={settings.trailConfig.thickness}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_TRAIL_CONFIG',
                            key: 'thickness',
                            value: Number(e.target.value),
                          })
                        }
                      />
                      <InputGroupAddon align="inline-end">px</InputGroupAddon>
                    </InputGroup>
                  </div>
                </SettingsSectionBody>
              </SettingsSection>

              {/* Ripple Plugin Section */}
              <SettingsSection>
                <SettingsSectionHeader
                  id="enable-ripple"
                  checked={settings.plugins.ripple}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'ripple', enabled: checked })
                  }
                >
                  <div className="flex items-center gap-1.5">
                    Ripple
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="left"
                        className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                      >
                        <iframe
                          src="/demos/ripple"
                          className="w-full h-full border-0 overflow-hidden"
                          scrolling="no"
                        />
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </SettingsSectionHeader>
                <SettingsSectionBody open={settings.plugins.ripple}>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Label htmlFor="ripple-color" className="text-xs font-normal">
                      color
                    </Label>
                    <InputGroup className="h-7 w-28">
                      <InputGroupInput
                        className="w-10"
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
                      />
                      <InputGroupAddon align="inline-end">
                        {settings.rippleConfig.color}
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Label htmlFor="ripple-duration" className="text-xs font-normal">
                      duration
                    </Label>
                    <InputGroup className="h-7 w-24">
                      <InputGroupInput
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
                      />
                      <InputGroupAddon align="inline-end">ms</InputGroupAddon>
                    </InputGroup>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Label htmlFor="ripple-size" className="text-xs font-normal">
                      size
                    </Label>
                    <InputGroup className="h-7 w-24">
                      <InputGroupInput
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
                      />
                      <InputGroupAddon align="inline-end">px</InputGroupAddon>
                    </InputGroup>
                  </div>
                </SettingsSectionBody>
              </SettingsSection>

              {/* Indicator Plugin Section */}
              <SettingsSection>
                <SettingsSectionHeader
                  id="enable-indicator"
                  checked={settings.plugins.indicator}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'indicator', enabled: checked })
                  }
                >
                  <div className="flex items-center gap-1.5">
                    Indicator
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="left"
                        className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                      >
                        <iframe
                          src="/demos/indicator"
                          className="w-full h-full border-0 overflow-hidden"
                          scrolling="no"
                        />
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </SettingsSectionHeader>
              </SettingsSection>

              {/* ClickSound Plugin Section */}
              <SettingsSection>
                <SettingsSectionHeader
                  id="enable-clicksound"
                  checked={settings.plugins.clickSound}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'clickSound', enabled: checked })
                  }
                >
                  <div className="flex items-center gap-1.5">
                    ClickSound
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="left"
                        className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                      >
                        <iframe
                          src="/demos/clicksound"
                          className="w-full h-full border-0 overflow-hidden"
                          scrolling="no"
                        />
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </SettingsSectionHeader>
              </SettingsSection>

              {/* Logging Plugin Section */}
              <SettingsSection>
                <SettingsSectionHeader
                  id="enable-logging"
                  checked={settings.plugins.logging}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'logging', enabled: checked })
                  }
                >
                  <div className="flex items-center gap-1.5">
                    Logging
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="left"
                        className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                      >
                        <iframe
                          src="/demos/logging"
                          className="w-full h-full border-0 overflow-hidden"
                          scrolling="no"
                        />
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </SettingsSectionHeader>
              </SettingsSection>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
