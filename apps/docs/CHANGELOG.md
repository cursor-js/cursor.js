# docs

## 0.5.4

### Patch Changes

- afad5ef: Add CORS preflight support to the Gemini TTS API and expire stale pending TTS requests after seven days.

## 0.5.3

### Patch Changes

- Updated dependencies [538c76a]
- Updated dependencies [4b35922]
- Updated dependencies [8dda5e8]
- Updated dependencies [422640e]
  - @cursor.js/core@0.9.0

## 0.5.2

### Patch Changes

- Updated dependencies [a96913a]
- Updated dependencies [d2b6e93]
- Updated dependencies [85bb178]
- Updated dependencies [55278f5]
- Updated dependencies [6c33516]
  - @cursor.js/core@0.8.0

## 0.5.1

### Patch Changes

- Updated dependencies [1cdf649]
  - @cursor.js/core@0.7.1

## 0.5.0

### Minor Changes

- 614a887: Add installation commands to the landing page under Run Live Demo section.
- 8d93601: feat: add a simple footer to the docs layout
- 7aa5fc4: feat: integrate Particle plugin into core API and docs landing page

### Patch Changes

- b2cbb52: fix: prevent iframe scroll in ClientPage
- ec21fc9: feat: add interactive sandbox environment to landing page
- Updated dependencies [4a0e15b]
- Updated dependencies [1a5e355]
- Updated dependencies [7f0d3c4]
- Updated dependencies [e69d178]
- Updated dependencies [33de33f]
- Updated dependencies [7aa5fc4]
- Updated dependencies [04f4d27]
  - @cursor.js/core@0.7.0

## 0.4.2

### Patch Changes

- b98772c: Fix React hydration errors in docs layout by using semantic tags and providing a unique key to patched tree nodes.
- 158e0a7: fix: allow docs to be versioned to prevent changeset action from crashing with empty commits
- af89556: Style pro plugins with orange gem icon

## 0.4.1

### Patch Changes

- 012034f: Apply Fumadocs Notebook layout for documentation and Home layout for the index page.
  - Converted `DocsLayout` to use the Fumadocs `notebook` layout
  - Created `(home)` route group and implemented `HomeLayout`
  - Moved index page logic to `ClientPage.tsx` within the `(home)` directory

## 0.4.0

### Minor Changes

- e41896a: Add Fumadocs integration and create Core API documentation pages.

### Patch Changes

- 728a09c: Add missing comprehensive core API documentation pages (Cursor options, pause, next, setState, format, use, waitForEvent, type, move).
- 3ac5ff3: Add Shadcn InputGroup component to handle speed, color, duration, and size settings
- 7c1e16c: Add comprehensive documentation pages and interactive demos for all core plugins (ClickSound, Indicator, Logging, Ripple, Theme, and Custom Plugins).
- 3373ac5: Added hover card iframes with distinct visual demos for plugins: Ripple, Indicator, ClickSound, Logging.
- a92032b: Added dynamic plugin enable/disable toggle capabilities and options configuration for Cursor demo page, along with dynamically reactive updates in RipplePlugin for settings.
- Updated dependencies [8f8eb9b]
- Updated dependencies [a92032b]
  - @cursor.js/core@0.5.0

## 0.3.1

### Patch Changes

- Updated dependencies [6b9e045]
  - @cursor.js/core@0.4.0

## 0.3.0

### Minor Changes

- 8c72e97: feat(plugin): add configurable RipplePlugin to create a ripple visual effect on click

### Patch Changes

- Updated dependencies [8c72e97]
  - @cursor.js/core@0.3.0

## 0.2.0

### Minor Changes

- 1be3725: Added flow control functionality with `pause()`, `stop()`, `next()`, and `waitForEvent()` methods to Cursor.js for seamlessly pausing and resuming action queues.

### Patch Changes

- Updated dependencies [1be3725]
- Updated dependencies [159d697]
  - @cursor.js/core@0.2.0

## 0.1.1

### Patch Changes

- 3e1f5aa: Extract the built-in showIndicator feature into a standalone IndicatorPlugin.
- Updated dependencies [46247a0]
- Updated dependencies [b4c96d9]
- Updated dependencies [3e1f5aa]
- Updated dependencies [43be629]
  - @cursor.js/core@0.1.0
