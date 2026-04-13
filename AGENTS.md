# Actor.js Copilot Workspace Instructions

Welcome to the **Actor.js** repository. This library provides a realistic, human-like virtual cursor for end-to-end testing, interactive tutorials, frontend automation, and demonstration purposes. It mimics human cursor movements using mathematical Bezier curves (Fitts's Law) and executes synthetic native browser events (like `mousedown`, `click`, `input`, etc.) accurately to provide an experience close to Playwright and Cypress directly inside the DOM.

## ��� Architectural Overview

-   **Visual Layer (`src/core/Cursor.ts`)**: Renders a virtual mouse cursor (`#actor-cursor`) on the DOM using `position: absolute`. It seamlessly adapts to window scrolling and resizing, matching absolute coordinates `(pageX, pageY)`. Includes an "out of bounds" indicator for tracking the cursor when it scrolls outside the viewport.
-   **Engine & Queue (`src/Actor.ts`)**: A robust, chainable, and async-friendly promise-based action queue. Features declarative methods like `.hover()`, `.click()`, and `.type()`. Handles delays and humanized animation frames.
-   **Event Dispatcher (`src/core/EventDispatcher.ts`)**: Directly interfaces with DOM to dispatch real `MouseEvent` and `Event` classes. It triggers synthetic `mouseenter`/`mouseleave` to simulate hover states via CSS classes (`.actor-hover`). Also overrides the React 16+ Native value setter hack to trigger robust input/change simulation.
-   **Math Utilities (`src/core/utils.ts`)**: Contains algorithms (like Bezier curve logic) required for humanized sweeping and ease-out approximations.

## ���️ Code Style & Rules

When modifying or extending this library, GitHub Copilot must follow these core guidelines:
1. **TypeScript Focus**: Avoid implicit `any`. Use strict DOM typings (e.g., `HTMLElement`, `HTMLInputElement`, `MouseEventInit`).
2. **Framework Agnostic**: The dispatcher must rely purely on native vanilla JS APIs to remain universally compatible with React, Vue, Angular, or Vanilla JS without locking into one ecosystem. Handle native prototypes when manipulating properties like element values.
3. **No Deadlocks in Promise Queues**: When adding internal asynchronous waits within the `Actor` sequence, use raw `setTimeout` inside promises. Never call `this.wait()` recursively inside action methods, as it triggers infinite loops by pushing wait events into the tail of the main queue instead of resolving inline.
4. **Testing (Vitest + JSDOM)**: All features must be tested. We use `vitest` and `jsdom`. Do not assume visual layouts are fully calculated in `jsdom` (mock `getBoundingClientRect` when necessary).
5. **Code Standards**: The project uses ESLint and Prettier. Ensure the codebase remains clean and uniformly formatted using `pnpm lint` and `pnpm format`.
6. **Library Mode**: We use Vite in library mode (`vite-plugin-dts`). Edits to core files must maintain export integrity in `src/index.ts`.
7. **English Interfaces**: Ensure demo (`index.html`, `src/main.ts`) and codebase terminologies, comments, variable names, and documentation are strictly in **English**.

## ��� API Quick Reference Example

```typescript
const actor = new Actor({ humanize: true, showIndicator: true, speed: 0.5 });
// Chaining and async await style support
await actor
  .hover('#submit-btn')
  .wait(500)
  .click('#submit-btn')
  .type('.search-input', 'Hello World', { delay: 50 });
```

Please keep these contextual pointers in mind throughout our interaction.
