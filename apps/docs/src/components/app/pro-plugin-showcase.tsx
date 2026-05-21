'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Gem } from 'lucide-react';

type ProPlugin = {
  title: string;
  description: string;
  demoPath: string;
  docsPath: string;
};

type ProPluginShowcaseProps = {
  plugins: readonly ProPlugin[];
};

export function ProPluginShowcase({ plugins }: ProPluginShowcaseProps) {
  const [activePluginTitle, setActivePluginTitle] = useState<string>(plugins[0]?.title ?? '');

  const activePlugin =
    plugins.find((plugin) => plugin.title === activePluginTitle) ?? plugins[0] ?? null;

  if (!activePlugin) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
      <div className="rounded-2xl bg-card p-3">
        <h2 className="px-3 pb-2 text-xl font-semibold tracking-tight">Pro Plugins</h2>
        {plugins.map((plugin) => {
          const isActive = plugin.title === activePlugin.title;

          return (
            <button
              key={plugin.title}
              type="button"
              onClick={() => setActivePluginTitle(plugin.title)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                isActive
                  ? 'bg-orange-50 text-foreground dark:bg-orange-950/20'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <Gem
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-orange-600 dark:text-orange-300' : 'text-muted-foreground'
                }`}
              />
              <span className="font-medium">{plugin.title}</span>
              {isActive ? (
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-orange-600 dark:text-orange-300" />
              ) : null}
            </button>
          );
        })}
      </div>

      <article className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl font-semibold">{activePlugin.title}</h3>
            <Link
              href={activePlugin.docsPath}
              className="inline-flex shrink-0 items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View docs
            </Link>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{activePlugin.description}</p>
        </div>

        <iframe
          src={activePlugin.demoPath}
          title={`${activePlugin.title} demo`}
          className="block h-[320px] w-full border-0"
          scrolling="no"
        />
      </article>
    </div>
  );
}
