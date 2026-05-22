import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Check, Gem, X } from 'lucide-react';
import {
  getProPurchaseHref,
  lemonJsScriptSrc,
  lemonSqueezyButtonClassName,
} from '@/lib/pro-purchase';
import { ProHeroCursor } from '@/components/app/pro-hero-cursor';
import { ProPluginShowcase } from '@/components/app/pro-plugin-showcase';

const proPlugins = [
  {
    title: 'Gemini TTS',
    description:
      'Generate premium voiceovers with license-aware credits and a production-friendly TTS flow.',
    demoPath: '/demos/geminitts',
    docsPath: '/docs/plugins/geminitts',
  },
  {
    title: 'Floating',
    description:
      'Add shared Floating UI positioning to say, prompt, and wait-for-user panels with one plugin.',
    demoPath: '/demos/say',
    docsPath: '/docs/plugins/floating',
  },
  {
    title: 'Trail',
    description:
      'Render expressive trailing motion behind the cursor with layered visuals and tuning controls.',
    demoPath: '/demos/trail',
    docsPath: '/docs/plugins/trail',
  },
  {
    title: 'Particle',
    description:
      'Add burst effects and energetic feedback around clicks, movement, and highlighted moments.',
    demoPath: '/demos/particle',
    docsPath: '/docs/plugins/particle',
  },
  {
    title: 'Outline',
    description:
      'Direct attention with animated circles and underlines that frame the exact target element.',
    demoPath: '/demos/outline',
    docsPath: '/docs/plugins/outline',
  },
  {
    title: 'Spotlight',
    description:
      'Dim the interface around one target and keep visual focus locked on the next important step.',
    demoPath: '/demos/spotlight',
    docsPath: '/docs/plugins/spotlight',
  },
  {
    title: 'Wait For User',
    description:
      'Pause the script, spotlight the next action, and resume only after a real user confirms the step.',
    demoPath: '/demos/wait-for-user',
    docsPath: '/docs/plugins/wait-for-user',
  },
] as const;

export const metadata: Metadata = {
  title: 'Cursor.js Pro',
  description: 'Advanced features for Cursor.js',
};

export default function ProLandingPage() {
  const soloHref = getProPurchaseHref('solo');
  const teamHref = getProPurchaseHref('team');

  return (
    <>
      <Script src={lemonJsScriptSrc} strategy="afterInteractive" />

      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/20 dark:text-orange-200">
              <Gem className="h-4 w-4" />
              Premium plugins for production-ready demos
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">Cursor.js Pro</h1>
            <p className="mb-8 text-lg leading-8 text-muted-foreground">
              Buy once, receive your license, and unlock the premium plugin set without leaving the
              docs flow. The page now frames a clean registration and checkout journey.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Buy Pro Solo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                Docs
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Already purchased?{' '}
              <Link
                href="/docs/pro-installation"
                className="font-medium text-foreground hover:underline"
              >
                Read the Pro installation guide
              </Link>
              .
            </p>
          </div>

          <ProHeroCursor />
        </div>

        <div className="mt-24">
          <ProPluginShowcase plugins={proPlugins} />
        </div>

        <div id="pricing" className="mt-32">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Pricing</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="min-w-[200px] border-b p-4 pt-10 align-top font-medium"></th>
                  <th className="min-w-[250px] border-b p-4 pt-10 align-top font-medium">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-lg">
                        <span className="h-3 w-3 rounded-full border border-slate-400 bg-slate-300"></span>
                        Community
                      </div>
                      <div className="text-3xl font-bold">Free</div>
                      <div className="mb-4 mt-2 text-sm font-normal leading-tight text-muted-foreground">
                        For hobbyists, students, and open source projects.
                      </div>
                      <Link
                        href="/docs"
                        className="inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        Read Docs
                      </Link>
                    </div>
                  </th>
                  <th className="relative min-w-[250px] border-b bg-indigo-50/50 p-4 pt-10 align-top font-medium dark:bg-indigo-950/20">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-lg">
                        <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                        <span className="text-indigo-900 dark:text-indigo-100">Pro Solo</span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-950/30 dark:text-orange-200">
                          Popular
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                        $49 <span className="text-sm font-normal opacity-70">/ lifetime</span>
                      </div>
                      <div className="mb-4 mt-2 text-sm font-normal leading-tight text-indigo-700/80 dark:text-indigo-300/80">
                        Perfect for indie hackers, freelancers, and solo devs.
                      </div>
                      <a
                        href={soloHref}
                        className={`${lemonSqueezyButtonClassName} inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`}
                      >
                        Buy Pro Solo
                      </a>
                    </div>
                  </th>
                  <th className="min-w-[250px] border-b p-4 pt-10 align-top font-medium">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-lg">
                        <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                        Pro Team
                      </div>
                      <div className="text-3xl font-bold">
                        $149{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                          / lifetime
                        </span>
                      </div>
                      <div className="mb-4 mt-2 text-sm font-normal leading-tight text-muted-foreground">
                        For agencies, startups, and companies.
                      </div>
                      <a
                        href={teamHref}
                        className={`${lemonSqueezyButtonClassName} inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`}
                      >
                        Buy Pro Team
                      </a>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground">
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">Usage</td>
                  <td className="p-4">Unlimited</td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <strong className="font-semibold text-foreground">1 Developer</strong>,
                    Unlimited Projects
                  </td>
                  <td className="p-4">
                    <strong className="font-semibold text-foreground">5 Developers</strong>,
                    Unlimited Projects
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">License Duration</td>
                  <td className="p-4">MIT (Open Source)</td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    Lifetime (1 Year Updates)
                  </td>
                  <td className="p-4">Lifetime (1 Year Updates)</td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">Cursor.js Core Engine</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">(Move, Click, Type, Wait)</span>
                    </div>
                  </td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                  <td className="p-4">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">Standard Visuals & Sounds</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">(Ripple, Indicator, ClickSound)</span>
                    </div>
                  </td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                  <td className="p-4">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">Speech Bubble & Voice</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">(Speech Bubble, Web Speech API)</span>
                    </div>
                  </td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                  <td className="p-4">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">Spotlight (Target Dimming)</td>
                  <td className="p-4">
                    <X className="h-4 w-4 text-muted-foreground/50" />
                  </td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                  <td className="p-4">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">Interactive Checkpoints</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-muted-foreground/50" />
                      <span className="text-xs">(Cannot wait for user)</span>
                    </div>
                  </td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">(Waits for user action)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">Cross-Page Session Sync</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-muted-foreground/50" />
                      <span className="text-xs">(Resets on page load)</span>
                    </div>
                  </td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">(Scenario continues on next page)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">AI Voiceover (TTS)</td>
                  <td className="p-4">
                    <X className="h-4 w-4 text-muted-foreground/50" />
                  </td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">(Google TTS & Premium Voices)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">Premium Themes</td>
                  <td className="p-4">
                    <X className="h-4 w-4 text-muted-foreground/50" />
                  </td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">(Nostalgic 90s, Pencil Sketch etc.)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Check className="h-4 w-4 text-green-500" />
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">
                    Future Plugins (e.g., Recorder)
                  </td>
                  <td className="p-4">
                    <X className="h-4 w-4 text-muted-foreground/50" />
                  </td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    <span className="text-xs font-medium">Discounted Access Only</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">(Beta & Early Access)</span>
                    </div>
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium text-foreground">Support</td>
                  <td className="p-4">Community (GitHub Issues)</td>
                  <td className="bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                    Private Discord Channel
                  </td>
                  <td className="p-4">Priority Email Support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
