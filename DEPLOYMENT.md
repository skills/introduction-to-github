# Deployment Guide

## Overview

This guide covers the deployment process for the introduction-to-github repository using Vercel and GitHub Actions integration.

## Prerequisites

Before deploying, ensure you have the following:

1. **Vercel Account**: Set up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Repository access with appropriate permissions
3. **Required Secrets**: See the secrets section below

## Required Secrets

The following secrets must be configured in your GitHub repository settings under `Settings > Secrets and variables > Actions`:

### Core Secrets
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `OPENAI_API_KEY` - OpenAI API key for AI PR bot functionality

### Rewards System Secrets (Test Environment)
- `REWARDS_PRIVATE_KEY` - Test wallet private key for rewards
- `ALCHEMY_MUMBAI_URL` - Alchemy RPC URL for Mumbai testnet
- `REWARDS_API_KEY` - API key for rewards system
- `REWARDS_CONTRACT_ADDRESS` - Smart contract address on Mumbai testnet
- `PILOT_TEST_WALLET` - Test wallet address for pilot program

### Repository Sync Secrets
- `GITHUB_PAT` - Personal Access Token with repo access for sync hub

## Vercel Configuration

### Setup Steps

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm install -g vercel
   ```

2. **Link Your Project**:
   ```bash
   vercel link
   ```

3. **Configure Environment Variables** in Vercel Dashboard:
   - Navigate to your project settings
   - Add production and preview environment variables as needed
   - Refer to `.env.example` for variable names

### Deployment Workflow

The repository uses GitHub Actions for automated deployments:

- **Production Deployments**: Triggered on pushes to `main` branch
- **Preview Deployments**: Triggered on pull requests
- **Manual Deployments**: Can be triggered via workflow dispatch

## GitHub Actions Workflows

### Vercel Deploy (`vercel-deploy.yml`)
Handles automated deployments to Vercel on push and PR events.

### E2E Tests (`e2e.yml`)
Runs end-to-end tests before deployment to ensure code quality.

### AI PR Bot (`ai-pr-bot.yml`)
Provides AI-powered code reviews on pull requests.

### Reward and Mint (`reward-and-mint.yml`)
Manages reward distribution and NFT minting for contributors (pilot program).

### Repo Sync (`repo-sync.yml`)
Synchronizes repository changes with downstream dependencies.

## Deployment Process

### Automatic Deployment

1. Push code to `main` branch or create a pull request
2. GitHub Actions workflow is triggered automatically
3. Tests run (if configured)
4. Deployment to Vercel initiates
5. Preview URL or production URL is generated

### Manual Deployment

1. Navigate to Actions tab in GitHub
2. Select the `Vercel Deploy` workflow
3. Click "Run workflow"
4. Select branch and confirm

## Post-Deployment

### Verification Steps

1. **Check Deployment Status**: Visit Vercel dashboard or GitHub Actions logs
2. **Test Preview URL**: Verify the deployed application works correctly
3. **Monitor Logs**: Check for any errors or warnings
4. **Validate Environment Variables**: Ensure all required variables are set

### Rollback Procedure

If issues occur after deployment:

1. Navigate to Vercel dashboard
2. Select the project
3. Go to Deployments tab
4. Find the previous stable deployment
5. Click "Promote to Production"

## Troubleshooting

### Common Issues

**Authentication Failures**:
- Verify `VERCEL_TOKEN` is valid and not expired
- Check token has appropriate permissions

**Build Failures**:
- Review build logs in GitHub Actions
- Ensure all dependencies are installed
- Verify Node.js version compatibility (using Node 20)

**Environment Variable Issues**:
- Confirm all required secrets are set in GitHub
- Verify environment variables in Vercel match `.env.example`

**Deployment Timeouts**:
- Check Vercel service status
- Review build command and optimize if necessary

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Rotate tokens regularly**, especially after team member changes
3. **Use environment-specific secrets** for development, staging, and production
4. **Enable branch protection rules** on main branch
5. **Review AI PR bot outputs** before merging to prevent information leakage

## Next Steps

After initial deployment:

1. ✅ Merge this PR to activate workflows
2. ✅ Add all required secrets to GitHub repository
3. ✅ Confirm Vercel environment variables are set
4. ✅ Run a test deployment to verify configuration
5. ✅ Monitor first production deployment
6. ✅ Enable branch protection rules
7. ✅ Review and approve CODEOWNERS configuration

## Support

For issues or questions:
- Open an issue in this repository
- Contact @chaishillomnitech1
- Review Vercel documentation at [vercel.com/docs](https://vercel.com/docs)

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [OpenAI API Documentation](https://platform.openai.com/docs)
