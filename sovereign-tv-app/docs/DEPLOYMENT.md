# Sovereign TV App - Deployment Guide

## Overview

This guide covers deployment options for the Sovereign TV App across various platforms.

---

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git
- Domain name (for production)
- SSL certificate (for HTTPS)

---

## Environment Configuration

### Required Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Security
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRATION=24h

# NFT Integration
NFT_GATEWAY_URL=https://nft.omniverse.io
KUNTA_NFT_CONTRACT_ADDRESS=0x...
NFT_VERIFICATION_ENABLED=true

# ScrollCoin
SCROLLCOIN_API_URL=https://api.scrollcoin.io
SCROLLCOIN_CONTRACT_ADDRESS=0x...
PAYMENT_TIERS_ENABLED=true

# Content Delivery
CDN_URL=https://cdn.omniverse.io
STREAMING_ENDPOINT=https://stream.omniverse.io
MUSIC_CATALOG_API=https://catalog.legacyoflight.io

# PDP Integration
PDP_DATA_URL=https://pdp.omniverse.io
PDP_SYNC_ENABLED=true

# Solar Infusion Protocol (SIP)
SIP_ENABLED=true
SIP_NODES=4
SIP_FREQUENCY_DEFAULT=963Hz
SIP_ENERGY_THRESHOLD=90

# Broadcast Network
BROADCAST_NETWORK_ENABLED=true
BROADCAST_COVERAGE=global
BROADCAST_CHANNELS=12
EDGE_NODES=24

# Performance & Load Balancing
EDGE_SERVERS=6
LOAD_BALANCING_ENABLED=true
CDN_PROVIDER=OmniVerse CDN
PERFORMANCE_MONITORING=true

# Monetization
REAL_TIME_TRANSACTIONS=true
NFT_ROYALTY_PERCENTAGE=2.5
STAKING_ENABLED=true
DYNAMIC_PRICING=true

# Analytics
ANALYTICS_ENABLED=true
METRICS_RETENTION_DAYS=365
REAL_TIME_ANALYTICS=true
DASHBOARD_UPDATE_INTERVAL=300
```

---

## Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/chaishillomnitech1/introduction-to-github.git
cd introduction-to-github/sovereign-tv-app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run

```bash
# Build image
docker build -t sovereign-tv-app .

# Run container
docker run -d \
  --name sovereign-tv \
  -p 3000:3000 \
  --env-file .env \
  sovereign-tv-app
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - ./data:/app/data
```

---

## Cloud Platform Deployments

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create sovereign-tv-app

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

### AWS EC2

```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/chaishillomnitech1/introduction-to-github.git
cd introduction-to-github/sovereign-tv-app
npm install

# Setup PM2 for process management
sudo npm install -g pm2
pm2 start src/index.js --name sovereign-tv
pm2 startup
pm2 save
```

### Google Cloud Platform

```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Deploy
gcloud app deploy

# View app
gcloud app browse
```

### DigitalOcean

```bash
# Create droplet with Node.js
# Install app
git clone https://github.com/chaishillomnitech1/introduction-to-github.git
cd introduction-to-github/sovereign-tv-app
npm install

# Use PM2
npm install -g pm2
pm2 start src/index.js
```

---

## Reverse Proxy Setup

### Nginx

```nginx
server {
    listen 80;
    server_name omniverse.io;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache

```apache
<VirtualHost *:80>
    ServerName omniverse.io
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

---

## SSL/HTTPS Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d omniverse.io -d www.omniverse.io

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Database Setup

### Initialize Data Storage

```bash
# Create data directory
mkdir -p data

# Set permissions
chmod 700 data
```

For production, consider:
- MongoDB for user data
- PostgreSQL for transactions
- Redis for caching
- IPFS for NFT metadata

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs sovereign-tv

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Log Management

```bash
# Rotate logs
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Performance Optimization

### Enable Compression

```javascript
import compression from 'compression';
app.use(compression());
```

### Caching

```javascript
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

### Rate Limiting

Already implemented in the app using rate limiting middleware.

---

## Security Checklist

- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable security headers
- [ ] Implement request validation
- [ ] Setup firewall rules
- [ ] Regular security audits

---

## Scaling

### Horizontal Scaling

```bash
# Using PM2 cluster mode
pm2 start src/index.js -i max
```

### Load Balancing

Use Nginx or cloud load balancers to distribute traffic across multiple instances.

### CDN Integration

Configure CDN for static assets and streaming content.

---

## Backup & Recovery

### Data Backup

```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Backup to cloud
aws s3 cp backup.tar.gz s3://backups/sovereign-tv/
```

### Database Backup

```bash
# MongoDB backup
mongodump --db sovereign-tv --out backup/

# PostgreSQL backup
pg_dump sovereign-tv > backup.sql
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy to production
        run: |
          # Add deployment commands
```

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Permission denied:**
```bash
sudo chown -R $USER:$USER .
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Health Checks

```bash
# Check if app is running
curl http://localhost:3000/health

# Expected response
{
  "status": "operational",
  "service": "Sovereign TV App",
  "version": "1.0.0"
}
```

---

## Support

For deployment support:
- GitHub Issues: https://github.com/chaishillomnitech1/introduction-to-github/issues
- Email: devops@omniverse.io
- Discord: https://discord.gg/omniverse

---

**Created by Chais Hill - First Remembrancer**  
*OmniTech1™ | ScrollVerse Sovereignty Protocol*
