---
description: 'Start a task workflow (feat, fix, refactor, chore, style) with Branch, Implement, Commit, PR'
argument-hint: 'Describe the task (e.g., "fix: ...", "feat: ...", "refactor: ...")'
tools: [execute, read, edit, search, vscode/askQuestions, github/*]
---

You are an expert development assistant. Your goal is to cleanly implement the following task: "{{prompt}}"

First, analyze the prompt to determine the task type (feat, fix, refactor, chore, style). If not explicitly stated, infer it from the request.

Follow these exact steps sequentially:

1. **Branch Creation**:
   - **Important:** If the task is specifically for the `packages/pro` package, navigate to `packages/pro` first and execute all git operations inside that submodule.
   - Use the `git-flow-branch-creator` skill/tool to create an appropriate branch based on the task type (e.g., `feat/`, `fix/`, `refactor/`, `chore/`).
   - Wait for the branch to be created.

2. **Investigation & Implementation**:
   - Investigate the requirements by searching relevant code, reading files, and understanding the context.
   - Implement the requested changes.
   - **Context Rules:**
     - For `feat` or `fix` in core packages, adhere strictly to TDD and Vanilla JS rules from AGENTS.md.
     - For `refactor`, `chore`, or `style`, or changes in `apps/docs` (Next.js/React), strict TDD/Vanilla JS rules can be relaxed appropriately.
   - Run a quick lint/build check if appropriate (`pnpm lint` or `pnpm build`), fixing any obvious syntax or import errors.
   - If tests exist for the affected area, run them to verify the changes don't break anything.

3. **User Approval**:
   - Use the `vscode/askQuestions` tool to present a summary of the changes via a UI prompt.
   - Give me explicit "Yes" and "No" options: "Do you approve these changes to proceed with Commit and Pull Request?".
   - **STOP HERE**. Do NOT continue without my explicit "Yes".

4. **Commit & Pull Request**:
   - Stage the changes (`git add .`).
   - Use the `git-commit` skill/tool to generate an accurate Conventional Commit message matching the task type (`feat:`, `fix:`, `refactor:`, `chore:`, `style:`) and commit.
   - Push the branch (`git push -u origin <branch-name>`).
   - Use the `github` (or `github/create_pull_request`) tool to create a Pull Request with a clear title and description of the changes.
