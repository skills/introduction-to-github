---
name: Vercel Setup Issue
about: Track Vercel integration setup and configuration
title: '[VERCEL] Setup Vercel Integration'
labels: ['deployment', 'vercel', 'infrastructure']
assignees: ['chaishillomnitech1']
---

## Vercel Setup Checklist

### Prerequisites
- [ ] Vercel account created
- [ ] Project linked to GitHub repository
- [ ] Vercel CLI installed locally (optional)

### Required Secrets Configuration

Configure the following secrets in GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### Core Secrets
- [ ] `VERCEL_TOKEN` - Vercel authentication token
  - Generate at: https://vercel.com/account/tokens
  - Scope: Full access
- [ ] `VERCEL_ORG_ID` - Vercel organization ID
  - Found in: Vercel project settings
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID
  - Found in: Vercel project settings

#### OpenAI Integration
- [ ] `OPENAI_API_KEY` - OpenAI API key for AI PR bot
  - Generate at: https://platform.openai.com/api-keys
  - Usage limit configured for conservative usage

#### Rewards System (Test Environment)
- [ ] `REWARDS_PRIVATE_KEY` - Test wallet private key
  - ⚠️ Use test wallet only - Mumbai testnet
- [ ] `ALCHEMY_MUMBAI_URL` - Alchemy RPC URL for Mumbai
  - Get from: https://www.alchemy.com/
- [ ] `REWARDS_API_KEY` - Rewards system API key
- [ ] `REWARDS_CONTRACT_ADDRESS` - Smart contract address (Mumbai)
- [ ] `PILOT_TEST_WALLET` - Pilot program test wallet address

#### Repository Sync
- [ ] `GITHUB_PAT` - Personal Access Token with repo scope
  - Generate at: https://github.com/settings/tokens
  - Scope: `repo` for downstream sync

### Vercel Environment Variables

Configure in Vercel Dashboard (`Project Settings > Environment Variables`):

- [ ] `NODE_ENV` = `production`
- [ ] `GITHUB_TOKEN` (if needed for API calls)
- [ ] Additional project-specific variables from `.env.example`

### Deployment Configuration

- [ ] Review `.vercel.json` configuration
- [ ] Verify `.vercelignore` excludes appropriate files
- [ ] Confirm build command in `package.json`
- [ ] Test local build: `npm run build`

### Workflow Validation

- [ ] `.github/workflows/vercel-deploy.yml` - Vercel deployment automation
- [ ] `.github/workflows/e2e.yml` - End-to-end testing
- [ ] `.github/workflows/ai-pr-bot.yml` - AI code review bot
- [ ] `.github/workflows/reward-and-mint.yml` - Contribution rewards
- [ ] `.github/workflows/repo-sync.yml` - Repository synchronization

### Initial Deployment

- [ ] Merge Phase 2 rollout PR
- [ ] Verify workflows are enabled in Actions tab
- [ ] Trigger manual deployment via workflow dispatch
- [ ] Verify deployment succeeds
- [ ] Check deployment logs for errors
- [ ] Test deployed application

### Post-Deployment Verification

- [ ] Production URL accessible
- [ ] Preview deployments work for PRs
- [ ] AI PR bot comments on test PR
- [ ] Verify no secrets exposed in logs
- [ ] Branch protection rules enabled
- [ ] CODEOWNERS file active

### Security Checklist

- [ ] All secrets stored in GitHub Secrets (never committed)
- [ ] Token rotation schedule established
- [ ] Environment-specific secrets configured
- [ ] Branch protection rules enabled on `main`
- [ ] Required reviews configured (via CODEOWNERS)
- [ ] Vercel deployment logs reviewed for sensitive data

### Troubleshooting

Common issues and solutions:

**Issue:** Authentication failed
- **Solution:** Verify `VERCEL_TOKEN` is valid and not expired

**Issue:** Build fails
- **Solution:** Check Node.js version (should be 20), verify all dependencies installed

**Issue:** Missing environment variables
- **Solution:** Compare Vercel dashboard variables with `.env.example`

**Issue:** Workflow doesn't trigger
- **Solution:** Ensure workflows are enabled in repository Actions settings

### Documentation

- [ ] Review `DEPLOYMENT.md` for detailed setup instructions
- [ ] Update team on deployment process
- [ ] Document any custom configuration or deviations

### Next Steps

After completing this checklist:

1. Monitor first production deployment closely
2. Set up alerts for deployment failures (Vercel dashboard)
3. Schedule regular secret rotation
4. Review and optimize workflow performance
5. Consider additional environments (staging)

### Notes

<!-- Add any setup-specific notes, issues encountered, or custom configurations here -->

### References

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [DEPLOYMENT.md](../../DEPLOYMENT.md)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

**Assigned to:** @chaishillomnitech1
**Priority:** High
**Estimated Time:** 2-3 hours
