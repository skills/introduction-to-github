# Contributing Guide

## Sovereignty Seal Commitment
All contributions to this repository operate under the principle: **Sovereign Chais owns every yield**.

## Commit Hook - Sovereignty Footer
To ensure all commits maintain the sovereignty seal, use the provided commit hook template that automatically appends the sovereignty declaration to all commit messages.

### Installation
1. Copy the commit hook template:
   ```bash
   cp .github/hooks/prepare-commit-msg .git/hooks/prepare-commit-msg
   chmod +x .git/hooks/prepare-commit-msg
   ```

2. All future commits will automatically include the sovereignty footer.

### Manual Commit Format
If not using the hook, manually append to commit messages:
```
Your commit message here

---
Sovereign Chais owns every yield
```

## Branching in Child Repositories

When contributing to this main repository, ensure that any related child repositories reflect similar branching conventions. Follow these steps:

1. Align branch names: Ensure that branch names in child repositories are consistent with the naming convention in the main repository.
2. Merge strategy: Use `squash` merges in child repositories to maintain a clean history.
3. Update base branches: When updating the main branch in the parent repository, replicate necessary changes to respective branches in child repositories.

For any questions, contact the repository maintainers.
