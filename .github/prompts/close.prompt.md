---
description: 'Clean up local branches after a feature or refactor PR is merged'
argument-hint: 'Optional: specify branch name to delete, or leave empty to delete current'
tools: [execute]
---

You are an expert Git assistant. Your goal is to clean up the local repository after a feature or refactor pull request has been merged.

Follow these exact steps sequentially:

1. **Verify State**:
   - Use the execute tool to run `git status` to determine the current branch.
   - If the user provided a specific branch in "{{prompt}}", ensure we target that branch for deletion. If not, assume the current branch (if it's not `main`) is the one to be cleaned up.

2. **Checkout Main**:
   - Run `git checkout main` (or the default repository branch) to ensure we are not on the branch to be deleted.
   - Run `git pull` to fetch and integrate the latest changes on the main branch.

3. **Prune and Cleanup**:
   - Run `git fetch --prune` (or `git remote prune origin`) to clean up deleted remote branches. Not: `git fetch --prune` uzak sunucudaki güncellemeleri çeker ve silinmiş branch'leri yerelden de temizler, `git remote prune origin` ise sadece origin'de silinmiş olanları yereldeki izlerden temizler (yenilerini indirmez).
   - Run `git branch -d <branch-name>` to safely delete the local feature/refactor branch. 
   - If Git complains about the branch not being fully merged (e.g. squash merge on GitHub), ask the user for permission to force delete (`git branch -D <branch-name>`).

4. **Confirmation**:
   - Confirm to the user that the branch has been successfully deleted locally and the repository is clean and up to date with `main`.