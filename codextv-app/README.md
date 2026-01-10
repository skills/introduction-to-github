## Sovereignty Seal
**Sovereign Chais owns every yield**

---


# CodexTV App
# Dynamic Video Streaming Platform with Flask Pass View

## Features
- **Dynamic Streaming**: Flask-based video streaming with Pass View technology
- **Prototype Videos**: Catalog of ScrollVerse content
- **Multiple Categories**: Documentary, Educational, Live, Exclusive
- **Healing Frequencies**: Content tagged with sacred frequencies
- **Dark Theme**: Elegant design matching ScrollVerse branding

## Quick Start

### Prerequisites
- Python 3.9+
- pip

### Installation

```bash
# Navigate to the CodexTV directory
cd codextv-app

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
Open your browser and navigate to: `http://localhost:5001`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main video catalog |
| `/watch/<video_id>` | GET | Video player page |
| `/category/<category>` | GET | Browse by category |
| `/live` | GET | Live streams |
| `/stream/<video_id>` | GET | Stream video (Flask Pass View) |
| `/api/health` | GET | Health check |
| `/api/videos` | GET | All videos (JSON) |
| `/api/videos/<id>` | GET | Specific video (JSON) |
| `/api/categories` | GET | All categories (JSON) |
| `/api/stream/init/<id>` | GET | Initialize stream session |
| `/api/stream/quality/<id>` | POST | Update stream quality |

## Flask Pass View

CodexTV implements dynamic streaming through Flask views:

```python
@app.route('/stream/<video_id>')
@pass_view
def stream_video(video_id):
    # Dynamic streaming based on view context
    video = get_video_by_id(video_id)
    stream_data = generate_stream_data(video_id)
    return jsonify({
        'status': 'streaming',
        'video': video,
        'stream_info': stream_data
    })
```

## Deployment

### Using Gunicorn (Production)

```bash
gunicorn --bind 0.0.0.0:5001 app:app
```

### Using Docker

```bash
docker build -t codextv-app .
docker run -p 5001:5001 codextv-app
```

### Heroku Deployment

1. Create a `Procfile` (included)
2. Push to Heroku:
```bash
heroku create codextv-app
git push heroku main
```

## Project Structure

```
codextv-app/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── Procfile              # Heroku deployment
├── Dockerfile            # Docker deployment
├── templates/
│   ├── base.html         # Base template
│   ├── index.html        # Home/catalog page
│   ├── watch.html        # Video player page
│   ├── category.html     # Category listing
│   ├── live.html         # Live streams page
│   └── 404.html          # Error page
├── static/
│   ├── css/
│   │   └── style.css     # Main styles
│   └── js/
│       └── main.js       # Client-side JavaScript
└── README.md             # This file
```

## Video Catalog

### Categories
- **Documentary**: ScrollVerse history and revelations
- **Educational**: Learning content about the ecosystem
- **Live**: Real-time broadcasts
- **Exclusive**: NFT-gated premium content

### Healing Frequencies
- 369Hz - KUNTA Anthem
- 432Hz - Divine Awakening
- 528Hz - Resonance of Truth
- 777Hz - ScrollVerse Symphony
- 963Hz - Flame of Remembrance

## Author

**Chais Hill - First Remembrancer**  
*Founder, OmniTech1™ | Architect of the OmniVerse*

"Dynamic Streaming for the ScrollVerse"

## License

© 2025 OmniTech1™ | ScrollVerse Sovereignty Protocol
