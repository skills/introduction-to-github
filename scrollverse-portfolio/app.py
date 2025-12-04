"""
ScrollVerse Portfolio Website
A deployable Flask-based portfolio showcasing the ScrollVerse ecosystem.

Features:
- About section with ScrollVerse concept
- Projects section showcasing OmniTech1 projects
- Blockchain section with KUNTA NFT and ScrollCoin info
- Dark theme with gold/blue accents
- Token-based admin authentication
- GitHub webhook validation with HMAC signatures
- Real-time updates via Flask-SocketIO
- OmniTech Knowledge Graph integration

Author: Chais Hill - OmniTech1
"""

import os
import hmac
import hashlib
import logging
from datetime import datetime

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

from auth import require_admin_token, get_admin_token_status

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', os.getenv('SECRET_KEY', 'scrollverse-sovereign-key'))

# Initialize Flask-SocketIO for real-time updates
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# GitHub Webhook Secret for HMAC validation
GITHUB_WEBHOOK_SECRET = os.getenv('GITHUB_WEBHOOK_SECRET', '')

if not GITHUB_WEBHOOK_SECRET:
    logger.warning(
        "GITHUB_WEBHOOK_SECRET environment variable is not set. "
        "GitHub webhooks will reject all requests. "
        "Set GITHUB_WEBHOOK_SECRET to enable webhook validation."
    )

# Network Harmony Tracker state
network_harmony_state = {
    'nodes': [],
    'harmony_level': 100,
    'last_update': None,
    'broadcast_count': 0
}

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
        },
        'flamedna_nft': {
            'name': 'FlameDNA NFT',
            'description': 'Sacred NFT collection granting access to ScrollVerse ecosystem with rarity-based benefits.',
            'contract': {
                'name': 'FlameDNA',
                'symbol': 'FDNA',
                'maxSupply': 10000,
                'mintPrice': '0.05 ETH'
            },
            'features': [
                'ERC-721 Standard',
                'Rarity Distribution System',
                'ScrollVerse Integration',
                'Governance Rights',
                'Exclusive Content Access'
            ],
            'rarities': {
                'Common': {'probability': '50%', 'benefits': 'Basic access'},
                'Rare': {'probability': '30%', 'benefits': 'Premium streaming'},
                'Epic': {'probability': '13%', 'benefits': 'Early access + Premium'},
                'Legendary': {'probability': '6%', 'benefits': 'All Premium + Governance'},
                'Divine': {'probability': '1%', 'benefits': 'All benefits + Exclusive'}
            }
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


@app.route('/mint')
def mint():
    """Render the FlameDNA NFT minting page."""
    return render_template('mint.html', flamedna=SCROLLVERSE_DATA['blockchain']['flamedna_nft'])


@app.route('/api/flamedna')
def api_flamedna():
    """API endpoint for FlameDNA NFT data."""
    return jsonify(SCROLLVERSE_DATA['blockchain']['flamedna_nft'])


# ============================================================================
# GitHub Webhook Validation
# ============================================================================

def verify_github_signature(payload: bytes, signature: str) -> bool:
    """
    Verify GitHub webhook signature using HMAC-SHA256.
    
    Args:
        payload: Raw request payload bytes
        signature: X-Hub-Signature-256 header value
        
    Returns:
        bool: True if signature is valid, False otherwise
    """
    if not GITHUB_WEBHOOK_SECRET:
        return False
    
    if not signature or not signature.startswith('sha256='):
        return False
    
    expected_signature = signature[7:]  # Remove 'sha256=' prefix
    
    computed_signature = hmac.new(
        GITHUB_WEBHOOK_SECRET.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(computed_signature, expected_signature)


@app.route('/webhook/github', methods=['POST'])
def github_webhook():
    """
    GitHub webhook endpoint with HMAC-SHA256 signature validation.
    
    Validates X-Hub-Signature-256 header to ensure request authenticity.
    """
    payload = request.get_data()
    signature = request.headers.get('X-Hub-Signature-256', '')
    
    if not verify_github_signature(payload, signature):
        logger.warning("Invalid GitHub webhook signature received")
        return jsonify({
            'error': 'Forbidden',
            'message': 'Invalid webhook signature'
        }), 403
    
    try:
        event_type = request.headers.get('X-GitHub-Event', 'ping')
        data = request.get_json() or {}
        
        logger.info(f"Received GitHub webhook event: {event_type}")
        
        # Handle ping event (webhook setup verification)
        if event_type == 'ping':
            return jsonify({
                'status': 'success',
                'message': 'Webhook configured successfully',
                'zen': data.get('zen', '')
            })
        
        # Handle push events
        if event_type == 'push':
            branch = data.get('ref', '').replace('refs/heads/', '')
            commits = len(data.get('commits', []))
            
            # Emit real-time update via SocketIO
            socketio.emit('github_push', {
                'branch': branch,
                'commits': commits,
                'timestamp': datetime.now().isoformat()
            })
            
            return jsonify({
                'status': 'success',
                'event': 'push',
                'branch': branch,
                'commits_received': commits
            })
        
        # Handle other events
        return jsonify({
            'status': 'received',
            'event': event_type,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"GitHub webhook processing error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# Admin Protected Routes
# ============================================================================

@app.route('/admin')
@require_admin_token
def admin_dashboard():
    """
    Admin dashboard endpoint.
    Requires valid admin token for access.
    """
    return jsonify({
        'status': 'success',
        'message': 'Admin access granted',
        'dashboard': {
            'network_harmony': network_harmony_state,
            'admin_token_status': get_admin_token_status(),
            'github_webhook_configured': bool(GITHUB_WEBHOOK_SECRET),
            'timestamp': datetime.now().isoformat()
        }
    })


@app.route('/api/omnitech/broadcast', methods=['POST'])
@require_admin_token
def omnitech_broadcast():
    """
    OmniTech broadcast endpoint for real-time updates.
    Requires admin token authentication.
    
    Broadcasts messages to all connected SocketIO clients.
    """
    try:
        data = request.get_json() or {}
        message = data.get('message', '')
        channel = data.get('channel', 'general')
        
        if not message:
            return jsonify({
                'error': 'Bad Request',
                'message': 'Message content is required'
            }), 400
        
        # Update broadcast count
        network_harmony_state['broadcast_count'] += 1
        network_harmony_state['last_update'] = datetime.now().isoformat()
        
        # Emit broadcast to all connected clients
        socketio.emit('omnitech_broadcast', {
            'channel': channel,
            'message': message,
            'broadcast_id': network_harmony_state['broadcast_count'],
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"OmniTech broadcast sent on channel: {channel}")
        
        return jsonify({
            'status': 'success',
            'broadcast_id': network_harmony_state['broadcast_count'],
            'channel': channel,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Broadcast error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# OmniTech Knowledge Graph API
# ============================================================================

@app.route('/api/omnitech/knowledge-graph')
def knowledge_graph():
    """
    OmniTech Knowledge Graph endpoint.
    Returns the current state of the knowledge graph.
    """
    return jsonify({
        'status': 'operational',
        'graph': {
            'nodes': len(SCROLLVERSE_DATA['projects']),
            'connections': len(SCROLLVERSE_DATA['projects']) * 2,
            'categories': ['streaming', 'blockchain', 'nft', 'music', 'documentation']
        },
        'projects': SCROLLVERSE_DATA['projects'],
        'blockchain': list(SCROLLVERSE_DATA['blockchain'].keys()),
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/omnitech/network-harmony')
def network_harmony():
    """
    Network Harmony Tracker endpoint.
    Returns real-time network harmony metrics.
    """
    return jsonify({
        'status': 'operational',
        'harmony': network_harmony_state,
        'metrics': {
            'uptime': 'active',
            'connections': len(network_harmony_state['nodes']),
            'harmony_level': network_harmony_state['harmony_level']
        },
        'timestamp': datetime.now().isoformat()
    })


# ============================================================================
# SocketIO Event Handlers
# ============================================================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {
        'status': 'connected',
        'sid': request.sid,
        'timestamp': datetime.now().isoformat()
    })


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    logger.info(f"Client disconnected: {request.sid}")


@socketio.on('subscribe_harmony')
def handle_subscribe_harmony(data):
    """Subscribe to network harmony updates."""
    node_id = data.get('node_id', request.sid)
    if node_id not in network_harmony_state['nodes']:
        network_harmony_state['nodes'].append(node_id)
    
    emit('harmony_update', {
        'subscribed': True,
        'harmony_level': network_harmony_state['harmony_level'],
        'node_count': len(network_harmony_state['nodes']),
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    socketio.run(app, host='0.0.0.0', port=port, debug=debug)
