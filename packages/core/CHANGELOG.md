# @cursor.js/core

## 0.9.0

### Minor Changes

- 538c76a: Add `startPoint` support to `Cursor` so new cursor instances can spawn from an element, selector, or explicit coordinates instead of flashing from the top-left corner. New cursors now also fade in from their initial position, and UI examples such as `CursorPlayer` can pass the clicked trigger element directly into the core API.
- 4b35922: Add speech playback modes to `SpeechPlugin`, defaulting narration to queued playback so consecutive speech requests do not overlap.

### Patch Changes

- 8dda5e8: Stop destroying cursors from letting in-flight typing and queued interactions continue after the player is stopped.
- 422640e: Allow `SpeechPlugin` to provide browser narration fallback for Gemini TTS requests without causing duplicate speech when both plugins are installed.

## 0.8.0

### Minor Changes

- a96913a: feat: let core plugins use an optional floating provider

  SayPlugin and PromptPlugin can now resolve their positioners from an installed
  floating plugin provider while keeping the existing built-in positioning
  behavior when no provider is present.

- d2b6e93: feat: add customizable positioners for SayPlugin and PromptPlugin

  SayPlugin and PromptPlugin now support custom positioners for advanced popup placement while keeping a dependency-free default behavior.

- 6c33516: feat: add built-in ThemePlugin cursor factories

  ThemePlugin now exposes built-in configurable cursor factories via `ThemePlugin.cursors.default()`, `pointer()`, and `text()`, and the default theme is sourced from those factories.

### Patch Changes

- 85bb178: fix: correct the built-in pointer cursor hotspot

  The built-in ThemePlugin pointer cursor now uses the intended hotspot offset so clicks and hover states align with the visible tip.

- 55278f5: fix: clean up speech plugin listeners when toggling docs demo plugins

  SpeechPlugin now unsubscribes from `speech_requested` when removed so repeated toggles do not stack duplicate speech handlers. The docs settings demo also keeps mutually exclusive speech and interaction plugin variants in sync.

## 0.7.1

### Patch Changes

- 1cdf649: chore: test npm provenance publishing

## 0.7.0

### Minor Changes

- 1a5e355: feat: add code-review and grill-me AI skills
- 04f4d27: feat: add `PromptPlugin` with customizable UI, and introduce asynchronous event emitter (`emitAsync`) for seamless speech integration with plugins like `SayPlugin` and `SpeechPlugin`.

### Patch Changes

- 4a0e15b: Refactor docs landing page controls into a floating player component.
- 7f0d3c4: fix: increase ripple plugin z-index so click effects aren't hidden behind regular page elements
- e69d178: fix: prevent native scroll on element focus to avoid iframe scroll jump
- 33de33f: fix: Add natural hesitation delay between click and input typing to allow visual effects to render
- 7aa5fc4: feat: integrate Particle plugin into core API and docs landing page

## 0.6.1

### Patch Changes

- f54e3ef: fix: stop typing sound automatically when typing ends and loop it out during long typing sequences

## 0.6.0

### Minor Changes

- dd7f01f: Add SayPlugin for visual speech bubbles and SpeechPlugin for Web Speech API synthesis
  - **SayPlugin**: Display speech bubbles with configurable positions (cursor, subtitle, bottom, center)
  - **SpeechPlugin**: Text-to-speech using Web Speech API with customizable voice, rate, pitch, volume
  - Both plugins expose hooks (onBeforeSay, onAfterSay) for extensibility
  - Demo page updated with toggleable Speech and Say plugin settings

## 0.5.0

### Minor Changes

- 8f8eb9b: - feat: Implemented ThemePlugin for automatic cursor theme switching.
  - feat(core): Reset hover state and trigger mouseleave when the cursor moves away.
- a92032b: Added dynamic plugin enable/disable toggle capabilities and options configuration for Cursor demo page, along with dynamically reactive updates in RipplePlugin for settings.

## 0.4.0

### Minor Changes

- 6b9e045: feat(core): introduce `.setState()` and `onStateChange` for dynamic plugin responsiveness

  Added the `.setState()` method to the Cursor queue and introduced the `onStateChange` lifecycle hook in `CursorPlugin`. This allows state changes (like cursor size or colors) to be sequenced properly and enables plugins (like `RipplePlugin`) to dynamically react to state modifications mid-animation.

## 0.3.0

### Minor Changes

- 8c72e97: feat(plugin): add configurable RipplePlugin to create a ripple visual effect on click

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
