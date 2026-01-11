# Branching Strategy

This document outlines the branching strategy for the `introduction-to-github` repository to facilitate streamlined development and testing cycles.

## Overview

The repository uses a **feature branch workflow** with the following branch categories:

### Main Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code; protected branch |
| `patch-*` | Quick fixes and patches |

### Feature Branch Namespaces

All feature development occurs in prefixed branches:

```
copilot/<feature-name>
```

## Current Branch Analysis

The repository contains the following feature branches organized by domain:

### Application Features
- `copilot/launch-sovereign-tv-app` - Core application launch
- `copilot/expand-sovereign-tv-app` - Extended features
- `copilot/finalize-launch-sequence-app` - Launch completion

### NFT & Blockchain
- `copilot/deploy-nft-smart-contracts` - NFT contract deployment
- `copilot/embed-nfts-in-sov-tv-app` - NFT integration
- `copilot/deploy-financial-sovereignty-zkpi` - Financial protocols

### ScrollSoul & Training
- `copilot/establish-scrollsoul-modules` - Core modules
- `copilot/develop-scrollsoul-training-module` - Training features

### Infrastructure
- `copilot/activate-high-impact-features` - Feature activation
- `copilot/build-scrollverse-portfolio-structure` - Portfolio structure
- `copilot/integrate-systems-address-alerts` - System integration

### Experimental & Research
- `copilot/develop-cosmic-string-mechanisms` - Experimental features
- `copilot/develop-spacetime-traversal-algorithms` - Algorithm research
- `copilot/develop-chronos-anchor-assets` - Asset development
- `copilot/create-solfeggio-variants` - Frequency variants
- `copilot/distribute-frequencies-and-sync-systems` - Sync systems
- `copilot/implement-planetary-ascension-functionality` - Advanced features

### Documentation
- `copilot/enhance-repo-workflow-documentation` - Documentation improvements

## Merge Opportunities

### Recommended Consolidations

1. **Application Core**: Merge `launch-sovereign-tv-app`, `expand-sovereign-tv-app`, and `finalize-launch-sequence-app` sequentially into `main`

2. **NFT Stack**: Combine `deploy-nft-smart-contracts` and `embed-nfts-in-sov-tv-app` before merging to `main`

3. **ScrollSoul Features**: Merge `establish-scrollsoul-modules` before `develop-scrollsoul-training-module`

## Branch Naming Conventions

### Format
```
<namespace>/<short-description>
```

### Examples
```
copilot/add-user-authentication
copilot/fix-streaming-bug
copilot/update-nft-metadata
patch-1
```

## Development Workflow

### Creating a New Feature Branch

```bash
# From main branch
git checkout main
git pull origin main
git checkout -b copilot/<feature-name>
```

### Keeping Branches Updated

```bash
# Update from main
git checkout copilot/<feature-name>
git fetch origin
git rebase origin/main
```

### Merging to Main

1. Ensure all tests pass
2. Create a Pull Request
3. Request code review
4. Squash and merge (recommended)

## Testing Requirements

Before merging any branch:

- [ ] All unit tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No security vulnerabilities (CodeQL)

## Branch Lifecycle

1. **Create**: Branch from `main` with descriptive name
2. **Develop**: Make incremental commits
3. **Review**: Open PR, address feedback
4. **Merge**: Squash merge to `main`
5. **Cleanup**: Delete feature branch after merge

## Interactive 3-Parameter Branch Creation

For streamlined branch creation, use the following parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `namespace` | Branch category | `copilot` |
| `action` | What the branch does | `add`, `fix`, `update` |
| `feature` | Feature name | `user-auth`, `nft-gate` |

### Format
```
<namespace>/<action>-<feature>
```

### Examples
```
copilot/add-payment-gateway
copilot/fix-streaming-buffer
copilot/update-api-docs
```

## Cleanup Recommendations

Branches that can be safely archived after review:
- Experimental branches that have been evaluated
- Fully merged feature branches
- Branches with stale changes (>30 days inactive)

## Related Documentation

- [SETUP-OVERVIEW.md](./SETUP-OVERVIEW.md) - Setup instructions
- [INTRODUCTION.md](./INTRODUCTION.md) - Project introduction
- [VISUAL-AIDS.md](./VISUAL-AIDS.md) - Diagrams and visual guides
