"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CursorPlayerState = "idle" | "running" | "paused" | "complete" | "error";

export interface CursorPlayerRuntime extends PromiseLike<void> {
  cursor: {
    el: HTMLElement;
    x: number;
    y: number;
    scale: number;
    setSize: (scale: number) => void;
    moveTo: (pageX: number, pageY: number) => void;
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
  setPreviewElement: (element: HTMLElement | null) => void;
}

interface CursorBinding<TCursor extends CursorPlayerRuntime> {
  cursor: TCursor;
  anchorElement: HTMLElement;
  anchorFrameElement: HTMLElement;
  activeScale: number;
  lastAnchorPosition: { x: number; y: number } | null;
  previewCursorElement: HTMLElement | null;
  onPause: () => void;
  onPlay: () => void;
  onDestroy: () => void;
}

function resolveVisualElement(cursorElement: HTMLElement) {
  return (cursorElement.querySelector(".cursor-theme-wrapper") as HTMLElement | null) ?? cursorElement;
}

function parseNumericAttribute(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function resolveVisualBaseSize(visualElement: HTMLElement) {
  const svgElement = visualElement.querySelector("svg");

  if (svgElement instanceof SVGSVGElement) {
    const viewBox = svgElement.viewBox.baseVal;

    if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
      return {
        width: viewBox.width,
        height: viewBox.height,
      };
    }

    const width = parseNumericAttribute(svgElement.getAttribute("width"));
    const height = parseNumericAttribute(svgElement.getAttribute("height"));

    if (width && height) {
      return { width, height };
    }
  }

  const width = visualElement.offsetWidth;
  const height = visualElement.offsetHeight;

  if (width > 0 && height > 0) {
    return { width, height };
  }

  return null;
}

function syncCursorScale(cursor: CursorPlayerRuntime, anchorFrameElement: HTMLElement) {
  const anchorRect = anchorFrameElement.getBoundingClientRect();
  const visualElement = resolveVisualElement(cursor.cursor.el);
  const visualBaseSize = resolveVisualBaseSize(visualElement);

  if (
    anchorRect.width <= 0 ||
    anchorRect.height <= 0 ||
    !visualBaseSize
  ) {
    return false;
  }

  const scale = Math.min(
    anchorRect.width / visualBaseSize.width,
    anchorRect.height / visualBaseSize.height,
  );
  cursor.cursor.setSize(scale);
  return scale;
}

function restoreCursorScale(cursor: CursorPlayerRuntime, scale: number) {
  cursor.cursor.setSize(scale);
}

function setCursorVisibility(cursor: CursorPlayerRuntime, isVisible: boolean) {
  cursor.cursor.el.style.visibility = isVisible ? "visible" : "hidden";
  cursor.cursor.el.style.opacity = isVisible ? "1" : "0";
}

function createPreviewCursorElement(cursor: CursorPlayerRuntime) {
  const previewCursorElement = cursor.cursor.el.cloneNode(true) as HTMLElement;

  previewCursorElement.style.position = "absolute";
  previewCursorElement.style.top = "0";
  previewCursorElement.style.left = "0";
  previewCursorElement.style.visibility = "visible";
  previewCursorElement.style.opacity = "1";
  previewCursorElement.style.pointerEvents = "none";
  previewCursorElement.style.zIndex = "0";
  previewCursorElement.style.transition = "none";
  previewCursorElement.style.transform = `scale(${cursor.cursor.scale})`;

  return previewCursorElement;
}

function syncPreviewCursorScale(previewCursorElement: HTMLElement | null, scale: number | false) {
  if (!previewCursorElement || scale === false) {
    return;
  }

  previewCursorElement.style.transform = `scale(${scale})`;
}

function resolveAnchorPosition(anchorElement: HTMLElement) {
  const rect = anchorElement.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX + rect.width / 2,
    y: rect.top + window.scrollY + rect.height / 2,
  };
}

function syncCursorPosition(binding: CursorBinding<CursorPlayerRuntime>) {
  const nextAnchorPosition = resolveAnchorPosition(binding.anchorElement);
  const previousAnchorPosition = binding.lastAnchorPosition;

  binding.lastAnchorPosition = nextAnchorPosition;

  if (!previousAnchorPosition) {
    return false;
  }

  const deltaX = nextAnchorPosition.x - previousAnchorPosition.x;
  const deltaY = nextAnchorPosition.y - previousAnchorPosition.y;

  if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
    return false;
  }

  binding.cursor.cursor.moveTo(binding.cursor.cursor.x + deltaX, binding.cursor.cursor.y + deltaY);
  return true;
}

function isSameBinding<TCursor extends CursorPlayerRuntime>(
  currentBinding: CursorBinding<TCursor> | null,
  binding: CursorBinding<TCursor>,
) {
  return currentBinding?.cursor === binding.cursor;
}

function scheduleScaleSync(
  syncScale: () => number | false,
  isActive: () => boolean,
  attempts = 3,
) {
  const run = (remaining: number) => {
    if (!isActive()) {
      return;
    }

    const didSync = syncScale();

    if (typeof window === "undefined" || !window.requestAnimationFrame) {
      return;
    }

    if (!didSync && remaining > 0) {
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
  const previewElementRef = useRef<HTMLElement | null>(null);
  const bindingRef = useRef<CursorBinding<TCursor> | null>(null);
  const runIdRef = useRef(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

    binding.previewCursorElement?.remove();

    bindingRef.current = null;
  };

  const cleanupObservers = () => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;

    if (animationFrameRef.current !== null && typeof window !== "undefined" && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const initializeCursor = useCallback((nextAnchorElement: HTMLElement, nextAnchorFrameElement: HTMLElement) => {
    anchorElementRef.current = nextAnchorElement;
    anchorFrameElementRef.current = nextAnchorFrameElement;
    runIdRef.current += 1;
    const runId = runIdRef.current;

    cleanupObservers();
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
      lastAnchorPosition: resolveAnchorPosition(nextAnchorElement),
      previewCursorElement: null,
      onPause,
      onPlay,
      onDestroy,
    };

    const previewElement = previewElementRef.current;
    if (previewElement) {
      const previewCursorElement = createPreviewCursorElement(cursor);
      previewElement.replaceChildren(previewCursorElement);
      bindingRef.current.previewCursorElement = previewCursorElement;
    }

    const syncScale = () => {
      const scale = syncCursorScale(cursor, nextAnchorFrameElement);

      if (bindingRef.current?.cursor === cursor) {
        syncPreviewCursorScale(bindingRef.current.previewCursorElement, scale);
      }

      return scale;
    };

    scheduleScaleSync(
      syncScale,
      () => bindingRef.current?.cursor === cursor && canApplyPreviewScale(),
    );
    syncScale();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        if (bindingRef.current?.cursor === cursor && canApplyPreviewScale()) {
          syncScale();
        }
      });

      observer.observe(nextAnchorFrameElement);
      resizeObserverRef.current = observer;
    }

    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      const trackAnchorPosition = () => {
        const binding = bindingRef.current;

        if (!binding || binding.cursor !== cursor) {
          animationFrameRef.current = null;
          return;
        }

        syncCursorPosition(binding);
        animationFrameRef.current = window.requestAnimationFrame(trackAnchorPosition);
      };

      animationFrameRef.current = window.requestAnimationFrame(trackAnchorPosition);
    }

    setCursorVisibility(cursor, false);

    setPlayerState("idle");
  }, [canApplyPreviewScale, createCursor, setPlayerState]);

  useEffect(() => {
    return () => {
      cleanupObservers();
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
        const scale = syncCursorScale(currentBinding.cursor, anchorFrameElement);
        syncPreviewCursorScale(currentBinding.previewCursorElement, scale);
      }
      return;
    }

    initializeCursor(anchorElement, anchorFrameElement);
  }, [canApplyPreviewScale, initializeCursor]);

  const setAnchorElement = useCallback((element: HTMLElement | null) => {
    if (!element) {
      anchorElementRef.current = null;
      cleanupObservers();
      clearBinding(true);
      return;
    }

    anchorElementRef.current = element;
    syncBinding();
  }, [syncBinding]);

  const setAnchorFrameElement = useCallback((element: HTMLElement | null) => {
    if (!element) {
      anchorFrameElementRef.current = null;
      cleanupObservers();
      clearBinding(true);
      return;
    }

    anchorFrameElementRef.current = element;
    syncBinding();
  }, [syncBinding]);

  const setPreviewElement = useCallback((element: HTMLElement | null) => {
    previewElementRef.current = element;

    if (!element) {
      return;
    }

    const binding = bindingRef.current;
    if (!binding) {
      element.replaceChildren();
      return;
    }

    const previewCursorElement = createPreviewCursorElement(binding.cursor);
    element.replaceChildren(previewCursorElement);
    binding.previewCursorElement = previewCursorElement;

    if (canApplyPreviewScale()) {
      const scale = syncCursorScale(binding.cursor, binding.anchorFrameElement);
      syncPreviewCursorScale(previewCursorElement, scale);
      setCursorVisibility(binding.cursor, false);
    }
  }, [canApplyPreviewScale]);

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
      setCursorVisibility(binding.cursor, true);
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
    setPreviewElement,
  };
}
