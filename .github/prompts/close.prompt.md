---
description: 'Check deployment, merge PR, and clean up local branches (Git Flow)'
argument-hint: 'Optional: specify branch name to delete, or leave empty for current'
tools: [execute, github/*, vscode/askQuestions]
---

You are an expert Git Flow assistant. Your goal is to verify PR deployment, optionally merge the PR, and clean up the repository.

Follow these exact steps sequentially:

1. **Verify State & Deployment**:
   - Use the `execute` tool (`git status`) to determine the current branch.
   - Use `github` tools (like `github_get_pull_request` or checks API) to find the open Pull Request associated with this branch.
   - Check the deployment statuses/checks on the PR (e.g., Vercel). Since deployment takes time, poll the status periodically using sleep (e.g., `sleep 10` in `execute` between checks) until it reports `success` or `failure`.
   - Wait until a final state is reached.

2. **User Approval (vscode/askQuestions)**:
   - Present the deployment status to the user.
   - If the status is `success`, explicitly provide the Deployment Preview URL.
   - Use the `vscode/askQuestions` tool to ask if they approve the deployment and wish to proceed.
   - Question: "Deployment Status: [Status]. URL: [URL]. Do you approve merging this PR and deleting the branch locally and remotely?"
   - Options: "Yes" and "No".
   - **STOP HERE** and wait for the user's explicit decision. Do NOT proceed to step 3 without it.

3. **Merge Pull Request**:
   - If the user selects "Yes", use the `github` tool to merge the associated Pull Request into the target base branch (e.g., `main` or `develop`).
   - _Note_: If the user selects "No", stop the task completely so they can make changes.

4. **Checkout Base, Pull and Cleanup**:
   - Run the following command to switch to the base branch, pull the latest changes from origin, safely delete the remote and local feature branches, and clean up remote tracking references:
     `git checkout <base-branch> && git pull origin <base-branch> && (git push origin --delete <branch-name> || true) && git branch -d <branch-name> && git remote prune origin`
   - _Note on Pruning_: We use `git remote prune origin` here to simply remove deleted remote branch references from your local system without downloading new objects.
   - If Git complains about the branch not being fully merged locally, ask the user for permission to force delete (`git branch -D <branch-name>`).

5. **Confirmation**:
   - Confirm to the user that the PR has been merged, the branch has been successfully deleted locally, and the repository is clean.
