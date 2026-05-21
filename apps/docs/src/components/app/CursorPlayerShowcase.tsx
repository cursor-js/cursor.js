'use client';

import * as React from 'react';
import { Cursor, IndicatorPlugin, ThemePlugin } from '@cursor.js/core';
import { ChevronDown, Code2, Pause, Play } from 'lucide-react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

import { CursorPlayer } from '../../../registry/default/cursor-player/cursor-player';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

function createSignupCursor(anchorElement: HTMLElement) {
  const cursor = new Cursor({
    humanize: true,
    speed: 0.75,
    startPoint: anchorElement,
  });

  cursor.use(new ThemePlugin());
  cursor.use(new IndicatorPlugin({ color: '#0f766e', size: 42 }));

  return cursor;
}

type SignupTargets = {
  email: string;
  plan: string;
  submit: string;
};

type PlanOption = {
  cardId: string;
  inputId: string;
  value: string;
  title: string;
  description: string;
  badge?: string;
};

const defaultSignupTargets: SignupTargets = {
  email: '#ui-demo-email',
  plan: '#ui-demo-plan',
  submit: '#ui-demo-submit',
};

const overlaySignupTargets: SignupTargets = {
  email: '#overlay-demo-email',
  plan: '#overlay-demo-plan',
  submit: '#overlay-demo-submit',
};

function getPlanOptions(targets: SignupTargets): PlanOption[] {
  return [
    {
      cardId: targets.plan.slice(1),
      inputId: `${targets.plan.slice(1)}-input`,
      value: 'starter',
      title: 'Starter walkthrough',
      description: 'A quick product tour for first-time users.',
      badge: 'Free',
    },
    {
      cardId: `${targets.plan.slice(1)}-team`,
      inputId: `${targets.plan.slice(1)}-team-input`,
      value: 'team',
      title: 'Team onboarding',
      description: 'Show invite flows, roles, and shared workspace setup.',
    },
    {
      cardId: `${targets.plan.slice(1)}-ops`,
      inputId: `${targets.plan.slice(1)}-ops-input`,
      value: 'ops',
      title: 'Ops handoff',
      description: 'Highlight reporting, approvals, and daily workflow steps.',
    },
  ];
}

function buildSignupSequence(
  cursor: ReturnType<typeof createSignupCursor>,
  targets: SignupTargets,
) {
  cursor
    .hover(targets.email)
    .type(targets.email, 'hello@cursorjs.com', { delay: 45 })
    .hover(targets.plan)
    .click(targets.plan)
    .hover(targets.submit)
    .click(targets.submit)
    .wait(350);
}

function buildDefaultSignupSequence(cursor: ReturnType<typeof createSignupCursor>) {
  buildSignupSequence(cursor, defaultSignupTargets);
}

function buildOverlaySignupSequence(cursor: ReturnType<typeof createSignupCursor>) {
  buildSignupSequence(cursor, overlaySignupTargets);
}

const cursorPlayerExampleCode = String.raw`<CursorPlayer createCursor={createSignupCursor} buildSequence={buildSignupSequence}>
  <div className="flex flex-wrap items-center justify-center gap-4">
    <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-3 py-2">
      <CursorPlayer.Cursor className="size-5" />
      <span className="text-sm font-medium text-foreground">Show signup flow</span>
      <CursorPlayer.PlayPause
        aria-label="Play or pause signup flow"
        size="icon-sm"
        variant="ghost"
      >
        <CursorPlayer.PlayIcon asChild>
          <Play />
        </CursorPlayer.PlayIcon>
        <CursorPlayer.PauseIcon asChild>
          <Pause />
        </CursorPlayer.PauseIcon>
      </CursorPlayer.PlayPause>
    </div>
    <CursorPlayer.StopButton className="rounded-full" />
  </div>
</CursorPlayer>`;

const cursorPlayerOverlayExampleCode = String.raw`<div className="group relative inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 shadow-sm transition-colors hover:bg-background">
  <div className="relative inline-grid size-8 place-items-center">
    <CursorPlayer.Cursor className="size-4" />
    <CursorPlayer.PlayPause
      aria-label="Play or pause signup flow"
      size="icon-sm"
      variant="ghost"
      className="absolute inset-0 z-[1000000] m-auto rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-80 data-[state=running]:opacity-100 data-[state=paused]:opacity-100"
    >
      <CursorPlayer.PlayIcon asChild>
        <Play />
      </CursorPlayer.PlayIcon>
      <CursorPlayer.PauseIcon asChild>
        <Pause />
      </CursorPlayer.PauseIcon>
    </CursorPlayer.PlayPause>
  </div>
  <span className="text-sm font-medium text-foreground">Show signup flow</span>
</div>`;

function ExampleCard({ children, code }: { children: React.ReactNode; code: string }) {
  const [isCodeOpen, setIsCodeOpen] = React.useState(false);

  return (
    <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm">
      <div className="relative">
        <div className="p-8">{children}</div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex translate-y-1/2 justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="pointer-events-auto gap-2 rounded-full bg-background/95 shadow-sm backdrop-blur"
            onClick={() => setIsCodeOpen((current) => !current)}
            aria-expanded={isCodeOpen}
          >
            <Code2 className="size-4" />
            View Code
            <ChevronDown
              className={`size-4 transition-transform ${isCodeOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>
      </div>

      <div className="border-t border-border/70 bg-muted/20 pt-4">
        <div
          className={cn(
            'relative overflow-hidden transition-[max-height] duration-200',
            isCodeOpen ? 'max-h-[720px]' : 'max-h-26',
          )}
        >
          <DynamicCodeBlock
            lang="tsx"
            code={code}
            codeblock={{
              allowCopy: false,
              className: 'my-0 rounded-none border-0 bg-transparent shadow-none',
              viewportProps: {
                className: 'max-h-none bg-transparent px-2 py-4',
              },
            }}
          />

          {!isCodeOpen ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card via-card/95 to-transparent" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DemoTargetPanel({
  title = 'DEMO UI',
  targets,
}: {
  title?: string;
  targets: SignupTargets;
}) {
  const planOptions = getPlanOptions(targets);

  return (
    <div className="rounded-[24px] bg-card p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="mt-4 space-y-4 rounded-[24px] border border-border/70 bg-background p-5">
        <div className="space-y-2">
          <label htmlFor={targets.email.slice(1)} className="text-sm font-medium tracking-tight text-foreground">
            Email
          </label>
          <input
            id={targets.email.slice(1)}
            defaultValue=""
            placeholder="you@company.com"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950"
          />
        </div>

        <div className="space-y-3">
          <span className="text-sm font-medium tracking-tight text-foreground">Plan</span>
          <div className="space-y-3">
            {planOptions.map((plan, index) => (
              <label
                key={plan.cardId}
                id={plan.cardId}
                htmlFor={plan.inputId}
                className={cn(
                  'group flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50 has-[:checked]:shadow-[0_0_0_1px_rgba(16,185,129,0.15)] dark:hover:bg-emerald-950/30 dark:has-[:checked]:bg-emerald-950/40',
                )}
              >
                <input
                  id={plan.inputId}
                  type="radio"
                  name={`${targets.plan.slice(1)}-group`}
                  value={plan.value}
                  defaultChecked={index === 1}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30 bg-background group-has-[:checked]:border-emerald-500 group-has-[:checked]:bg-emerald-500',
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full bg-transparent group-has-[:checked]:bg-white',
                    )}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{plan.title}</span>
                    {plan.badge ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {plan.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                    {plan.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          id={targets.submit.slice(1)}
          type="button"
          className="h-11 w-full rounded-2xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
        >
          Launch onboarding
        </button>
      </div>
    </div>
  );
}

function CursorPlayerPreviewSurface() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex min-h-[300px] items-center justify-center rounded-[24px] bg-gradient-to-br from-white via-white to-emerald-50/80 p-6 dark:from-neutral-950 dark:via-neutral-950 dark:to-emerald-950/30">
        <div>
          <CursorPlayer createCursor={createSignupCursor} buildSequence={buildDefaultSignupSequence}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-3 py-2">
                <CursorPlayer.Cursor className="size-5" />
                <span className="text-sm font-medium text-foreground">Show signup flow</span>
                <CursorPlayer.PlayPause
                  aria-label="Play or pause signup flow"
                  size="icon-sm"
                  variant={'ghost'}
                >
                  <CursorPlayer.PlayIcon asChild>
                    <Play />
                  </CursorPlayer.PlayIcon>
                  <CursorPlayer.PauseIcon asChild>
                    <Pause />
                  </CursorPlayer.PauseIcon>
                </CursorPlayer.PlayPause>
              </div>
              <CursorPlayer.StopButton className="rounded-full" />
            </div>
          </CursorPlayer>
        </div>
      </div>

      <DemoTargetPanel targets={defaultSignupTargets} />
    </div>
  );
}

function CursorPlayerOverlayPreviewSurface() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex min-h-[300px] items-center justify-center rounded-[24px] bg-gradient-to-br from-white via-white to-muted/50 p-8 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900">
        <CursorPlayer createCursor={createSignupCursor} buildSequence={buildOverlaySignupSequence}>
          <div className="group relative inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 shadow-sm transition-colors hover:bg-background">
            <div className="relative inline-grid size-8 place-items-center">
              <CursorPlayer.Cursor className="size-4" />
              <CursorPlayer.PlayPause
                aria-label="Play or pause signup flow"
                size="icon-sm"
                variant="ghost"
                className="absolute inset-0 z-[1000000] m-auto rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-80 data-[state=running]:opacity-100 data-[state=paused]:opacity-100"
              >
                <CursorPlayer.PlayIcon asChild>
                  <Play />
                </CursorPlayer.PlayIcon>
                <CursorPlayer.PauseIcon asChild>
                  <Pause />
                </CursorPlayer.PauseIcon>
              </CursorPlayer.PlayPause>
            </div>
            <span className="text-sm font-medium text-foreground">Show signup flow</span>
          </div>
        </CursorPlayer>
      </div>

      <DemoTargetPanel title="OVERLAY DEMO UI" targets={overlaySignupTargets} />
    </div>
  );
}

export function CursorPlayerShowcase() {
  return (
    <ExampleCard code={cursorPlayerExampleCode}>
      <CursorPlayerPreviewSurface />
    </ExampleCard>
  );
}

export function CursorPlayerOverlayShowcase() {
  return (
    <ExampleCard code={cursorPlayerOverlayExampleCode}>
      <CursorPlayerOverlayPreviewSurface />
    </ExampleCard>
  );
}
