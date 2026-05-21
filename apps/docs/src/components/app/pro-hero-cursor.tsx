'use client';

import { Cursor, ThemePlugin } from '@cursor.js/core';

import { Comet } from '@/components/app/comet';
import { CursorPlayer } from '../../../registry/default/cursor-player/cursor-player';

function createProHeroCursor(anchorElement: HTMLElement) {
  const cursor = new Cursor({
    humanize: true,
    speed: 0.9,
    startPoint: anchorElement,
  });

  cursor.use(new ThemePlugin());

  return cursor;
}

function buildProHeroSequence() {}

export function ProHeroCursor() {
  return (
    <div className="relative overflow-hidden rounded-3xl min-h-80 border py-10 px-15 bg-[radial-gradient(circle_at_top,#eefbf1,transparent_38%),linear-gradient(180deg,#ffffff,rgba(240,253,244,0.82))] shadow-sm dark:bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.16),transparent_30%),linear-gradient(180deg,rgba(24,24,27,1),rgba(24,24,27,0.96))]">
      <CursorPlayer createCursor={createProHeroCursor} buildSequence={buildProHeroSequence}>
        <CursorPlayer.Cursor className="size-16" />
      </CursorPlayer>
      <div className="absolute top-10 left-15">
        <Comet isVisible />
      </div>
    </div>
  );
}
