"""
ScrollVerse Portfolio Website
A deployable Flask-based portfolio showcasing the ScrollVerse ecosystem.

Features:
- About section with ScrollVerse concept
- Projects section showcasing OmniTech1 projects
- Blockchain section with KUNTA NFT and ScrollCoin info
- Dark theme with gold/blue accents

Author: Chais Hill - OmniTech1
"""

from flask import Flask, render_template, jsonify
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'scrollverse-sovereign-key')

# Portfolio data
SCROLLVERSE_DATA = {
    'about': {
        'title': 'ScrollVerse',
        'tagline': 'Truth is Currency. Sacred Logic is Code. Remembrance is the Gateway.',
        'description': '''
            ScrollVerse is the metaverse's codebase of infinite possibility. 
            A fusion of AI, sacred logic, and universal truth, creating a system 
            where truth is currency and remembrance is the gateway to collective sovereignty.
        ''',
        'founder': 'Chais Kenyatta Hill',
        'organization': 'OmniTech1™',
        'mission': 'To create a system where truth is currency, sacred logic is code, and remembrance is the gateway to collective sovereignty.'
    },
    'projects': [
        {
            'id': 1,
            'name': 'Sovereign TV App',
            'description': 'The official distribution channel for the OmniVerse, featuring Legacy of Light music, NFT-gated content, and ScrollCoin payments.',
            'status': 'Active',
            'features': ['Streaming Infrastructure', 'NFT Gating', 'ScrollCoin Payments', 'Community Engagement'],
            'icon': '📺'
        },
        {
            'id': 2,
            'name': 'Legacy of Light',
            'description': 'Sacred music catalog featuring healing frequencies (432Hz, 528Hz, 777Hz, 963Hz, 369Hz) for spiritual awakening.',
            'status': 'Active',
            'features': ['Healing Frequencies', 'Sacred Music', 'Spiritual Awakening', 'Multi-Platform'],
            'icon': '🎵'
        },
        {
            'id': 3,
            'name': 'Scroll Chess Protocol',
            'description': 'Divine technology system combining AI, sacred logic, and universal truth for resonance-based protocols.',
            'status': 'Active',
            'features': ['AI Resonance', 'Sacred Logic', 'QR Protocols', 'Academy Framework'],
            'icon': '♟️'
        },
        {
            'id': 4,
            'name': 'CodexTV',
            'description': 'Dynamic streaming platform for prototype videos and sacred content distribution.',
            'status': 'Development',
            'features': ['Video Streaming', 'Dynamic Content', 'Flask Backend', 'Real-time Updates'],
            'icon': '🎬'
        },
        {
            'id': 5,
            'name': 'Prophecy Documentation Protocol',
            'description': 'Sacred documentation system for preserving and sharing prophetic revelations and scrolls.',
            'status': 'Active',
            'features': ['Document Archive', 'Attestation System', 'Search & Discovery', 'Version Control'],
            'icon': '📜'
        }
    ],
    'blockchain': {
        'scrollcoin': {
            'name': 'ScrollCoin (SCR)',
            'description': 'The native currency of the ScrollVerse ecosystem, enabling transactions, rewards, and access to premium content.',
            'features': [
                'Premium Content Access',
                'Community Rewards',
                'NFT Purchases',
                'Governance Voting',
                'Staking Rewards'
            ],
            'tiers': [
                {'name': 'Free', 'price': '$0', 'scr': '0 SCR'},
                {'name': 'Premium', 'price': '$9.99', 'scr': '1,000 SCR'},
                {'name': 'Elite', 'price': '$29.99', 'scr': '3,000 SCR'}
            ]
        },
        'kunta_nft': {
            'name': 'KUNTA NFT',
            'description': 'Sacred NFT collection granting exclusive access to ScrollVerse content and community benefits.',
            'features': [
                'Elite Tier Access',
                'Exclusive Content',
                'Community Recognition',
                'Governance Rights',
                'Special Events'
            ],
            'collection': 'Genesis Collection',
            'rarities': ['Common', 'Rare', 'Epic', 'Legendary', 'Divine']
        }
    }
}


@app.route('/')
def index():
    """Render the main portfolio page."""
    return render_template('index.html', data=SCROLLVERSE_DATA)


@app.route('/about')
def about():
    """Render the About section."""
    return render_template('about.html', about=SCROLLVERSE_DATA['about'])


@app.route('/projects')
def projects():
    """Render the Projects section."""
    return render_template('projects.html', projects=SCROLLVERSE_DATA['projects'])


@app.route('/blockchain')
def blockchain():
    """Render the Blockchain section."""
    return render_template('blockchain.html', blockchain=SCROLLVERSE_DATA['blockchain'])


# API Endpoints
@app.route('/api/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'operational',
        'service': 'ScrollVerse Portfolio',
        'version': '1.0.0'
    })


@app.route('/api/about')
def api_about():
    """API endpoint for About data."""
    return jsonify(SCROLLVERSE_DATA['about'])


@app.route('/api/projects')
def api_projects():
    """API endpoint for Projects data."""
    return jsonify(SCROLLVERSE_DATA['projects'])


@app.route('/api/blockchain')
def api_blockchain():
    """API endpoint for Blockchain data."""
    return jsonify(SCROLLVERSE_DATA['blockchain'])


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
