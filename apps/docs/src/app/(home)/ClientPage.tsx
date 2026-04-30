'use client';

import { useEffect, useRef, useState, useReducer, ReactNode } from 'react';
import {
  Cursor,
  ThemePlugin,
  IndicatorPlugin,
  RipplePlugin,
  ClickSoundPlugin,
  LoggingPlugin,
  SayPlugin,
  SpeechPlugin,
  defaultTheme,
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
import { SettingsAccordionTrigger, SettingsAccordionContent } from '@/components/app/settings-accordion';
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

type SettingsState = {
  coreConfig: {
    humanize: boolean;
    speed: number;
    size: number;
  };
  plugins: {
    theme: boolean;
    ripple: boolean;
    indicator: boolean;
    clickSound: boolean;
    logging: boolean;
    trail: boolean;
    say: boolean;
    speech: boolean;
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
  clickSoundConfig: {
    volume: number;
    soundUrl: string;
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
    }
  | {
      type: 'UPDATE_CLICKSOUND_CONFIG';
      key: keyof SettingsState['clickSoundConfig'];
      value: string | number;
    };

const initialSettings: SettingsState = {
  coreConfig: {
    humanize: true,
    speed: 0.7,
    size: 1,
  },
  plugins: {
    theme: true,
    ripple: true,
    indicator: true,
    clickSound: false,
    logging: false,
    trail: true,
    say: true,
    speech: true,
  },
  rippleConfig: {
    color: '#000000',
    duration: 600,
    size: 50,
  },
  trailConfig: {
    length: 40,
    thickness: 20,
    color: '#0099ff',
    fadeDuration: 500,
  },
  clickSoundConfig: {
    volume: 0.5,
    soundUrl: '/click.mp3',
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
    case 'UPDATE_CLICKSOUND_CONFIG':
      return { ...state, clickSoundConfig: { ...state.clickSoundConfig, [action.key]: action.value } };
    default:
      return state;
  }
}

const BEGINNING_CURSOR_SIZE = 3;

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
        .setState({ size: settings.coreConfig.size })
        .until(
          () => {
            const prevBtn = document.querySelector('.carousel-prev');
            return prevBtn?.hasAttribute('disabled') || false;
          },
          (ctx) => ctx.click('.carousel-prev').wait(500),
        )
        .if(
          () =>
            document.querySelector<HTMLInputElement>('#demo-email')?.value !== 'hello@cursor.js',
          (ctx) =>
            ctx
              .hover('#demo-email')
              .say('Let me fill this out for you!', { duration: 2000, position: 'subtitle' })
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
        .say('And click submit!', { duration: 1500 })
        .wait(300)
        .click('#demo-submit')
        .wait(1000)
        .do(() => isActive && setSubmitted(true))
        .hover('.carousel-next')
        .wait(400)
        .click('.carousel-next')
        .wait(1000)
        .hover('#demo-accordion-1')
        .setState({ ripple: { color: '#10b98180' }, size: settings.coreConfig.size * 1.5 })
        .wait(400)
        .click('#demo-accordion-1')
        .setState({
          ripple: { color: settings.rippleConfig.color + '80' },
          size: settings.coreConfig.size,
        })
        .wait(1200)
        .hover('#demo-accordion-2')
        .wait(400)
        .click('#demo-accordion-2')
        .wait(1000)
        .hover('#cursor-beginning')
        .setState({ size: BEGINNING_CURSOR_SIZE })
        .do(() => {
          if (!isActive) return;
          setDemoState('done');
          setTimeout(() => isActive && setDemoState('idle'), 3000);
        })
        .do(buildDemoSequence); // Re-queue the scenario at the end
    };

    c.setState({ size: BEGINNING_CURSOR_SIZE }).move('#cursor-beginning').do(buildDemoSequence);

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

    const { coreConfig, plugins, rippleConfig, trailConfig, clickSoundConfig } = settings;

    c.setState({ humanize: coreConfig.humanize, speed: coreConfig.speed, size: coreConfig.size });

    if (plugins.theme) {
      c.use(
        new ThemePlugin({
          ...defaultTheme,

          default: {
            html: `

<svg width="26" height="30" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_114_46)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 18L0 0L6.62243 30L14.5 22L26 18Z" fill="#00FF26"/>
</g>
<path d="M24.9062 17.8506L14.3359 21.5273L14.2256 21.5664L14.1436 21.6494L6.91113 28.9932L0.762695 1.13574L24.9062 17.8506Z" stroke="#272727" stroke-miterlimit="16"/>
<defs>
<filter id="filter0_i_114_46" x="0" y="0" width="26" height="30" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_114_46"/>
</filter>
</defs>
</svg>



`,
            hotspot: 'top-left',
          },
          pointer: {
            html: `
<svg width="27" height="35" viewBox="0 0 27 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_120_46)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.09097 18.8824L5.683 16.7308C4.72163 15.2617 2.67384 14.7257 1.10747 15.5311L1.47245 15.3435C1.08372 15.5433 0.897322 16.0416 1.05737 16.4558L3.00632 21.4988C3.31528 22.2983 4.10437 23.429 4.75825 23.997C4.75825 23.997 8.679 27.2426 8.679 28.4595V30H15.0311H16.7681H18.2072H19.7952V28.4595C19.7952 27.2426 22.1913 23.4099 22.1913 23.4099C22.6324 22.6649 23 21.3524 23 20.4811V14.0729C22.9713 12.6541 21.7654 11.5043 20.2775 11.5043C19.5332 11.5043 18.9302 12.0792 18.9302 12.7889V13.3022C18.9302 11.8834 17.7244 10.7336 16.2365 10.7336C15.4921 10.7336 14.8892 11.3085 14.8892 12.0183V12.5316C14.8892 11.1128 13.6834 9.96296 12.1954 9.96296C11.4511 9.96296 10.8482 10.5379 10.8482 11.2476V11.7609C10.8482 11.5329 10.8238 11.3516 10.7767 11.208L10.3658 4.59016C10.3102 3.69527 9.55604 3 8.679 3C7.79584 3 7.09097 3.71094 7.09097 4.58793V10.9412V18.8824Z" fill="#00FF26"/>
<path d="M23.5 20.4814C23.4999 20.977 23.3975 21.5705 23.2432 22.127C23.0887 22.6838 22.871 23.2429 22.6211 23.665L22.6152 23.6748L22.6143 23.6777C22.6133 23.6793 22.6113 23.6814 22.6094 23.6846C22.6051 23.6915 22.5983 23.7022 22.5898 23.7158C22.5727 23.7435 22.5469 23.7851 22.5146 23.8379C22.4501 23.9435 22.3581 24.0963 22.2471 24.2832C22.0247 24.6577 21.7289 25.1686 21.4336 25.7158C21.1375 26.2647 20.8458 26.8427 20.6299 27.3525C20.4035 27.8872 20.2951 28.2683 20.2949 28.459V30.5H8.17871V28.459C8.17854 28.4263 8.16065 28.3279 8.06738 28.1494C7.97887 27.9801 7.84469 27.7795 7.6709 27.5547C7.32359 27.1055 6.85169 26.6042 6.36816 26.1289C5.88683 25.6558 5.40428 25.2179 5.04102 24.8984C4.85963 24.7389 4.70791 24.6091 4.60254 24.5195C4.55018 24.475 4.50927 24.4403 4.48145 24.417C4.4675 24.4053 4.45625 24.3965 4.44922 24.3906C4.44577 24.3878 4.44308 24.3852 4.44141 24.3838L4.43945 24.3828V24.3818L4.43066 24.375L4.75781 23.9971L4.43066 24.374C3.71457 23.752 2.87807 22.5534 2.54004 21.6787L0.59082 16.6357C0.391587 16.1199 0.531448 15.527 0.910156 15.1455L0.878906 15.0869L1.24414 14.8984L1.25391 14.9189C2.98426 14.2534 5.07454 14.8876 6.10156 16.457L6.59082 17.2041V4.58789C6.59084 3.4361 7.51833 2.50015 8.67871 2.5C9.81814 2.5 10.7932 3.39936 10.8652 4.55957L11.1865 9.75293C11.4791 9.56878 11.8271 9.46292 12.1953 9.46289C13.2956 9.46289 14.2794 10.0035 14.8555 10.834C15.1975 10.4634 15.6946 10.2334 16.2363 10.2334C17.3366 10.2334 18.3204 10.7741 18.8965 11.6045C19.2385 11.2339 19.7357 11.004 20.2773 11.0039C22.0211 11.0039 23.4653 12.3557 23.5 14.0625V20.4814Z" stroke="#363B3E"/>
</g>
<defs>
<filter id="filter0_d_120_46" x="-2.99983" y="0" width="29.9998" height="35" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="1"/>
<feGaussianBlur stdDeviation="1.5"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_120_46"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_120_46" result="shape"/>
</filter>
</defs>
</svg>
`,
            hotspot: {
              x: 10,
              y: 0,
            },
          },
        }),
      );
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
      c.removePlugin('ClickSoundPlugin');
      c.use(
        new ClickSoundPlugin({
          volume: clickSoundConfig.volume,
          soundUrl: clickSoundConfig.soundUrl,
        }),
      );
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

    if (plugins.say) {
      c.use(new SayPlugin());
    } else {
      c.removePlugin('say');
    }

    if (plugins.speech) {
      c.use(new SpeechPlugin({ enabled: true, voiceName: 'Google US English' }));
    } else {
      c.removePlugin('speech');
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
            <CardContent>
              {/* All Settings as Accordion */}
              <Accordion type="single" collapsible className="w-full">
                {/* General / Common Settings */}
                <AccordionItem value="general">
                  <SettingsAccordionTrigger>
                    <div className="flex items-center gap-1.5">General</div>
                  </SettingsAccordionTrigger>
                  <SettingsAccordionContent>
                    <div className="space-y-2 py-2 pt-2">
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <Label htmlFor="enable-humanize">humanize</Label>
                        <div className="flex items-center gap-1">
                          <Switch
                            id="enable-humanize"
                            checked={settings.coreConfig.humanize}
                            onCheckedChange={(checked) =>
                              dispatch({
                                type: 'UPDATE_CORE_CONFIG',
                                key: 'humanize',
                                value: checked,
                              })
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

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <Label htmlFor="core-size">size</Label>
                        <InputGroup className="h-7 w-24">
                          <InputGroupInput
                            id="core-size"
                            type="number"
                            min={0.1}
                            max={10}
                            step={0.1}
                            value={settings.coreConfig.size}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_CORE_CONFIG',
                                key: 'size',
                                value: Number(e.target.value),
                              })
                            }
                            className="h-7 text-right"
                          />
                          <InputGroupAddon align="inline-end">x</InputGroupAddon>
                        </InputGroup>
                      </div>
                    </div>
                  </SettingsAccordionContent>
                </AccordionItem>

                {/* Theme Plugin */}
                <AccordionItem value="theme" className="relative">
                  <SettingsAccordionTrigger hideIcon className="hover:no-underline">
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
                  </SettingsAccordionTrigger>
                  <div className="absolute right-0 top-4">
                    <Switch
                      id="enable-theme"
                      checked={settings.plugins.theme}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'theme', enabled: checked })
                      }
                    />
                  </div>
                </AccordionItem>

                {/* Trail Plugin */}
                <AccordionItem value="trail" className="relative">
                  <SettingsAccordionTrigger className="hover:no-underline">
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
                  </SettingsAccordionTrigger>
                  <div className="absolute right-0 top-4">
                    <Switch
                      id="enable-trail"
                      checked={settings.plugins.trail}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'trail', enabled: checked })
                      }
                    />
                  </div>
                  <SettingsAccordionContent>
                    <div className="space-y-2 py-2">
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
                    </div>
                  </SettingsAccordionContent>
                </AccordionItem>

                {/* Ripple Plugin */}
                <AccordionItem value="ripple" className="relative">
                  <SettingsAccordionTrigger className="hover:no-underline">
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
                  </SettingsAccordionTrigger>
                  <div className="absolute right-0 top-4">
                    <Switch
                      id="enable-ripple"
                      checked={settings.plugins.ripple}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'ripple', enabled: checked })
                      }
                    />
                  </div>
                  <SettingsAccordionContent>
                    <div className="space-y-2 py-2">
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
                    </div>
                  </SettingsAccordionContent>
                </AccordionItem>

                {/* Indicator Plugin */}
                <AccordionItem value="indicator" className="relative">
                  <SettingsAccordionTrigger hideIcon className="hover:no-underline">
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
                  </SettingsAccordionTrigger>
                  <div className="absolute right-0 top-4">
                    <Switch
                      id="enable-indicator"
                      checked={settings.plugins.indicator}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'indicator', enabled: checked })
                      }
                    />
                  </div>
                </AccordionItem>

                {/* ClickSound Plugin */}
                <AccordionItem value="clicksound" className="relative">
                  <SettingsAccordionTrigger className="hover:no-underline">
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
                  </SettingsAccordionTrigger>
                  <div className="absolute right-0 top-4">
                    <Switch
                      id="enable-clicksound"
                      checked={settings.plugins.clickSound}
                      onCheckedChange={(checked) =>
                        dispatch({
                          type: 'TOGGLE_PLUGIN',
                          plugin: 'clickSound',
                          enabled: checked,
                        })
                      }
                    />
                  </div>
                  <SettingsAccordionContent>
                    <div className="space-y-2 py-2">
                      <div className="flex flex-row items-center justify-between gap-2">
                        <Label htmlFor="clicksound-volume" className="text-xs font-normal">
                          volume
                        </Label>
                        <InputGroup className="h-7 w-24">
                          <InputGroupInput
                            id="clicksound-volume"
                            type="number"
                            min={0}
                            max={1}
                            step={0.1}
                            value={settings.clickSoundConfig.volume}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_CLICKSOUND_CONFIG',
                                key: 'volume',
                                value: Number(e.target.value),
                              })
                            }
                          />
                        </InputGroup>
                      </div>
                      <div className="flex flex-row items-center justify-between gap-2">
                        <Label htmlFor="clicksound-url" className="text-xs font-normal">
                          soundUrl
                        </Label>
                        <InputGroup className="h-7 w-full max-w-[12rem]">
                          <InputGroupInput
                            id="clicksound-url"
                            type="text"
                            value={settings.clickSoundConfig.soundUrl}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_CLICKSOUND_CONFIG',
                                key: 'soundUrl',
                                value: e.target.value,
                              })
                            }
                          />
                        </InputGroup>
                      </div>
                    </div>
                  </SettingsAccordionContent>
                </AccordionItem>

                {/* Say Plugin */}
                <AccordionItem value="say" className="relative">
                  <SettingsAccordionTrigger hideIcon className="hover:no-underline">
                    <div className="flex items-center gap-1.5">Say (Speech Bubble)</div>
                  </SettingsAccordionTrigger>
                  <div className="absolute right-0 top-4">
                    <Switch
                      id="enable-say"
                      checked={settings.plugins.say}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'say', enabled: checked })
                      }
                    />
                  </div>
                </AccordionItem>

                {/* Speech Plugin */}
                <AccordionItem value="speech" className="relative">
                  <SettingsAccordionTrigger hideIcon className="hover:no-underline">
                    <div className="flex items-center gap-1.5">Speech (Web Speech API)</div>
                  </SettingsAccordionTrigger>
                  <div className="absolute right-0 top-4">
                    <Switch
                      id="enable-speech"
                      checked={settings.plugins.speech}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'speech', enabled: checked })
                      }
                    />
                  </div>
                </AccordionItem>

                {/* Logging Plugin */}
                <AccordionItem value="logging" className="relative">
                  <SettingsAccordionTrigger hideIcon className="hover:no-underline">
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
                  </SettingsAccordionTrigger>
                  <div className="absolute right-0 top-4">
                    <Switch
                      id="enable-logging"
                      checked={settings.plugins.logging}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'TOGGLE_PLUGIN', plugin: 'logging', enabled: checked })
                      }
                    />
                  </div>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
