# ScrollVerse Portfolio - Deployment Guide

## Overview

This guide covers deployment options for the ScrollVerse Portfolio application, including Docker-based deployment, environment configuration, secret handling, and security best practices.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Secret Handling](#secret-handling)
4. [Docker Deployment](#docker-deployment)
5. [GitHub Webhook Configuration](#github-webhook-configuration)
6. [Security Checklist](#security-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker 20.10+ (for containerized deployment)
- Python 3.11+ (for local development)
- Git
- Access to a secrets management system (recommended for production)

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FLASK_SECRET_KEY` | Flask session encryption key | `your-secure-random-key-here` |
| `ADMIN_TOKEN` | Token for admin endpoint authentication | `your-admin-token-here` |
| `GITHUB_WEBHOOK_SECRET` | HMAC secret for GitHub webhook validation | `your-webhook-secret-here` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `5000` |
| `FLASK_DEBUG` | Enable debug mode | `False` |
| `FLASK_ENV` | Environment setting | `production` |
| `SECRET_KEY` | Fallback for `FLASK_SECRET_KEY` | `scrollverse-sovereign-key` |

### Example `.env` File

```bash
# Flask Configuration
FLASK_APP=app.py
FLASK_DEBUG=False
FLASK_ENV=production

# Server Configuration
PORT=5000
FLASK_SECRET_KEY=your-secure-random-key-minimum-32-characters

# Admin Authentication
ADMIN_TOKEN=your-secure-admin-token-minimum-32-characters

# GitHub Webhook
GITHUB_WEBHOOK_SECRET=your-github-webhook-secret

# Application Settings
APP_NAME=ScrollVerse Portfolio
APP_VERSION=1.0.0
```

---

## Secret Handling

### Generating Secure Secrets

Use Python to generate secure random secrets:

```bash
# Generate a 32-character secret key
python -c "import secrets; print(secrets.token_hex(32))"

# Generate a URL-safe token
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Production Secret Management

**Recommended approaches:**

1. **Environment Variables via CI/CD**
   - Store secrets in GitHub Secrets, GitLab CI/CD variables, or similar
   - Inject at deployment time

2. **Docker Secrets (Docker Swarm)**
   ```bash
   echo "your-secret" | docker secret create flask_secret_key -
   ```

3. **Cloud Provider Secret Managers**
   - AWS Secrets Manager
   - Google Cloud Secret Manager
   - Azure Key Vault
   - HashiCorp Vault

### Security Best Practices

- **Never commit secrets** to version control
- Use **minimum 32-character** secrets for cryptographic keys
- **Rotate secrets** regularly (recommended: every 90 days)
- Use **different secrets** for each environment (dev, staging, production)
- Enable **audit logging** for secret access

---

## Docker Deployment

### Building the Docker Image

```bash
# Navigate to the scrollverse-portfolio directory
cd scrollverse-portfolio

# Build the image
docker build -t scrollverse-portfolio:latest .

# Build with specific tag
docker build -t scrollverse-portfolio:v1.0.0 .
```

### Running the Container

#### Basic Run

```bash
docker run -d \
  --name scrollverse-portfolio \
  -p 5000:5000 \
  -e FLASK_SECRET_KEY="your-secure-secret-key" \
  -e ADMIN_TOKEN="your-admin-token" \
  -e GITHUB_WEBHOOK_SECRET="your-webhook-secret" \
  scrollverse-portfolio:latest
```

#### Run with Environment File

```bash
# Create .env file with your secrets
docker run -d \
  --name scrollverse-portfolio \
  -p 5000:5000 \
  --env-file .env \
  scrollverse-portfolio:latest
```

#### Run with Resource Limits

```bash
docker run -d \
  --name scrollverse-portfolio \
  -p 5000:5000 \
  --env-file .env \
  --memory="512m" \
  --cpus="1.0" \
  --restart=unless-stopped \
  scrollverse-portfolio:latest
```

### Docker Compose Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  scrollverse-portfolio:
    build: .
    image: scrollverse-portfolio:latest
    container_name: scrollverse-portfolio
    ports:
      - "5000:5000"
    environment:
      - FLASK_SECRET_KEY=${FLASK_SECRET_KEY}
      - ADMIN_TOKEN=${ADMIN_TOKEN}
      - GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}
      - FLASK_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:5000/api/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
```

Run with Docker Compose:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Container Management

```bash
# View container status
docker ps

# View logs
docker logs scrollverse-portfolio

# Follow logs
docker logs -f scrollverse-portfolio

# Stop container
docker stop scrollverse-portfolio

# Remove container
docker rm scrollverse-portfolio

# Restart container
docker restart scrollverse-portfolio
```

---

## GitHub Webhook Configuration

### Setting Up the Webhook

1. Navigate to your GitHub repository
2. Go to **Settings** > **Webhooks** > **Add webhook**
3. Configure the webhook:
   - **Payload URL**: `https://your-domain.com/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: Your `GITHUB_WEBHOOK_SECRET` value
   - **SSL verification**: Enable (recommended)
   - **Events**: Select events to receive (e.g., `push`, `pull_request`)

### Generating a Webhook Secret

```bash
# Generate a secure webhook secret
python -c "import secrets; print(secrets.token_hex(32))"
```

### Webhook Signature Validation

The application validates GitHub webhooks using HMAC-SHA256:

1. GitHub sends `X-Hub-Signature-256` header with each request
2. Application computes HMAC-SHA256 of payload using `GITHUB_WEBHOOK_SECRET`
3. Request is rejected if signatures don't match

### Testing Webhook Configuration

After setting up the webhook:

1. GitHub sends a `ping` event automatically
2. Check application logs for successful receipt
3. Or manually trigger an event (e.g., push a commit)

---

## Security Checklist

### Pre-Deployment

- [ ] Generate strong, unique `FLASK_SECRET_KEY` (minimum 32 characters)
- [ ] Generate strong, unique `ADMIN_TOKEN` (minimum 32 characters)
- [ ] Generate strong, unique `GITHUB_WEBHOOK_SECRET` (minimum 32 characters)
- [ ] Verify no secrets are committed to version control
- [ ] Review `.dockerignore` excludes sensitive files

### Deployment

- [ ] Use HTTPS in production
- [ ] Enable container health checks
- [ ] Set appropriate resource limits
- [ ] Configure automatic restart policies
- [ ] Use non-root user in container (already configured)

### Post-Deployment

- [ ] Test health endpoint: `GET /api/health`
- [ ] Test admin authentication: `GET /admin` with `Authorization: Bearer <token>`
- [ ] Test webhook endpoint with ping event
- [ ] Enable logging and monitoring
- [ ] Set up alerting for failed health checks

### Ongoing

- [ ] Rotate secrets every 90 days
- [ ] Update dependencies regularly
- [ ] Monitor for security vulnerabilities
- [ ] Review access logs periodically

---

## Troubleshooting

### Common Issues

**Container fails to start:**
```bash
# Check container logs
docker logs scrollverse-portfolio

# Verify environment variables are set
docker exec scrollverse-portfolio env | grep -E "(FLASK|ADMIN|GITHUB)"
```

**Health check failing:**
```bash
# Test health endpoint manually
curl http://localhost:5000/api/health
```

**Admin endpoint returns 401:**
```bash
# Verify ADMIN_TOKEN is set
docker exec scrollverse-portfolio env | grep ADMIN_TOKEN

# Test with correct token
curl -H "Authorization: Bearer your-admin-token" http://localhost:5000/admin
```

**Webhook returns 403:**
```bash
# Verify GITHUB_WEBHOOK_SECRET is set
docker exec scrollverse-portfolio env | grep GITHUB_WEBHOOK_SECRET

# Check webhook configuration in GitHub matches
```

### Useful Commands

```bash
# View container resource usage
docker stats scrollverse-portfolio

# Execute command in container
docker exec -it scrollverse-portfolio /bin/bash

# Check container health
docker inspect --format='{{.State.Health.Status}}' scrollverse-portfolio

# View container network
docker network inspect bridge
```

---

## API Endpoints Reference

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main portfolio page |
| `/api/health` | GET | Health check |
| `/api/about` | GET | About data |
| `/api/projects` | GET | Projects data |
| `/api/blockchain` | GET | Blockchain data |
| `/api/flamedna` | GET | FlameDNA NFT data |
| `/api/omnitech/knowledge-graph` | GET | Knowledge graph data |
| `/api/omnitech/network-harmony` | GET | Network harmony metrics |

### Protected Endpoints (Require Admin Token)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin` | GET | Admin dashboard |
| `/api/omnitech/broadcast` | POST | Send broadcast message |

### Webhook Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook/github` | POST | GitHub webhook receiver |

---

## Support

For deployment support:
- GitHub Issues: https://github.com/chaishillomnitech1/introduction-to-github/issues
- Email: devops@omniverse.io

---

**Created by Chais Hill - First Remembrancer**  
*OmniTech1™ | ScrollVerse Sovereignty Protocol*
