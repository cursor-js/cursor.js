# Project Guidelines

## Code Style

- **TypeScript Focus**: Avoid implicit `any`. Use strict DOM typings (e.g., `HTMLElement`, `HTMLInputElement`, `MouseEventInit`).
- **Framework Agnostic**: Rely purely on native vanilla JS APIs (no ecosystem lock-in). Handle native prototypes when manipulating properties like element values.
- **Standards & Language**: Ensure terminology, variable names, and documentation are strictly in **English**. Run `pnpm lint` and `pnpm format` for formatting.

## Architecture

- **Overview**: See [README.md](README.md) for the true Architectural Overview (Visual Layer, Engine & Queue, Event Dispatcher, Math Utilities).
- **Core Library**: We use Vite in library mode (`vite-plugin-dts`). Edits to core files must maintain export integrity in `packages/core/src/index.ts`.

## Build and Test

- **Package Manager & Monorepo**: Use `pnpm` and Turborepo. Run commands from the root:
  - Build: `pnpm build`
  - Test: `pnpm test` (Runs `vitest`)
  - Lint: `pnpm lint`
- **Releases**: We use Changesets. Always run `pnpm changeset` for any proposed feature, bug fix, or breaking change, and commit the generated `.changeset/*.md` file.

## Conventions

- **No Deadlocks in Promise Queues**: When adding internal asynchronous waits within the `Cursor` sequence, use raw `setTimeout` inside promises. **Never** call `this.wait()` recursively inside action methods, as it triggers infinite loops by pushing wait events into the tail of the main queue instead of resolving inline.
- **Testing Constraints**: Do not assume visual layouts are fully calculated in `jsdom` (mock `getBoundingClientRect` when necessary).
- **React Input Hack**: Event dispatchers must bypass the React 16+ native value setter hack to trigger reliable input simulations (handled in `EventDispatcher.ts`).
