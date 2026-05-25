'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const CodeEditor = dynamic(
  () => import('@uiw/react-textarea-code-editor').then((mod) => mod.default),
  { ssr: false },
);

import {
  Cursor,
  ThemePlugin,
  IndicatorPlugin,
  RipplePlugin,
  SoundPlugin,
  LoggingPlugin,
  SayPlugin,
  PromptPlugin,
  SpeechPlugin,
} from '@cursor.js/core';
import {
  TrailPlugin,
  ParticlePlugin,
  GeminiTTSPlugin,
  OutlinePlugin,
  FloatingPlugin,
  SpotlightPlugin,
  WaitForUserPlugin,
} from '@cursor.js/pro';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Info, Gem, Play, Pause, RotateCcw, Copy, Check, Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import {
  SettingsAccordionTrigger,
  SettingsAccordionContent,
} from '@/components/app/settings-accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Comet } from '@/components/app/comet';
import { BackgroundStars } from '@/components/app/background-stars';
import { CursorPlayer } from '../../../registry/default/cursor-player/cursor-player';
import { ThemeCursorPicker } from '@/components/app/theme-cursor-picker';
import {
  buildThemePackFromSelection,
  initialThemeCursorSelection,
  initialThemePresetSelection,
  type ThemeCursorPresetSelection,
  type ThemeCursorSelection,
} from '@/lib/theme-cursors';
import { normalizePluginToggleState } from '@/lib/plugin-settings';

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
    sound: boolean;
    logging: boolean;
    trail: boolean;
    particle: boolean;
    say: boolean;
    prompt: boolean;
    speech: boolean;
    geminiTts: boolean;
    outline: boolean;
    floating: boolean;
    spotlight: boolean;
    waitForUser: boolean;
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
  particleConfig: {
    size: number;
    color: string;
    duration: number;
    particleCount: number;
    scatterDistance: number;
  };
  soundConfig: {
    volume: number;
    clickSoundUrl: string;
    typingSoundUrl: string;
  };
  themeConfig: {
    cursorSelection: ThemeCursorSelection;
    presetSelection: ThemeCursorPresetSelection;
  };
  geminiTtsConfig: {
    speaker: string;
    language: string;
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
      type: 'UPDATE_PARTICLE_CONFIG';
      key: keyof SettingsState['particleConfig'];
      value: string | number;
    }
  | {
      type: 'UPDATE_SOUND_CONFIG';
      key: keyof SettingsState['soundConfig'];
      value: string | number;
    }
  | { type: 'UPDATE_THEME_CURSOR'; slot: keyof ThemeCursorSelection; value: string }
  | { type: 'UPDATE_THEME_PRESET'; slot: keyof ThemeCursorPresetSelection; value: string }
  | {
      type: 'UPDATE_GEMINI_TTS_CONFIG';
      key: keyof SettingsState['geminiTtsConfig'];
      value: string;
    };

const initialSettings: SettingsState = {
  coreConfig: {
    humanize: true,
    speed: 0.7,
    size: 1,
  },
  plugins: {
    theme: true,
    ripple: false,
    indicator: true,
    sound: true,
    logging: false,
    trail: true,
    particle: true,
    say: true,
    prompt: true,
    speech: false,
    geminiTts: true,
    outline: true,
    floating: true,
    spotlight: true,
    waitForUser: true,
  },
  rippleConfig: {
    color: '#000000',
    duration: 600,
    size: 50,
  },
  trailConfig: {
    length: 40,
    thickness: 7,
    color: '#0099ff',
    fadeDuration: 500,
  },
  particleConfig: {
    size: 6,
    color: '#0099ff',
    duration: 600,
    particleCount: 5,
    scatterDistance: 30,
  },
  soundConfig: {
    volume: 0.5,
    clickSoundUrl: '/click.mp3',
    typingSoundUrl: '/typing.mp3',
  },
  themeConfig: {
    cursorSelection: initialThemeCursorSelection,
    presetSelection: initialThemePresetSelection,
  },
  geminiTtsConfig: {
    speaker: 'Achernar',
    language: 'en',
  },
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'TOGGLE_PLUGIN':
      return {
        ...state,
        plugins: normalizePluginToggleState(state.plugins, action.plugin, action.enabled),
      };
    case 'UPDATE_CORE_CONFIG':
      return { ...state, coreConfig: { ...state.coreConfig, [action.key]: action.value } };
    case 'UPDATE_RIPPLE_CONFIG':
      return { ...state, rippleConfig: { ...state.rippleConfig, [action.key]: action.value } };
    case 'UPDATE_TRAIL_CONFIG':
      return { ...state, trailConfig: { ...state.trailConfig, [action.key]: action.value } };
    case 'UPDATE_PARTICLE_CONFIG':
      return { ...state, particleConfig: { ...state.particleConfig, [action.key]: action.value } };
    case 'UPDATE_SOUND_CONFIG':
      return {
        ...state,
        soundConfig: { ...state.soundConfig, [action.key]: action.value },
      };
    case 'UPDATE_THEME_CURSOR':
      return {
        ...state,
        themeConfig: {
          ...state.themeConfig,
          cursorSelection: {
            ...state.themeConfig.cursorSelection,
            [action.slot]: action.value,
          },
        },
      };
    case 'UPDATE_THEME_PRESET':
      return {
        ...state,
        themeConfig: {
          ...state.themeConfig,
          presetSelection: {
            ...state.themeConfig.presetSelection,
            [action.slot]: action.value,
          },
        },
      };
    case 'UPDATE_GEMINI_TTS_CONFIG':
      return {
        ...state,
        geminiTtsConfig: { ...state.geminiTtsConfig, [action.key]: action.value },
      };
    default:
      return state;
  }
}

const BEGINNING_CURSOR_SIZE = 1;
const initialTodos = [
  { id: 1, text: 'Learn Cursor.js', completed: false },
  { id: 2, text: 'Star on GitHub', completed: false },
];

type FeedbackIntent = 'yes' | 'no';
type FeedbackSentiment = 'love' | 'hate';

export function ClientPage({ hasSubmittedFeedback = false }: { hasSubmittedFeedback?: boolean }) {
  // Todo state
  const [todos, setTodos] = useState(initialTodos);
  const [todoInput, setTodoInput] = useState('');
  const [recentlyAddedTodoId, setRecentlyAddedTodoId] = useState<number | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const feedbackIntentRef = useRef<FeedbackIntent | null>(null);
  const feedbackSentimentRef = useRef<FeedbackSentiment | null>(null);
  const feedbackSubmittedRef = useRef(false);

  const addTodo = () => {
    const text = todoInput.trim();

    if (text) {
      setTodos((currentTodos) => {
        const nextId = currentTodos.reduce((maxId, todo) => Math.max(maxId, todo.id), 0) + 1;
        setRecentlyAddedTodoId(nextId);
        window.setTimeout(() => {
          setRecentlyAddedTodoId((currentId) => (currentId === nextId ? null : currentId));
        }, 900);
        return [...currentTodos, { id: nextId, text, completed: false }];
      });
      setTodoInput('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );
  };

  const deleteTodo = (id: number) => {
    setDeletingTodoId(id);
    window.setTimeout(() => {
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
      setDeletingTodoId((currentId) => (currentId === id ? null : currentId));
    }, 260);
  };

  const launchDemoConfetti = () => {
    const colors = ['#f97316', '#22c55e', '#3b82f6', '#facc15', '#ec4899'];

    for (let index = 0; index < 48; index += 1) {
      const piece = document.createElement('span');
      const size = 6 + Math.random() * 8;
      const x = 35 + Math.random() * 30;
      const fall = 42 + Math.random() * 34;
      const drift = -140 + Math.random() * 280;
      const rotate = Math.random() * 720 - 360;

      piece.style.setProperty('--confetti-x', `${x}vw`);
      piece.style.setProperty('--confetti-fall', `${fall}vh`);
      piece.style.setProperty('--confetti-drift', `${drift}px`);
      piece.style.setProperty('--confetti-rotate', `${rotate}deg`);
      Object.assign(piece.style, {
        position: 'fixed',
        left: 'var(--confetti-x)',
        top: '18vh',
        width: `${size}px`,
        height: `${size * 1.5}px`,
        background: colors[index % colors.length],
        borderRadius: '2px',
        pointerEvents: 'none',
        zIndex: '100002',
        animation: `cursor-demo-confetti ${900 + Math.random() * 700}ms ease-out forwards`,
      });

      document.body.appendChild(piece);
      window.setTimeout(() => piece.remove(), 1800);
    }
  };

  // Sandbox state
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html>
<body>
  <div style="display: flex; gap: 10px; padding: 20px;">
    <button id="btn1" style="padding: 8px 16px;">Button 1</button>
    <button id="btn2" style="padding: 8px 16px;">Button 2</button>
  </div>
</body>
</html>`);

  const [jsCode, setJsCode] = useState(`import { Cursor } from 'https://esm.sh/@cursor.js/core';

// This is a basic example using ESM!
const c = new Cursor();
c.move('#btn1')
 .wait(500)
 .click('#btn1')
 .wait(500)
 .move('#btn2')
 .wait(500)
 .click('#btn2');
`);
  const [activeTab, setActiveTab] = useState<'html' | 'js'>('html');
  const [sandboxSrcDoc, setSandboxSrcDoc] = useState('');

  const runSandbox = useCallback(() => {
    let bodyContent = htmlCode;
    const bodyMatch = htmlCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      bodyContent = bodyMatch[1];
    }
    const srcDocString = `<!DOCTYPE html>
<html>
<head>
  <style>body { font-family: sans-serif; }</style>
</head>
<body>
  ${bodyContent}
  <script>
    const originalFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function(options) {
      return originalFocus.call(this, { preventScroll: true, ...options });
    };
  </script>
  <script type="module">
    ${jsCode}
  </script>
</body>
</html>`;
    setSandboxSrcDoc(srcDocString);
  }, [htmlCode, jsCode]);

  useEffect(() => {
    const timerId = window.setTimeout(runSandbox, 0);

    return () => window.clearTimeout(timerId);
  }, [runSandbox]);

  // Consolidated settings state via useReducer
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  const resetDemoUi = () => {
    setTodos(initialTodos);
    setTodoInput('');
    setRecentlyAddedTodoId(null);
    setDeletingTodoId(null);
    feedbackIntentRef.current = null;
    feedbackSentimentRef.current = null;
    feedbackSubmittedRef.current = false;
  };

  const createHomeDemoCursor = (anchorElement: HTMLElement) => {
    const cursor = new Cursor({
      humanize: settings.coreConfig.humanize,
      speed: settings.coreConfig.speed,
      startPoint: anchorElement,
    });

    const { coreConfig, plugins, rippleConfig, trailConfig, soundConfig, geminiTtsConfig } =
      settings;

    cursor.setState({
      humanize: coreConfig.humanize,
      speed: coreConfig.speed,
      size: BEGINNING_CURSOR_SIZE,
    });

    if (plugins.theme) {
      cursor.use(
        new ThemePlugin(
          buildThemePackFromSelection(
            settings.themeConfig.cursorSelection,
            settings.themeConfig.presetSelection,
          ),
        ),
      );
    }

    if (plugins.indicator) {
      cursor.use(new IndicatorPlugin());
    }

    if (plugins.logging) {
      cursor.use(new LoggingPlugin());
    }

    if (plugins.sound) {
      cursor.use(
        new SoundPlugin({
          volume: soundConfig.volume,
          clickSoundUrl: soundConfig.clickSoundUrl,
          typingSoundUrl: soundConfig.typingSoundUrl,
        }),
      );
    }

    if (plugins.ripple) {
      cursor.use(
        new RipplePlugin({
          color: `${rippleConfig.color}80`,
          duration: rippleConfig.duration,
          size: rippleConfig.size,
        }),
      );
    }

    if (plugins.trail) {
      cursor.use(
        new TrailPlugin({
          color: trailConfig.color,
          fadeDuration: trailConfig.fadeDuration,
          thickness: trailConfig.thickness,
          length: trailConfig.length,
        }),
      );
    }

    if (plugins.particle) {
      cursor.use(
        new ParticlePlugin({
          size: settings.particleConfig.size,
          color: settings.particleConfig.color,
          duration: settings.particleConfig.duration,
          particleCount: settings.particleConfig.particleCount,
          scatterDistance: settings.particleConfig.scatterDistance,
        }),
      );
    }

    if (plugins.floating) {
      cursor.use(new FloatingPlugin());
    }

    if (plugins.prompt) {
      cursor.use(new PromptPlugin());
    }

    if (plugins.say) {
      cursor.use(new SayPlugin());
    }

    if (plugins.speech) {
      cursor.use(new SpeechPlugin({ enabled: true, voiceName: 'Google US English' }));
    }

    if (plugins.geminiTts) {
      cursor.use(
        new GeminiTTSPlugin({
          speaker: geminiTtsConfig.speaker,
          language: geminiTtsConfig.language,
          model: 'gemini-3.1-flash-tts-preview',
          style: 'Read aloud in a warm, welcoming tone.',
        }),
      );
    }

    if (plugins.outline) {
      cursor.use(new OutlinePlugin());
    }

    if (plugins.spotlight) {
      cursor.use(new SpotlightPlugin());
    }

    if (plugins.waitForUser) {
      cursor.use(new WaitForUserPlugin());
    }

    return cursor;
  };

  const buildHomeDemoSequence = (cursor: ReturnType<typeof createHomeDemoCursor>) => {
    const hasSay = settings.plugins.say;
    const hasPrompt = settings.plugins.prompt;
    const hasOutline = () => settings.plugins.outline;
    const hasSpotlight = settings.plugins.spotlight;
    const hasWaitForUser = settings.plugins.waitForUser;

    let sequence = cursor.wait(500).setState({ size: settings.coreConfig.size }).do(resetDemoUi);

    if (hasSay) {
      sequence = sequence.say(
        "Let's take a tour together. In this tour, I will introduce you to cursor.js, which is me.",
        {
          position: 'subtitle',
        },
      );
    }

    sequence
      .if(hasOutline, (ctx) =>
        (
          ctx as Cursor & {
            outlineCircle: (
              target: string,
              options: { duration: number; loopCount: number },
            ) => Cursor;
          }
        ).outlineCircle('#hero-title', {
          duration: 1500,
          loopCount: 1,
        }),
      )
      .wait(1000)
      .if(
        () => hasSay,
        (ctx) =>
          ctx.say('I can move like a human and present product demos for visitors on your site.', {
            position: 'subtitle',
          }),
      )
      .hover('#example-app-title')
      .if(
        () => hasSay,
        (ctx) =>
          ctx.say('Now I will show how a TODO app works as an example.', {
            position: 'subtitle',
          }),
      )
      .if(hasOutline, (ctx) =>
        (
          ctx as Cursor & {
            outlineUnderline: (
              target: string,
              options: { duration: number; loopCount: number },
            ) => Cursor;
          }
        )
          .outlineUnderline('#example-app-title', { duration: 1200, loopCount: 1 })
          .wait(300),
      )
      .hover('#todo-input')
      .if(
        () => hasSay,
        (ctx) =>
          ctx.say("Now let's add a task to our TODO list.", {
            position: 'subtitle',
          }),
      )
      .do(() => setTodoInput(''))
      .type('#todo-input', 'Prepare launch checklist')
      .wait(200)
      .hover('#todo-add')
      .click('#todo-add')
      .wait(1000)
      .if(
        () => hasSay,
        (ctx) =>
          ctx.say("Now let's mark a task we added earlier as completed.", {
            position: 'subtitle',
          }),
      )
      .hover('#todo-check-1')
      .click('#todo-check-1')
      .wait(1000)
      .if(
        () => hasSay,
        (ctx) =>
          ctx.say("Now let's delete a task from our TODO list.", {
            position: 'subtitle',
          }),
      )
      .hover('.todo-item-2')
      .if(hasOutline, (ctx) =>
        (
          ctx as Cursor & {
            outlineUnderline: (
              target: string,
              options: { duration: number; loopCount: number },
            ) => Cursor;
          }
        )
          .outlineUnderline('.todo-item-2', { duration: 1000 })
          .wait(300),
      )
      .hover('#todo-delete-2')
      .wait(300)
      .click('#todo-delete-2')
      .wait(1000)
      .if(
        () => hasWaitForUser,
        (ctx) =>
          (
            ctx as Cursor & {
              waitForUser: (options: {
                target: string;
                event: string;
                message: string;
                spotlight: boolean;
                backdrop: boolean;
                pauseEffects: boolean;
                speak: boolean;
                resumeLabel: string;
              }) => Cursor;
            }
          ).waitForUser({
            target: '#todo-check-3',
            event: 'change',
            message: 'Now it is your turn. Mark a task as completed.',
            spotlight: hasSpotlight,
            backdrop: hasSpotlight,
            pauseEffects: true,
            speak: true,
            resumeLabel: 'Skip',
          }),
      )
      .if(
        () => !hasWaitForUser,
        (ctx) => ctx.hover('#todo-check-3').wait(300).click('#todo-check-3'),
      )
      .wait(800)
      .if(
        () => hasSay,
        (ctx) =>
          ctx.say('Great. Everything is exactly as it should be.', {
            position: 'subtitle',
          }),
      )
      .hover('#example-app-title')
      .if(
        () => hasPrompt && !hasSubmittedFeedback,
        (ctx) =>
          ctx.prompt(
            'Would you like to go to Love it or Hate it and leave a comment about cursor.js?',
            {
              position: 'center',
              buttons: [
                {
                  label: 'Yes',
                  onClick: () => {
                    feedbackIntentRef.current = 'yes';
                  },
                  type: 'primary',
                },
                {
                  label: 'No',
                  onClick: () => {
                    feedbackIntentRef.current = 'no';
                  },
                  type: 'secondary',
                },
              ],
            },
          ),
      )
      .if(
        () => hasPrompt && !hasSubmittedFeedback && feedbackIntentRef.current === 'yes',
        (ctx) =>
          ctx
            .do(() =>
              document.querySelector('#feedback-section')?.scrollIntoView({ behavior: 'smooth' }),
            )
            .wait(900)
            .hover('#feedback-section'),
      )
      .if(
        () =>
          hasPrompt && !hasSubmittedFeedback && feedbackIntentRef.current === 'yes' && hasSpotlight,
        (ctx) =>
          ctx
            .do(() => {
              const plugin = cursor.getPlugin('spotlight');
              if (plugin instanceof SpotlightPlugin) {
                plugin.show('#feedback-love', {
                  backdrop: true,
                  padding: 10,
                  borderRadius: 12,
                });
              }
            })
            .wait(1500)
            .do(() => {
              const plugin = cursor.getPlugin('spotlight');
              if (plugin instanceof SpotlightPlugin) {
                plugin.show('#feedback-hate', {
                  backdrop: true,
                  padding: 10,
                  borderRadius: 12,
                });
              }
            })
            .wait(1500)
            .do(() => {
              const plugin = cursor.getPlugin('spotlight');
              if (plugin instanceof SpotlightPlugin) {
                plugin.hide();
              }
            }),
      )
      .if(
        () =>
          hasPrompt &&
          !hasSubmittedFeedback &&
          feedbackIntentRef.current === 'yes' &&
          hasWaitForUser,
        (ctx) =>
          (
            ctx as Cursor & {
              waitForUser: (options: {
                target: string;
                event: string;
                message: string;
                spotlight: boolean;
                backdrop: boolean;
                pauseEffects: boolean;
                speak: boolean;
                resumeLabel: string;
                onResume: (result: { event?: Event }) => void;
              }) => Cursor;
            }
          ).waitForUser({
            target: '#feedback-love, #feedback-hate',
            event: 'click',
            message: 'Choose Love it or Hate it to continue.',
            spotlight: false,
            backdrop: false,
            pauseEffects: true,
            speak: true,
            resumeLabel: 'Skip',
            onResume: (result) => {
              const target = result.event?.target;
              if (!(target instanceof Element)) return;

              const button = target.closest('#feedback-love, #feedback-hate');
              if (!(button instanceof HTMLElement)) return;

              feedbackSentimentRef.current = button.id === 'feedback-love' ? 'love' : 'hate';
            },
          }),
      )
      .if(
        () =>
          hasPrompt &&
          !hasSubmittedFeedback &&
          feedbackIntentRef.current === 'yes' &&
          hasWaitForUser,
        (ctx) =>
          (
            ctx as Cursor & {
              waitForUser: (options: {
                target: string;
                event: string;
                message: string;
                spotlight: boolean;
                backdrop: boolean;
                pauseEffects: boolean;
                speak: boolean;
                resumeLabel: string;
                onResume: () => void;
              }) => Cursor;
            }
          ).waitForUser({
            target: '#feedback-submit',
            event: 'click',
            message: 'Submit your feedback to finish the demo.',
            spotlight: hasSpotlight,
            backdrop: hasSpotlight,
            pauseEffects: true,
            speak: true,
            resumeLabel: 'Skip',
            onResume: () => {
              feedbackSubmittedRef.current = true;
              launchDemoConfetti();
            },
          }),
      )
      .if(
        () =>
          hasPrompt &&
          !hasSubmittedFeedback &&
          feedbackIntentRef.current === 'yes' &&
          !hasWaitForUser,
        (ctx) =>
          ctx
            .hover('#feedback-love')
            .wait(500)
            .click('#feedback-love')
            .type('#feedback-message', 'This demo feels polished.')
            .hover('#feedback-submit')
            .click('#feedback-submit')
            .do(() => {
              feedbackSentimentRef.current = 'love';
              feedbackSubmittedRef.current = true;
              launchDemoConfetti();
            }),
      )
      .if(
        () => hasSay && feedbackSubmittedRef.current && feedbackSentimentRef.current === 'love',
        (ctx) =>
          ctx.say('We are so glad you liked it. Yayyy!', {
            position: 'subtitle',
          }),
      )
      .if(
        () => hasSay && feedbackSubmittedRef.current && feedbackSentimentRef.current === 'hate',
        (ctx) =>
          ctx.say(
            'We are sorry you did not like it. You can be sure we will take your feedback seriously.',
            {
              position: 'subtitle',
            },
          ),
      )
      .wait(800)
      .if(
        () => hasSay,
        (ctx) =>
          ctx.say('The demo has ended here. You can explore the rest of the site to learn more.', {
            position: 'subtitle',
          }),
      );
  };

  const homePlayerKey = JSON.stringify(settings);

  const [copiedNpm, setCopiedNpm] = useState(false);
  const [copiedNpx, setCopiedNpx] = useState(false);

  const handleCopy = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-hidden">
      <style>{`
        @keyframes cursor-demo-confetti {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--confetti-drift), var(--confetti-fall), 0)
              rotate(var(--confetti-rotate));
          }
        }

        @keyframes todo-item-enter {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
            background: rgba(34, 197, 94, 0.14);
          }
          60% {
            opacity: 1;
            transform: translateY(0) scale(1);
            background: rgba(34, 197, 94, 0.14);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            background: transparent;
          }
        }

        @keyframes todo-item-delete {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
            max-height: 48px;
          }
          100% {
            opacity: 0;
            transform: translateX(18px) scale(0.98);
            max-height: 0;
            margin-top: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none z-0">
        <BackgroundStars count={50} />
      </div>
      <main className="flex-1 relative z-10">
        <section className="container mx-auto flex flex-col items-center justify-center space-y-6 pt-24 pb-8 md:pt-7 text-center px-6">
          <div className="flex flex-col items-center space-y-8">
            <CursorPlayer
              key={homePlayerKey}
              createCursor={createHomeDemoCursor}
              buildSequence={buildHomeDemoSequence}
            >
              <div className="flex flex-col items-center space-y-8">
                <CursorPlayer.Status>
                  {({ state }) => (
                    <div className="relative h-26 w-20">
                      <Comet angle={55} isVisible={state === 'idle' || state === 'error'} />
                      <CursorPlayer.Cursor id="cursor-beginning" className="h-26 w-20" />
                    </div>
                  )}
                </CursorPlayer.Status>
                <h1
                  id="hero-title"
                  className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl mb-4"
                >
                  cursor.js
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Open source cursor automation for polished product demos and guided UX flows.
                  Human-like motion, programmable by design.
                </p>
                <div className="mt-4 flex w-full justify-center">
                  <div className="z-[50] flex items-center gap-2 rounded-full border bg-background/80 p-2 shadow-lg backdrop-blur-lg">
                    <CursorPlayer.PlayPause size="sm" variant="default" className="rounded-full">
                      <CursorPlayer.PlayIcon asChild>
                        <Play className="mr-2 h-4 w-4" />
                      </CursorPlayer.PlayIcon>
                      <CursorPlayer.PauseIcon asChild>
                        <Pause className="mr-2 h-4 w-4" />
                      </CursorPlayer.PauseIcon>
                      <span>Run Live Demo</span>
                    </CursorPlayer.PlayPause>
                    <CursorPlayer.Status>
                      {({ state }) => (
                        <div
                          data-state={state}
                          className="contents data-[state=idle]:hidden data-[state=error]:hidden"
                        >
                          <CursorPlayer.StopButton
                            variant="destructive"
                            size="icon"
                            className="rounded-full"
                            onClick={resetDemoUi}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </CursorPlayer.StopButton>
                          <div className="mx-1 h-6 w-px bg-border" />
                        </div>
                      )}
                    </CursorPlayer.Status>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="z-[99999] w-[350px] p-0 sm:w-[400px]">
                        <SheetHeader className="p-4 pb-0 text-left">
                          <SheetTitle>Cursor Settings</SheetTitle>
                        </SheetHeader>
                        <div className="overflow-y-auto flex flex-col p-4">
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
                              <SettingsAccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Theme
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
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'theme',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                              <SettingsAccordionContent>
                                <ThemeCursorPicker
                                  selection={settings.themeConfig.cursorSelection}
                                  presets={settings.themeConfig.presetSelection}
                                  onSelectCursor={(slot, value) =>
                                    dispatch({ type: 'UPDATE_THEME_CURSOR', slot, value })
                                  }
                                  onSelectPreset={(slot, value) =>
                                    dispatch({ type: 'UPDATE_THEME_PRESET', slot, value })
                                  }
                                  disabled={!settings.plugins.theme}
                                />
                              </SettingsAccordionContent>
                            </AccordionItem>

                            {/* Gemini TTS Plugin */}
                            <AccordionItem value="geminitTts" className="relative">
                              <SettingsAccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Gemini TTS
                                  <span title="Pro" className="flex items-center">
                                    <Gem className="w-4 h-4 text-orange-500" />
                                  </span>
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] p-4 text-sm"
                                    >
                                      <p>
                                        Generates high-quality human voice using Google Gemini TTS.
                                      </p>
                                      <p className="mt-2 font-medium">
                                        Notice the &apos;cursor-js-tts-loading&apos; class is
                                        applied while the audio is generating!
                                      </p>
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-gemini-tts"
                                  checked={settings.plugins.geminiTts}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'geminiTts',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                              <SettingsAccordionContent>
                                <div className="space-y-2 py-2">
                                  <div className="flex flex-row items-center justify-between gap-2">
                                    <Label htmlFor="gemini-speaker" className="text-xs font-normal">
                                      Speaker Model
                                    </Label>
                                    <Select
                                      value={settings.geminiTtsConfig.speaker}
                                      onValueChange={(value) =>
                                        dispatch({
                                          type: 'UPDATE_GEMINI_TTS_CONFIG',
                                          key: 'speaker',
                                          value: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger
                                        id="gemini-speaker"
                                        className="h-7 w-32 text-xs"
                                      >
                                        <SelectValue placeholder="Select Speaker" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Achernar">Achernar</SelectItem>
                                        <SelectItem value="Achird">Achird</SelectItem>
                                        <SelectItem value="Algenib">Algenib</SelectItem>
                                        <SelectItem value="Algieba">Algieba</SelectItem>
                                        <SelectItem value="Alnilam">Alnilam</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex flex-row items-center justify-between gap-2 mt-2">
                                    <Label
                                      htmlFor="gemini-language"
                                      className="text-xs font-normal text-muted-foreground"
                                    >
                                      Language
                                    </Label>
                                    <Input
                                      id="gemini-language"
                                      className="h-7 w-32 border-none bg-transparent shadow-none px-2 focus-visible:ring-0 text-xs opacity-50 cursor-not-allowed"
                                      value={settings.geminiTtsConfig.language}
                                      disabled
                                    />
                                  </div>
                                  <div className="flex flex-row items-center justify-between gap-2 mt-2">
                                    <Label
                                      htmlFor="gemini-model"
                                      className="text-xs font-normal text-muted-foreground"
                                    >
                                      Model
                                    </Label>
                                    <Input
                                      id="gemini-model"
                                      className="h-7 w-48 border-none bg-transparent shadow-none px-2 focus-visible:ring-0 text-xs opacity-50 cursor-not-allowed"
                                      value="gemini-3.1-flash-tts-preview"
                                      disabled
                                    />
                                  </div>
                                  <div className="flex flex-row items-center justify-between gap-2 mt-2">
                                    <Label
                                      htmlFor="gemini-style"
                                      className="text-xs font-normal text-muted-foreground"
                                    >
                                      Style
                                    </Label>
                                    <Input
                                      id="gemini-style"
                                      className="h-7 w-48 border-none bg-transparent shadow-none px-2 focus-visible:ring-0 text-xs opacity-50 cursor-not-allowed text-ellipsis overflow-hidden"
                                      value="Read aloud in a warm, welcoming tone."
                                      disabled
                                    />
                                  </div>
                                </div>
                              </SettingsAccordionContent>
                            </AccordionItem>

                            {/* Floating Plugin */}
                            <AccordionItem value="floating" className="relative">
                              <SettingsAccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Floating
                                  <span title="Pro" className="flex items-center">
                                    <Gem className="w-4 h-4 text-orange-500" />
                                  </span>
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="z-[9999999] w-[320px] rounded-lg border bg-background p-4 text-sm shadow-md"
                                    >
                                      <p>
                                        Shared Floating UI positioning for <code>.say()</code>,{' '}
                                        <code>.prompt()</code>, and <code>.waitForUser()</code>.
                                      </p>
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-floating"
                                  checked={settings.plugins.floating}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'floating',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                              <SettingsAccordionContent>
                                <div className="space-y-2 py-2">
                                  <p className="text-xs text-muted-foreground">
                                    Enables Floating UI collision-aware positioning for any enabled{' '}
                                    <code>SayPlugin</code>, <code>PromptPlugin</code>, or{' '}
                                    <code>WaitForUserPlugin</code> instances.
                                  </p>
                                </div>
                              </SettingsAccordionContent>
                            </AccordionItem>

                            {/* Outline Plugin */}
                            <AccordionItem value="outline" className="relative">
                              <SettingsAccordionTrigger className="w-full pr-12 hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Outline
                                  <span title="Pro" className="flex items-center">
                                    <Gem className="w-4 h-4 text-orange-500" />
                                  </span>
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] p-4 text-sm"
                                    >
                                      <p>
                                        Generates smooth orbiting animations around target elements,
                                        making your demos more engaging.
                                      </p>
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-outline"
                                  checked={settings.plugins.outline}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'outline',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                              <SettingsAccordionContent>
                                <div className="space-y-2 py-2">
                                  <p className="text-xs text-muted-foreground">
                                    Used programmatically via{' '}
                                    <code>.outlineCircle(selector, options)</code>.
                                  </p>
                                </div>
                              </SettingsAccordionContent>
                            </AccordionItem>

                            {/* Trail Plugin */}
                            <AccordionItem value="trail" className="relative">
                              <SettingsAccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Trail
                                  <span title="Pro" className="flex items-center">
                                    <Gem className="w-4 h-4 text-orange-500" />
                                  </span>
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
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'trail',
                                      enabled: checked,
                                    })
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
                                    <Label
                                      htmlFor="trail-thickness"
                                      className="text-xs font-normal"
                                    >
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

                            {/* Particle Plugin */}
                            <AccordionItem value="particle" className="relative">
                              <SettingsAccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Particle
                                  <span title="Pro" className="flex items-center">
                                    <Gem className="w-4 h-4 text-orange-500" />
                                  </span>
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                                    >
                                      <iframe
                                        src="/demos/particle"
                                        className="w-full h-full border-0 overflow-hidden"
                                        scrolling="no"
                                      />
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-particle"
                                  checked={settings.plugins.particle}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'particle',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                              <SettingsAccordionContent>
                                <div className="space-y-2 py-2">
                                  <div className="flex flex-row items-center justify-between gap-2">
                                    <Label htmlFor="particle-size" className="text-xs font-normal">
                                      size
                                    </Label>
                                    <InputGroup className="h-7 w-24">
                                      <InputGroupInput
                                        id="particle-size"
                                        type="number"
                                        min={1}
                                        max={20}
                                        step={1}
                                        value={settings.particleConfig.size}
                                        onChange={(e) =>
                                          dispatch({
                                            type: 'UPDATE_PARTICLE_CONFIG',
                                            key: 'size',
                                            value: Number(e.target.value),
                                          })
                                        }
                                      />
                                      <InputGroupAddon align="inline-end">px</InputGroupAddon>
                                    </InputGroup>
                                  </div>
                                  <div className="flex flex-row items-center justify-between gap-2">
                                    <Label htmlFor="particle-color" className="text-xs font-normal">
                                      color
                                    </Label>
                                    <InputGroup className="h-7 w-28">
                                      <InputGroupInput
                                        className="w-10"
                                        id="particle-color"
                                        type="color"
                                        value={settings.particleConfig.color}
                                        onChange={(e) =>
                                          dispatch({
                                            type: 'UPDATE_PARTICLE_CONFIG',
                                            key: 'color',
                                            value: e.target.value,
                                          })
                                        }
                                      />
                                      <InputGroupAddon align="inline-end">
                                        {settings.particleConfig.color}
                                      </InputGroupAddon>
                                    </InputGroup>
                                  </div>
                                  <div className="flex flex-row items-center justify-between gap-2">
                                    <Label
                                      htmlFor="particle-duration"
                                      className="text-xs font-normal"
                                    >
                                      duration
                                    </Label>
                                    <InputGroup className="h-7 w-24">
                                      <InputGroupInput
                                        id="particle-duration"
                                        type="number"
                                        min={100}
                                        max={2000}
                                        step={100}
                                        value={settings.particleConfig.duration}
                                        onChange={(e) =>
                                          dispatch({
                                            type: 'UPDATE_PARTICLE_CONFIG',
                                            key: 'duration',
                                            value: Number(e.target.value),
                                          })
                                        }
                                      />
                                      <InputGroupAddon align="inline-end">ms</InputGroupAddon>
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
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'ripple',
                                      enabled: checked,
                                    })
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
                                    <Label
                                      htmlFor="ripple-duration"
                                      className="text-xs font-normal"
                                    >
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
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'indicator',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                            </AccordionItem>

                            {/* Sound Plugin */}
                            <AccordionItem value="sound" className="relative">
                              <SettingsAccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Sound
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                                    >
                                      <iframe
                                        src="/demos/sound"
                                        className="w-full h-full border-0 overflow-hidden"
                                        scrolling="no"
                                      />
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-sound"
                                  checked={settings.plugins.sound}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'sound',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                              <SettingsAccordionContent>
                                <div className="space-y-2 py-2">
                                  <div className="flex flex-row items-center justify-between gap-2">
                                    <Label htmlFor="sound-volume" className="text-xs font-normal">
                                      volume
                                    </Label>
                                    <InputGroup className="h-7 w-24">
                                      <InputGroupInput
                                        id="sound-volume"
                                        type="number"
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={settings.soundConfig.volume}
                                        onChange={(e) =>
                                          dispatch({
                                            type: 'UPDATE_SOUND_CONFIG',
                                            key: 'volume',
                                            value: Number(e.target.value),
                                          })
                                        }
                                      />
                                    </InputGroup>
                                  </div>
                                  <div className="flex flex-row items-center justify-between gap-2">
                                    <Label htmlFor="sound-url" className="text-xs font-normal">
                                      clickSoundUrl
                                    </Label>
                                    <InputGroup className="h-7 w-full max-w-[12rem]">
                                      <InputGroupInput
                                        id="sound-url"
                                        type="text"
                                        value={settings.soundConfig.clickSoundUrl}
                                        onChange={(e) =>
                                          dispatch({
                                            type: 'UPDATE_SOUND_CONFIG',
                                            key: 'clickSoundUrl',
                                            value: e.target.value,
                                          })
                                        }
                                      />
                                    </InputGroup>
                                  </div>
                                  <div className="flex flex-row items-center justify-between gap-2">
                                    <Label
                                      htmlFor="typing-sound-url"
                                      className="text-xs font-normal"
                                    >
                                      typingSoundUrl
                                    </Label>
                                    <InputGroup className="h-7 w-full max-w-[12rem]">
                                      <InputGroupInput
                                        id="typing-sound-url"
                                        type="text"
                                        value={settings.soundConfig.typingSoundUrl}
                                        onChange={(e) =>
                                          dispatch({
                                            type: 'UPDATE_SOUND_CONFIG',
                                            key: 'typingSoundUrl',
                                            value: e.target.value,
                                          })
                                        }
                                      />
                                    </InputGroup>
                                  </div>
                                </div>
                              </SettingsAccordionContent>
                            </AccordionItem>

                            {/* Prompt Plugin */}
                            <AccordionItem value="prompt" className="relative">
                              <SettingsAccordionTrigger hideIcon className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Prompt
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                                    >
                                      <iframe
                                        src="/demos/prompt"
                                        className="w-full h-full border-0 overflow-hidden"
                                        scrolling="no"
                                      />
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-prompt"
                                  checked={settings.plugins.prompt}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'prompt',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                            </AccordionItem>

                            {/* Say Plugin */}
                            <AccordionItem value="say" className="relative">
                              <SettingsAccordionTrigger hideIcon className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Say
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                                    >
                                      <iframe
                                        src="/demos/say"
                                        className="w-full h-full border-0 overflow-hidden"
                                        scrolling="no"
                                      />
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-say"
                                  checked={settings.plugins.say}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'say',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                            </AccordionItem>

                            <AccordionItem value="spotlight" className="relative">
                              <SettingsAccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Spotlight
                                  <span title="Pro" className="flex items-center">
                                    <Gem className="w-4 h-4 text-orange-500" />
                                  </span>
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                                    >
                                      <iframe
                                        src="/demos/spotlight"
                                        className="w-full h-full border-0 overflow-hidden"
                                        scrolling="no"
                                      />
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-spotlight"
                                  checked={settings.plugins.spotlight}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'spotlight',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                              <SettingsAccordionContent>
                                <div className="space-y-2 py-2">
                                  <p className="text-xs text-muted-foreground">
                                    Adds a reusable focus frame with optional backdrop dimming for
                                    guided steps, narration, and handoff flows.
                                  </p>
                                </div>
                              </SettingsAccordionContent>
                            </AccordionItem>

                            <AccordionItem value="wait-for-user" className="relative">
                              <SettingsAccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Wait For User
                                  <span title="Pro" className="flex items-center">
                                    <Gem className="w-4 h-4 text-orange-500" />
                                  </span>
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                                    >
                                      <iframe
                                        src="/demos/wait-for-user"
                                        className="w-full h-full border-0 overflow-hidden"
                                        scrolling="no"
                                      />
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-wait-for-user"
                                  checked={settings.plugins.waitForUser}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'waitForUser',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                              <SettingsAccordionContent>
                                <div className="space-y-2 py-2">
                                  <p className="text-xs text-muted-foreground">
                                    Pauses the script and lets a real user finish the step before
                                    the demo resumes. Enable Spotlight as well for visual target
                                    emphasis.
                                  </p>
                                </div>
                              </SettingsAccordionContent>
                            </AccordionItem>

                            {/* Speech Plugin */}
                            <AccordionItem value="speech" className="relative">
                              <SettingsAccordionTrigger hideIcon className="hover:no-underline">
                                <div className="flex items-center gap-1.5">
                                  Speech
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      className="p-0 z-[9999999] overflow-hidden border bg-background rounded-lg shadow-md w-[320px] h-[250px]"
                                    >
                                      <iframe
                                        src="/demos/speech"
                                        className="w-full h-full border-0 overflow-hidden"
                                        scrolling="no"
                                      />
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </SettingsAccordionTrigger>
                              <div className="absolute right-0 top-4">
                                <Switch
                                  id="enable-speech"
                                  checked={settings.plugins.speech}
                                  onCheckedChange={(checked) =>
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'speech',
                                      enabled: checked,
                                    })
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
                                    dispatch({
                                      type: 'TOGGLE_PLUGIN',
                                      plugin: 'logging',
                                      enabled: checked,
                                    })
                                  }
                                />
                              </div>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
            </CursorPlayer>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 pt-8 w-full max-w-2xl justify-center z-10 relative">
            <div className="flex items-center justify-between w-full md:w-auto bg-muted/50 border border-border rounded-lg px-4 py-2 relative group hover:bg-muted/80 transition-colors">
              <code className="text-sm font-mono text-muted-foreground mr-8">
                npm i @cursor.js/core
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 absolute right-1"
                onClick={() => handleCopy('npm i @cursor.js/core', setCopiedNpm)}
                title="Copy npm command"
              >
                {copiedNpm ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto bg-muted/50 border border-border rounded-lg px-4 py-2 relative group hover:bg-muted/80 transition-colors">
              <code className="text-sm font-mono text-muted-foreground mr-8">
                npx skills add cursor-js/skills
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 absolute right-1"
                onClick={() => handleCopy('npx skills add cursor-js/skills', setCopiedNpx)}
                title="Copy npx command"
              >
                {copiedNpx ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto flex items-stretch justify-center py-12 px-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg">
            <div className="flex h-11 items-center gap-3 border-b bg-muted/60 px-4">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <h2 id="example-app-title" className="text-sm font-semibold">
                Example app
              </h2>
            </div>

            <div className="p-6 md:p-8">
              <div className="mx-auto w-full max-w-2xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">Todo list</h3>
                    <p className="text-sm text-muted-foreground">
                      Add, complete, and delete work items.
                    </p>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    Live
                  </span>
                </div>

                <div className="flex gap-2 mb-4">
                  <Input
                    id="todo-input"
                    placeholder="What needs to be done?"
                    value={todoInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTodoInput(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      e.key === 'Enter' && addTodo()
                    }
                  />
                  <Button id="todo-add" onClick={addTodo}>
                    Add
                  </Button>
                </div>

                <ul className="space-y-2">
                  {todos.map((todo) => (
                    <li
                      key={todo.id}
                      className={`todo-item-${todo.id} flex min-h-12 items-center justify-between gap-3 overflow-hidden rounded-md border bg-background p-3 transition-[opacity,background-color,transform] duration-200 ${todo.completed ? 'opacity-55' : ''}`}
                      style={{
                        animation:
                          deletingTodoId === todo.id
                            ? 'todo-item-delete 260ms ease-in forwards'
                            : recentlyAddedTodoId === todo.id
                              ? 'todo-item-enter 620ms ease-out both'
                              : undefined,
                      }}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <input
                          type="checkbox"
                          id={`todo-check-${todo.id}`}
                          className="h-4 w-4 shrink-0"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                        />
                        <span
                          id={`todo-text-${todo.id}`}
                          className={`truncate ${todo.completed ? 'line-through' : ''}`}
                        >
                          {todo.text}
                        </span>
                      </span>
                      <button
                        id={`todo-delete-${todo.id}`}
                        type="button"
                        onClick={() => deleteTodo(todo.id)}
                        className="shrink-0 text-sm font-medium text-red-500 opacity-70 transition-opacity hover:opacity-100"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Sandbox Section */}
        <section className="container mx-auto flex flex-col items-center justify-center space-y-6 pt-12 pb-24 md:pt-7 text-center px-6">
          <div className="flex flex-col items-center space-y-4 px-4 w-full">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-2">
              Try It In The Browser
            </h2>
            <p className="text-muted-foreground">Experiment right here using esm.sh</p>
          </div>

          <div className="flex flex-col lg:flex-row w-full max-w-6xl mt-8 rounded-xl overflow-hidden border bg-white shadow-sm h-[400px]">
            {/* Left - Code Editor */}
            <div className="w-full lg:w-1/2 border-r flex flex-col bg-slate-50">
              <div className="flex items-center justify-between px-4 h-12 border-b bg-slate-100 border-slate-200 shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('html')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'html' ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    index.html
                  </button>
                  <button
                    onClick={() => setActiveTab('js')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'js' ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    script.js
                  </button>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={runSandbox}
                  className="h-8 text-xs bg-slate-200 text-slate-900 hover:bg-slate-300 border shadow-none"
                >
                  <Play className="w-3 h-3 mr-1" /> Run
                </Button>
              </div>
              <div
                className="flex-1 overflow-auto bg-white relative text-left"
                data-color-mode="light"
              >
                {activeTab === 'html' ? (
                  <CodeEditor
                    value={htmlCode}
                    language="html"
                    placeholder="Please enter HTML code."
                    onChange={(evn) => setHtmlCode(evn.target.value)}
                    padding={15}
                    style={{
                      fontSize: 14,
                      backgroundColor: 'transparent',
                      fontFamily:
                        'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                      minHeight: '100%',
                      color: '#333',
                    }}
                    className="light-theme"
                  />
                ) : (
                  <CodeEditor
                    value={jsCode}
                    language="js"
                    placeholder="Please enter JS code."
                    onChange={(evn) => setJsCode(evn.target.value)}
                    padding={15}
                    style={{
                      fontSize: 14,
                      backgroundColor: 'transparent',
                      fontFamily:
                        'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                      minHeight: '100%',
                      color: '#333',
                    }}
                    className="light-theme"
                  />
                )}
              </div>
            </div>

            {/* Right - Preview */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col relative h-[400px] lg:h-auto">
              <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center bg-slate-100 border-b border-slate-200 text-xs font-mono text-slate-500 rounded-t-xl lg:rounded-tl-none lg:rounded-tr-xl pointer-events-none shrink-0">
                Preview
              </div>
              <div className="w-full h-full pt-12 text-black">
                <iframe
                  srcDoc={sandboxSrcDoc}
                  className="w-full h-full border-none"
                  title="sandbox"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
