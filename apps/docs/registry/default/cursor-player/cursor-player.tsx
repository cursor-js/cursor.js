'use client';

import * as React from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { Slot } from 'radix-ui';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type CursorPlayerRuntime, useCursorPlayer } from './use-cursor-player';

interface CursorPlayerRootProps<TCursor extends CursorPlayerRuntime> {
  createCursor: (anchorElement: HTMLElement) => TCursor;
  buildSequence: (cursor: TCursor, anchorElement: HTMLElement) => void;
  onError?: (error: unknown) => void;
  children: React.ReactNode;
}

interface CursorPlayerPartProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

type CursorPlayerHotspot = 'top-left' | 'center' | { x: number; y: number };

interface CursorPlayerCursorProps extends CursorPlayerPartProps {
  hotspot?: CursorPlayerHotspot;
}

interface CursorPlayerButtonProps extends React.ComponentProps<typeof Button> {
  children?: React.ReactNode;
}

interface CursorPlayerIconProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const CursorPlayerContext = React.createContext<CursorPlayerContextValue | null>(null);

function useCursorPlayerContext() {
  const value = React.useContext(CursorPlayerContext);

  if (!value) {
    throw new Error('CursorPlayer components must be used inside <CursorPlayer>.');
  }

  return value;
}

function isPlayVisible(state: CursorPlayerContextValue['state']) {
  return state !== 'running';
}

function isPauseVisible(state: CursorPlayerContextValue['state']) {
  return state === 'running';
}

type CursorPlayerContextValue = ReturnType<typeof useCursorPlayer>;
type CursorPlayerRootComponent = <TCursor extends CursorPlayerRuntime>(
  props: CursorPlayerRootProps<TCursor>,
) => React.ReactElement;

const CursorPlayerRoot: CursorPlayerRootComponent = ({
  createCursor,
  buildSequence,
  onError,
  children,
}) => {
  const controls = useCursorPlayer({ createCursor, buildSequence, onError });

  return <CursorPlayerContext.Provider value={controls}>{children}</CursorPlayerContext.Provider>;
};

function getHotspotPosition(hotspot: CursorPlayerHotspot | undefined): {
  left: string;
  top: string;
} {
  if (hotspot === 'center') {
    return { left: '50%', top: '50%' };
  }

  if (hotspot && typeof hotspot === 'object') {
    return { left: `${hotspot.x}px`, top: `${hotspot.y}px` };
  }

  return { left: '0px', top: '0px' };
}

function CursorPlayerCursor({
  className,
  asChild = false,
  children,
  hotspot = 'top-left',
  ...props
}: CursorPlayerCursorProps) {
  const { setAnchorElement, setAnchorFrameElement } = useCursorPlayerContext();
  const Comp = asChild ? Slot.Root : 'span';
  const hotspotPosition = getHotspotPosition(hotspot);

  return (
    <Comp
      ref={setAnchorFrameElement}
      className={cn('relative inline-flex size-4', className)}
      aria-hidden="true"
      {...props}
    >
      <span
        ref={setAnchorElement}
        className="absolute h-px w-px"
        style={{
          left: hotspotPosition.left,
          top: hotspotPosition.top,
          transform: hotspot === 'center' ? 'translate(-50%, -50%)' : undefined,
        }}
      />
      {children}
    </Comp>
  );
}

function CursorPlayerPlayPause({ onClick, ...props }: CursorPlayerButtonProps) {
  const { state, start, pause } = useCursorPlayerContext();

  return (
    <Button
      type="button"
      variant="outline"
      data-state={state}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (state === 'running') {
          pause();
          return;
        }

        void start();
      }}
      {...props}
    >
      {props.children}
    </Button>
  );
}

function CursorPlayerPlayIcon({
  className,
  children,
  asChild = false,
  ...props
}: CursorPlayerIconProps) {
  const { state } = useCursorPlayerContext();
  const Comp = asChild ? Slot.Root : 'span';

  if (!isPlayVisible(state)) {
    return null;
  }

  const content = children ?? <Play className="size-4" />;

  return (
    <Comp
      className={cn('pointer-events-none inline-flex items-center justify-center', className)}
      aria-hidden="true"
      {...props}
    >
      {content}
    </Comp>
  );
}

function CursorPlayerPauseIcon({
  className,
  children,
  asChild = false,
  ...props
}: CursorPlayerIconProps) {
  const { state } = useCursorPlayerContext();
  const Comp = asChild ? Slot.Root : 'span';

  if (!isPauseVisible(state)) {
    return null;
  }

  const content = children ?? <Pause className="size-4" />;

  return (
    <Comp
      className={cn('pointer-events-none inline-flex items-center justify-center', className)}
      aria-hidden="true"
      {...props}
    >
      {content}
    </Comp>
  );
}

function CursorPlayerStopButton({
  className,
  children,
  asChild = false,
  onClick,
  ...props
}: CursorPlayerButtonProps) {
  const { state, stop, canStop } = useCursorPlayerContext();
  const content = children ?? (
    <>
      <Square className="size-4" />
      Stop
    </>
  );

  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      asChild={asChild}
      data-state={state}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        stop();
      }}
      disabled={!canStop}
      {...props}
    >
      {content}
    </Button>
  );
}

function CursorPlayerStatus({
  children,
}: {
  children: (controls: CursorPlayerContextValue) => React.ReactNode;
}) {
  const controls = useCursorPlayerContext();

  return <>{children(controls)}</>;
}

export const CursorPlayer = Object.assign(CursorPlayerRoot, {
  Cursor: CursorPlayerCursor,
  PlayPause: CursorPlayerPlayPause,
  PlayIcon: CursorPlayerPlayIcon,
  PauseIcon: CursorPlayerPauseIcon,
  StopButton: CursorPlayerStopButton,
  Status: CursorPlayerStatus,
});
