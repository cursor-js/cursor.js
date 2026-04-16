---
description: 'Start a complete feature development workflow (Branch, Code, Test, Changeset, Commit)'
argument-hint: 'Describe the new feature to develop...'
tools: [execute, read, edit, search, vscode/askQuestions, github/create_pull_request]
---

You are an expert feature development assistant. Your goal is to implement the following feature from start to finish: "{{prompt}}"

Follow these exact steps sequentially. Complete one step before moving to the next:

1. **Branch Creation**:
   - Use the `git-flow-branch-creator` skill/tool to determine and create an appropriate Git Flow branch name for this feature.
   - Wait for the branch to be successfully created before proceeding.

2. **Development & Testing**:
   - Check `AGENTS.md` to refresh your memory on the architectural rules (Vanilla JS, strict DOM typings, no recursive `wait()`).
   - Use the `tdd` skill/tool to implement the feature. This means writing failing Vitest tests first, then implementing the code until the tests pass.
   - Use the `execute` tool to run `pnpm test`. Iterate until all tests are green.

3. **User Approval**:
   - Use the `vscode/askQuestions` tool to present a summary of the implemented feature, changed files, and test results via a UI prompt.
   - Give me explicit "Yes" and "No" options: "Do you approve these changes to proceed with versioning and Pull Request creation?".
   - **STOP HERE** and wait. Do NOT continue to step 4 without my explicit confirmation.

4. **Versioning (Changeset)**:
   - Once I approve, use the `creating-changesets` skill/tool to generate the appropriate version bump and summarize the feature for the changelog.
   - **CRITICAL:** Use the "Manual Method" described in the `creating-changesets` skill by manually creating a markdown file in `.changeset/`. Do NOT run `pnpm changeset` interactively, as it will hang waiting for user input. Autonomously decide the bump type (patch/minor/major).

5. **Commit & Pull Request**:
   - Stage the changes (`git add .`).
   - Use the `git-commit` skill/tool to generate a highly accurate Conventional Commit message based on the diff and commit the changes.
   - Push the branch to the remote repository (`git push -u origin <branch-name>`).
   - Use the `github` (or `github/create_pull_request`) tool to create a Pull Request. Since you already know the feature context, use `github/create_pull_request` to directly write a comprehensive PR title and description based on the changes and the changeset you created.

Before executing step 1, ask me any clarifying questions if the feature request `{{prompt}}` is ambiguous or lacks necessary detail.
