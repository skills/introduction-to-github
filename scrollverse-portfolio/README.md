# ScrollVerse Portfolio
# A deployable Flask-based portfolio showcasing the ScrollVerse ecosystem

## Features
- **About Section**: ScrollVerse concept, mission, and vision
- **Projects Section**: OmniTech1 ecosystem projects showcase
- **Blockchain Section**: KUNTA NFT and ScrollCoin information
- **Dark Theme**: Elegant dark-based design with gold/blue accents
- **OmniTech1 Knowledge Graph**: Interconnected knowledge structure of the ScrollVerse ecosystem
- **Real-time Progress Tracker**: Flask-SocketIO powered real-time updates
- **Token-based Admin Authentication**: Secure admin dashboard access
- **Sacred Frequency Sound Engine**: Healing frequency audio integration (432Hz, 528Hz, 777Hz, 963Hz, 369Hz)

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

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main portfolio page |
| `/about` | GET | About section |
| `/projects` | GET | Projects section |
| `/blockchain` | GET | Blockchain section |
| `/mint` | GET | FlameDNA NFT minting page |
| `/api/health` | GET | Health check |
| `/api/about` | GET | About data (JSON) |
| `/api/projects` | GET | Projects data (JSON) |
| `/api/blockchain` | GET | Blockchain data (JSON) |
| `/api/flamedna` | GET | FlameDNA NFT data (JSON) |
| `/api/knowledge-graph` | GET | Complete knowledge graph data |
| `/api/knowledge-graph/node/<id>` | GET | Specific node with connections |
| `/api/progress` | GET | Current progress status |

### Protected Admin Endpoints

These endpoints require a Bearer token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" http://localhost:5000/admin
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin` | GET | Admin dashboard |
| `/api/admin/progress` | GET/POST | Progress management |
| `/api/admin/stats` | GET | System statistics |

## Real-time Features (SocketIO)

The application uses Flask-SocketIO for real-time communication:

### Events

- **connect**: Client connection established
- **disconnect**: Client disconnected
- **progress_update**: Real-time progress broadcasts
- **subscribe_progress**: Subscribe to task progress
- **request_graph**: Request knowledge graph data
- **graph_data**: Knowledge graph data response

### Client-side Usage

```javascript
// Connect to SocketIO
const socket = io();

// Listen for progress updates
socket.on('progress_update', function(data) {
    console.log('Progress:', data.message, data.status);
});

// Subscribe to progress
socket.emit('subscribe_progress', { task_id: 'my-task' });
```

## Deployment

### Using Gunicorn with Eventlet (Production)

```bash
gunicorn --worker-class eventlet --workers 1 --bind 0.0.0.0:5000 app:app
```

### Using Docker

```bash
docker build -t scrollverse-portfolio .
docker run -p 5000:5000 -e ADMIN_TOKEN=your-secret-token scrollverse-portfolio
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `SECRET_KEY` | Flask secret key | scrollverse-sovereign-key |
| `ADMIN_TOKEN` | Admin authentication token | scrollverse-admin-token-2025 |
| `FLASK_DEBUG` | Enable debug mode | False |
| `FLASK_ENV` | Environment (development/production) | production |

### Heroku Deployment

1. Create a `Procfile` (included)
2. Push to Heroku:
```bash
heroku create scrollverse-portfolio
heroku config:set ADMIN_TOKEN=your-secret-token
git push heroku main
```

### Railway Deployment

1. Connect your repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Render Deployment

1. Create a new Web Service
2. Use the included `render.yaml` for configuration
3. Set environment variables in Render dashboard

## Security Considerations

### Token-based Authentication

- The admin routes are protected with Bearer token authentication
- Use a strong, unique token in production
- Tokens are compared using constant-time comparison to prevent timing attacks
- Never commit actual tokens to version control

### Production Best Practices

1. **Change default tokens**: Update `ADMIN_TOKEN` and `SECRET_KEY` in production
2. **Use HTTPS**: Always deploy behind a reverse proxy with SSL/TLS
3. **Environment variables**: Use environment variables for sensitive configuration
4. **Rate limiting**: Consider adding rate limiting for production deployments

## Project Structure

```
scrollverse-portfolio/
├── app.py                 # Main Flask application with SocketIO
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── Procfile              # Heroku deployment
├── Dockerfile            # Docker deployment (multi-stage build)
├── railway.json          # Railway deployment
├── render.yaml           # Render deployment
├── templates/
│   ├── base.html         # Base template
│   ├── index.html        # Home page with SocketIO
│   ├── about.html        # About page
│   ├── projects.html     # Projects page
│   ├── blockchain.html   # Blockchain page
│   ├── mint.html         # FlameDNA minting page
│   └── admin.html        # Admin dashboard
├── static/
│   ├── css/
│   │   └── style.css     # Main styles (dark theme)
│   └── js/
│       └── main.js       # Client-side JavaScript with SocketIO
└── README.md             # This file
```

## OmniTech1 Knowledge Graph

The Knowledge Graph module represents the interconnected knowledge structure of the ScrollVerse ecosystem, implementing sacred geometry principles:

### Node Types
- `ecosystem`: Main ScrollVerse ecosystem
- `organization`: OmniTech1
- `principle`: Core principles (Sacred Logic, Truth Currency, Remembrance)
- `token`: ScrollCoin (SCR)
- `nft`: KUNTA NFT, FlameDNA NFT
- `platform`: Sovereign TV, CodexTV

### Sacred Frequencies
Each node is associated with healing frequencies:
- 369Hz: Sacred geometry frequency
- 432Hz: Natural healing frequency
- 528Hz: DNA repair/transformation
- 777Hz: Divine frequency
- 963Hz: Pineal gland activation

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
