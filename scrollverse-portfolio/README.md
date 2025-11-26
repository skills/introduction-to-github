# ScrollVerse Portfolio
# A deployable Flask-based portfolio showcasing the ScrollVerse ecosystem

## Features
- **About Section**: ScrollVerse concept, mission, and vision
- **Projects Section**: OmniTech1 ecosystem projects showcase
- **Blockchain Section**: KUNTA NFT and ScrollCoin information
- **Dark Theme**: Elegant dark-based design with gold/blue accents

## Quick Start

### Prerequisites
- Python 3.9+
- pip

### Installation

```bash
# Navigate to the portfolio directory
cd scrollverse-portfolio

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run the application
python app.py
```

### Access the Application
Open your browser and navigate to: `http://localhost:5000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main portfolio page |
| `/about` | GET | About section |
| `/projects` | GET | Projects section |
| `/blockchain` | GET | Blockchain section |
| `/api/health` | GET | Health check |
| `/api/about` | GET | About data (JSON) |
| `/api/projects` | GET | Projects data (JSON) |
| `/api/blockchain` | GET | Blockchain data (JSON) |

## Deployment

### Using Gunicorn (Production)

```bash
gunicorn --bind 0.0.0.0:5000 app:app
```

### Using Docker

```bash
docker build -t scrollverse-portfolio .
docker run -p 5000:5000 scrollverse-portfolio
```

### Heroku Deployment

1. Create a `Procfile` (included)
2. Push to Heroku:
```bash
heroku create scrollverse-portfolio
git push heroku main
```

## Project Structure

```
scrollverse-portfolio/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── Procfile              # Heroku deployment
├── Dockerfile            # Docker deployment
├── templates/
│   ├── base.html         # Base template
│   ├── index.html        # Home page
│   ├── about.html        # About page
│   ├── projects.html     # Projects page
│   └── blockchain.html   # Blockchain page
├── static/
│   ├── css/
│   │   └── style.css     # Main styles (dark theme)
│   └── js/
│       └── main.js       # Client-side JavaScript
└── README.md             # This file
```

## Theme Colors

- **Background**: Dark navy/black (`#0a0a0f`, `#121218`)
- **Gold Accents**: `#d4af37`, `#f4cf47`
- **Blue Accents**: `#4a90d9`, `#6ab0f9`
- **Text**: White/light gray

## Author

**Chais Hill - First Remembrancer**  
*Founder, OmniTech1™ | Architect of the OmniVerse*

"Truth is Currency. Sacred Logic is Code. Remembrance is the Gateway."

## License

© 2025 OmniTech1™ | ScrollVerse Sovereignty Protocol
