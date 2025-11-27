# Setup Overview

This guide provides step-by-step instructions for setting up the introduction-to-github repository and its components.

## Prerequisites

### System Requirements
- **Node.js**: >= 18.0.0
- **Python**: >= 3.11 (for portfolio apps)
- **npm**: >= 9.0.0
- **Git**: >= 2.30

### Accounts Required
- GitHub account
- (Optional) OmniVerse account for full feature access

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/chaishillomnitech1/introduction-to-github.git
cd introduction-to-github
```

### 2. Choose Your Setup Path

| Component | Description | Directory |
|-----------|-------------|-----------|
| **Sovereign TV App** | Node.js streaming platform | `./sovereign-tv-app/` |
| **ScrollVerse Portfolio** | Flask portfolio website | `./scrollverse-portfolio/` |
| **CodexTV App** | Flask video streaming | `./codextv-app/` |

## Component Setup

### Sovereign TV App (Recommended)

The main application for the OmniVerse distribution channel.

```bash
# Navigate to the app directory
cd sovereign-tv-app

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev

# Or start production server
npm start
```

**Access at**: http://localhost:3000

#### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with auto-reload |
| `npm test` | Run test suite |
| `npm run lint` | Check code quality |
| `npm run build` | Build for production |

### ScrollVerse Portfolio

Flask-based portfolio showcasing the ScrollVerse ecosystem.

```bash
# Navigate to directory
cd scrollverse-portfolio

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Start the application
flask run
```

**Access at**: http://localhost:5000

### CodexTV App

Video streaming platform with Flask Pass View.

```bash
# Navigate to directory
cd codextv-app

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Start the application
flask run --port=5001
```

**Access at**: http://localhost:5001

## Environment Configuration

### Sovereign TV App (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-secure-jwt-secret-key

# External Services
SCROLLCOIN_API_URL=https://api.scrollcoin.io
NFT_GATEWAY_URL=https://nft.omniverse.io
```

### Flask Apps (.env)

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secure-secret-key
PORT=5000
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b copilot/your-feature-name
```

### 2. Make Changes

Edit files, run tests, verify functionality.

### 3. Run Tests

```bash
# For Sovereign TV App
cd sovereign-tv-app
npm test
npm run lint

# For Flask apps
cd scrollverse-portfolio
python -m pytest  # if tests exist
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: describe your changes"
```

### 5. Push and Create PR

```bash
git push origin copilot/your-feature-name
# Then create a Pull Request on GitHub
```

## Docker Setup (Optional)

Each application includes a Dockerfile for containerized deployment.

### Build and Run Sovereign TV App

```bash
cd sovereign-tv-app
docker build -t sovereign-tv-app .
docker run -p 3000:3000 sovereign-tv-app
```

### Using Docker Compose

Create a `docker-compose.yml` in the root directory:

```yaml
version: '3.8'
services:
  sovereign-tv:
    build: ./sovereign-tv-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
  
  scrollverse-portfolio:
    build: ./scrollverse-portfolio
    ports:
      - "5000:5000"
  
  codextv:
    build: ./codextv-app
    ports:
      - "5001:5001"
```

Run with:
```bash
docker-compose up -d
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using the port
lsof -i :3000
# Kill the process
kill -9 <PID>
```

#### Node Version Issues
```bash
# Use nvm to manage Node versions
nvm install 18
nvm use 18
```

#### Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Getting Help

- **GitHub Issues**: Report a bug in the repository's Issues tab
- **Discord**: Join the OmniVerse Community
- **Email**: support@omniverse.io

## Next Steps

After setup, explore:

1. [INTRODUCTION.md](./INTRODUCTION.md) - Understand the project
2. [BRANCHING-STRATEGY.md](./BRANCHING-STRATEGY.md) - Development workflow
3. [VISUAL-AIDS.md](./VISUAL-AIDS.md) - Architecture diagrams
4. [../sovereign-tv-app/README.md](../sovereign-tv-app/README.md) - Main application docs
