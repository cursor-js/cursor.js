# Project Guidelines

## Code Style

- **TypeScript Focus**: Avoid implicit `any`. Use strict DOM typings (e.g., `HTMLElement`, `HTMLInputElement`, `MouseEventInit`).
- **Framework Agnostic**: Rely purely on native vanilla JS APIs (no ecosystem lock-in). Handle native prototypes when manipulating properties like element values.
- **Standards & Language**: Ensure terminology, variable names, and documentation are strictly in **English**. Run `pnpm lint` and `pnpm format` for formatting.

## Architecture

- **Overview**: See [README.md](README.md) for the true Architectural Overview (Visual Layer, Engine & Queue, Event Dispatcher, Math Utilities).
- **Core Library**: We use Vite in library mode (`vite-plugin-dts`). Edits to core files must maintain export integrity in `packages/core/src/index.ts`.
- **Pro Submodule**: The `packages/pro` directory is an independent Git submodule. When a user asks to add a feature or plugin to the `pro` package, **always** `cd packages/pro` first, and execute all `git branch`, `git commit`, and `changeset` commands exclusively inside that directory. Do not use the root monorepo changeset configuration for `packages/pro`.

## Gemini TTS Approval Flow

- **License-gated requests**: `GeminiTTSPlugin` uses a license key when it requests uncached voice narration from the hosted Cursor.js TTS API. Cached CDN audio can play without creating a new generation request.
- **Public internal demo key**: The project has an internal demo Gemini TTS license key that may be embedded in public demos, snippets, Product Hunt launch demos, or other external sites. Treat this key as public by design, not as a secret.
- **Approval queue**: Any uncached voice request made with a valid Gemini TTS license key is written to the user's `/dashboard/gemini-tts` approval queue. The request itself does not generate audio immediately.
- **Manual generation**: Audio is generated with Gemini TTS only after the owning user signs in and explicitly approves the queued voice request from `/dashboard/gemini-tts`. Approved audio is then stored and served from the CDN for later playback.
- **Abuse model**: A malicious person may use the public internal demo key to create pending voice requests, but they cannot force audio generation or spend Gemini TTS generation cost unless the dashboard owner approves those requests.
- **MVP security scope**: There is currently no rate limiting, domain allowlist, origin restriction, or other domain-based abuse protection around the public internal demo key. These controls were intentionally skipped for the MVP because manual dashboard approval is the primary safety gate.

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
