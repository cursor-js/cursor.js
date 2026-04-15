import type { Cursor } from '../core/Cursor';

export interface CursorPlugin {
  name: string;
  install: (cursor: Cursor) => void;
  // Lifecycle hooks
  onMoveStart?: (x: number, y: number) => void;
  onMove?: (x: number, y: number) => void;
  onClickStart?: (target: Element) => void;
  onHoverStart?: (target: Element) => void;
  onTypeStart?: (text: string) => void;
  onDestroy?: () => void;
}
