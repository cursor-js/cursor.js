# Cursor.js

A realistic, human-like virtual cursor for end-to-end testing, interactive tutorials, frontend automation, and demonstration purposes. Cursor.js mimics human cursor movements using mathematical Bezier curves (inspired by Fitts's Law) and executes synthetic native browser events (like `mousedown`, `click`, `input`, etc.) accurately to provide an experience close to Playwright and Cypress directly inside the DOM.

## Features

- **Human-like Movements**: Natural cursor sweeping and easing using Bezier curves.
- **Native Event Dispatching**: Accurately simulates real DOM events (`mouseenter`, `click`, `input`).
- **Framework Agnostic**: Works purely with vanilla JS, making it compatible with React, Vue, Angular, or plain HTML.
- **Chainable API**: Easy-to-use, robust, and async-friendly promise-based action queue.
- **Visual Cursor**: Seamlessly adapts to window scrolling and resizing with out-of-bounds indicators.

## Installation

Install `cursor.js` via npm, yarn, or pnpm.

```bash
npm install cursor.js
```

## Importing and Initialization

Import the `Actor` class and initialize it with your desired options:

```typescript
import { Actor } from 'cursor.js';

const actor = new Actor({
  humanize: true,
  showIndicator: true,
  speed: 0.5,
});
```

## Usage Example

Cursor.js provides a robust, chainable, and async-friendly promise-based API. You can easily sequence actions like hovering, clicking, and typing.

```typescript
// Chaining and async/await style support
await actor
  .hover('#submit-btn')
  .wait(500)
  .click('#submit-btn')
  .type('.search-input', 'Hello World', { delay: 50 });
```

## Contributing

We welcome contributions to `cursor.js`! Since this project is a Turborepo monorepo and uses **Changesets** for version management, please follow these steps when proposing changes:

1. Fork the repo and create a new branch from `main` (e.g., `feat/my-new-feature` or `fix/button-click`).
2. Make your code changes and add your tests.
3. Run `pnpm changeset` in the root of the repository.
   - Select the package(s) you modified.
   - Choose the bump type (major, minor, or patch).
   - Write a short summary of your changes (this will appear in the `CHANGELOG.md`).
4. Commit your changes **along with** the generated `.changeset/*.md` file.
5. Open a Pull Request! Our automated system will take care of the rest.

## Architectural Overview

- **Visual Layer (`src/core/Cursor.ts`)**: Renders a virtual mouse cursor (`#actor-cursor`) on the DOM using `position: absolute`. It seamlessly adapts to window scrolling and resizing, matching absolute coordinates `(pageX, pageY)`. Includes an "out of bounds" indicator for tracking the cursor when it scrolls outside the viewport.
- **Engine & Queue (`src/Actor.ts`)**: A robust, chainable, and async-friendly promise-based action queue. Features declarative methods like `.hover()`, `.click()`, and `.type()`. Handles delays and humanized animation frames.
- **Event Dispatcher (`src/core/EventDispatcher.ts`)**: Directly interfaces with DOM to dispatch real `MouseEvent` and `Event` classes. It triggers synthetic `mouseenter`/`mouseleave` to simulate hover states via CSS classes (`.actor-hover`). Also overrides the React 16+ Native value setter hack to trigger robust input/change simulation.
- **Math Utilities (`src/core/utils.ts`)**: Contains algorithms (like Bezier curve logic) required for humanized sweeping and ease-out approximations.

## License

MIT
