---
'@cursor.js/core': minor
---

Add `startPoint` support to `Cursor` so new cursor instances can spawn from an element, selector, or explicit coordinates instead of flashing from the top-left corner. New cursors now also fade in from their initial position, and UI examples such as `CursorPlayer` can pass the clicked trigger element directly into the core API.
