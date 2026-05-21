"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CursorPlayerState = "idle" | "running" | "paused" | "complete" | "error";

export interface CursorPlayerRuntime extends PromiseLike<void> {
  cursor: {
    el: HTMLElement;
    scale: number;
    setSize: (scale: number) => void;
  };
  on(event: string, callback: () => void): this;
  off(event: string, callback: () => void): this;
  pause(): this;
  play(): this;
  destroy(): void;
}

export type CursorPlayerInstance = CursorPlayerRuntime;

export interface UseCursorPlayerOptions<TCursor extends CursorPlayerRuntime> {
  createCursor: (anchorElement: HTMLElement) => TCursor;
  buildSequence: (cursor: TCursor, anchorElement: HTMLElement) => void;
  onError?: (error: unknown) => void;
}

export interface CursorPlayerControls {
  state: CursorPlayerState;
  canStart: boolean;
  canPause: boolean;
  canStop: boolean;
  start: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setAnchorElement: (element: HTMLElement | null) => void;
  setAnchorFrameElement: (element: HTMLElement | null) => void;
}

interface CursorBinding<TCursor extends CursorPlayerRuntime> {
  cursor: TCursor;
  anchorElement: HTMLElement;
  anchorFrameElement: HTMLElement;
  activeScale: number;
  onPause: () => void;
  onPlay: () => void;
  onDestroy: () => void;
}

function resolveVisualElement(cursorElement: HTMLElement) {
  return (cursorElement.querySelector(".cursor-theme-wrapper") as HTMLElement | null) ?? cursorElement;
}

function syncCursorScale(cursor: CursorPlayerRuntime, anchorFrameElement: HTMLElement) {
  const anchorRect = anchorFrameElement.getBoundingClientRect();
  const visualElement = resolveVisualElement(cursor.cursor.el);
  const visualRect = visualElement.getBoundingClientRect();
  const currentScale = cursor.cursor.scale || 1;

  if (
    anchorRect.width <= 0 ||
    anchorRect.height <= 0 ||
    visualRect.width <= 0 ||
    visualRect.height <= 0
  ) {
    return false;
  }

  const naturalWidth = visualRect.width / currentScale;
  const naturalHeight = visualRect.height / currentScale;

  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return false;
  }

  const scale = Math.min(anchorRect.width / naturalWidth, anchorRect.height / naturalHeight);
  cursor.cursor.setSize(scale);
  return true;
}

function restoreCursorScale(cursor: CursorPlayerRuntime, scale: number) {
  cursor.cursor.setSize(scale);
}

function isSameBinding<TCursor extends CursorPlayerRuntime>(
  currentBinding: CursorBinding<TCursor> | null,
  binding: CursorBinding<TCursor>,
) {
  return currentBinding?.cursor === binding.cursor;
}

function scheduleScaleSync(
  cursor: CursorPlayerRuntime,
  anchorFrameElement: HTMLElement,
  isActive: () => boolean,
  attempts = 4,
) {
  const run = (remaining: number) => {
    if (!isActive()) {
      return;
    }

    const didSync = syncCursorScale(cursor, anchorFrameElement);

    if (!didSync && remaining > 0 && typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => run(remaining - 1));
    }
  };

  run(attempts);
}

export function useCursorPlayer<TCursor extends CursorPlayerRuntime>({
  createCursor,
  buildSequence,
  onError,
}: UseCursorPlayerOptions<TCursor>): CursorPlayerControls {
  const [state, setState] = useState<CursorPlayerState>("idle");
  const stateRef = useRef<CursorPlayerState>("idle");
  const anchorElementRef = useRef<HTMLElement | null>(null);
  const anchorFrameElementRef = useRef<HTMLElement | null>(null);
  const bindingRef = useRef<CursorBinding<TCursor> | null>(null);
  const runIdRef = useRef(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const setPlayerState = useCallback((nextState: CursorPlayerState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const canApplyPreviewScale = useCallback(() => {
    const currentState = stateRef.current;
    return currentState === "idle" || currentState === "complete" || currentState === "error";
  }, []);

  const clearBinding = (destroyCursor: boolean) => {
    const binding = bindingRef.current;
    if (!binding) return;

    binding.cursor.off("pause", binding.onPause);
    binding.cursor.off("play", binding.onPlay);
    binding.cursor.off("destroy", binding.onDestroy);

    if (destroyCursor) {
      binding.cursor.destroy();
    }

    bindingRef.current = null;
  };

  const cleanupResizeObserver = () => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
  };

  const initializeCursor = useCallback((nextAnchorElement: HTMLElement, nextAnchorFrameElement: HTMLElement) => {
    anchorElementRef.current = nextAnchorElement;
    anchorFrameElementRef.current = nextAnchorFrameElement;
    runIdRef.current += 1;
    const runId = runIdRef.current;

    cleanupResizeObserver();
    clearBinding(true);

    const cursor = createCursor(nextAnchorElement);

    const onPause = () => setPlayerState("paused");
    const onPlay = () => setPlayerState("running");
    const onDestroy = () => {
      if (runIdRef.current === runId) {
        setPlayerState("idle");
      }
    };

    cursor.on("pause", onPause);
    cursor.on("play", onPlay);
    cursor.on("destroy", onDestroy);

    bindingRef.current = {
      cursor,
      anchorElement: nextAnchorElement,
      anchorFrameElement: nextAnchorFrameElement,
      activeScale: cursor.cursor.scale,
      onPause,
      onPlay,
      onDestroy,
    };

    scheduleScaleSync(
      cursor,
      nextAnchorFrameElement,
      () => bindingRef.current?.cursor === cursor && canApplyPreviewScale(),
    );

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        if (bindingRef.current?.cursor === cursor && canApplyPreviewScale()) {
          syncCursorScale(cursor, nextAnchorFrameElement);
        }
      });

      observer.observe(nextAnchorFrameElement);
      observer.observe(resolveVisualElement(cursor.cursor.el));
      resizeObserverRef.current = observer;
    }

    setPlayerState("idle");
  }, [canApplyPreviewScale, createCursor, setPlayerState]);

  useEffect(() => {
    return () => {
      cleanupResizeObserver();
      clearBinding(true);
    };
  }, []);

  const syncBinding = useCallback(() => {
    const anchorElement = anchorElementRef.current;
    const anchorFrameElement = anchorFrameElementRef.current;

    if (!anchorElement || !anchorFrameElement) {
      return;
    }

    const currentBinding = bindingRef.current;
    if (
      currentBinding &&
      currentBinding.anchorElement === anchorElement &&
      currentBinding.anchorFrameElement === anchorFrameElement
    ) {
      if (canApplyPreviewScale()) {
        syncCursorScale(currentBinding.cursor, anchorFrameElement);
      }
      return;
    }

    initializeCursor(anchorElement, anchorFrameElement);
  }, [canApplyPreviewScale, initializeCursor]);

  const setAnchorElement = useCallback((element: HTMLElement | null) => {
    if (!element) {
      anchorElementRef.current = null;
      cleanupResizeObserver();
      clearBinding(true);
      return;
    }

    anchorElementRef.current = element;
    syncBinding();
  }, [syncBinding]);

  const setAnchorFrameElement = useCallback((element: HTMLElement | null) => {
    if (!element) {
      anchorFrameElementRef.current = null;
      cleanupResizeObserver();
      clearBinding(true);
      return;
    }

    anchorFrameElementRef.current = element;
    syncBinding();
  }, [syncBinding]);

  const pause = () => {
    if (state !== "running") return;
    bindingRef.current?.cursor.pause();
  };

  const stop = () => {
    const binding = bindingRef.current;
    if (!binding) return;

    initializeCursor(binding.anchorElement, binding.anchorFrameElement);
  };

  const start = async () => {
    const binding = bindingRef.current;
    if (!binding) return;

    if (state === "running") return;

    if (state === "paused") {
      binding.cursor.play();
      return;
    }

    try {
      setPlayerState("running");
      restoreCursorScale(binding.cursor, binding.activeScale);
      buildSequence(binding.cursor, binding.anchorElement);

      await binding.cursor;

      if (isSameBinding(bindingRef.current, binding)) {
        initializeCursor(binding.anchorElement, binding.anchorFrameElement);
      }
    } catch (error) {
      if (isSameBinding(bindingRef.current, binding)) {
        clearBinding(true);
        setPlayerState("error");
        initializeCursor(binding.anchorElement, binding.anchorFrameElement);
      }

      onError?.(error);
    }
  };

  return {
    state,
    canStart: state !== "running",
    canPause: state === "running",
    canStop: state === "running" || state === "paused",
    start,
    pause,
    stop,
    setAnchorElement,
    setAnchorFrameElement,
  };
}
