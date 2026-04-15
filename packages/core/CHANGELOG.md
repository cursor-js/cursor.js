# @cursor.js/core

## 0.2.0

### Minor Changes

- 1be3725: Added flow control functionality with `pause()`, `stop()`, `next()`, and `waitForEvent()` methods to Cursor.js for seamlessly pausing and resuming action queues.
- 159d697: Added `.if()`, `.do()`, and `.until()` methods for robust sub-queue flow control. This prevents deadlocks and enables automated UI synchronization inside chains (like waiting for carousels or checking input values before typing).

## 0.1.0

### Minor Changes

- 46247a0: Added `setSize` and teleportation `move` methods to the `Cursor` class to allow programmatic scaling and absolute positioning. Updated `GhostCursor` to support `scale` via CSS transform.
- b4c96d9: refactor(core): introduce modular plugin architecture with hooks and custom sound support
- 3e1f5aa: Extract the built-in showIndicator feature into a standalone IndicatorPlugin.

### Patch Changes

- 43be629: refactor: move demo code to apps/docs and clean up style.css
