"""
ScrollVerse Portfolio Website
A deployable Flask-based portfolio showcasing the ScrollVerse ecosystem.

Features:
- About section with ScrollVerse concept
- Projects section showcasing OmniTech1 projects
- Blockchain section with KUNTA NFT and ScrollCoin info
- Dark theme with gold/blue accents
- OmniTech1 Knowledge Graph module integration
- Real-time progress tracker via Flask-SocketIO
- Token-based admin authentication

Author: Chais Hill - OmniTech1
"""

from functools import wraps
from flask import Flask, render_template, jsonify, request, abort
import os
import hmac
from datetime import datetime
from dotenv import load_dotenv
from flask_socketio import SocketIO, emit

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'scrollverse-sovereign-key')

# Initialize Flask-SocketIO for real-time communication
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Admin authentication token (should be set via environment variable in production)
ADMIN_TOKEN = os.getenv('ADMIN_TOKEN', 'scrollverse-admin-token-2025')


# ==================== OmniTech1 Knowledge Graph Module ====================
class OmniTech1KnowledgeGraph:
    """
    OmniTech1 Knowledge Graph Module
    Represents the interconnected knowledge structure of the ScrollVerse ecosystem.
    Implements sacred geometry principles in data organization.
    """

    def __init__(self):
        self.nodes = {}
        self.edges = []
        self.sacred_frequencies = [369, 432, 528, 777, 963]
        self._initialize_graph()

    def _initialize_graph(self):
        """Initialize the knowledge graph with core ScrollVerse concepts."""
        # Core concept nodes
        core_concepts = [
            {'id': 'scrollverse', 'type': 'ecosystem', 'name': 'ScrollVerse', 'frequency': 777},
            {'id': 'omnitech1', 'type': 'organization', 'name': 'OmniTech1', 'frequency': 963},
            {'id': 'sacred_logic', 'type': 'principle', 'name': 'Sacred Logic', 'frequency': 528},
            {'id': 'truth_currency', 'type': 'principle', 'name': 'Truth Currency', 'frequency': 432},
            {'id': 'remembrance', 'type': 'principle', 'name': 'Remembrance Gateway', 'frequency': 369},
            {'id': 'scrollcoin', 'type': 'token', 'name': 'ScrollCoin (SCR)', 'frequency': 528},
            {'id': 'kunta_nft', 'type': 'nft', 'name': 'KUNTA NFT', 'frequency': 777},
            {'id': 'flamedna_nft', 'type': 'nft', 'name': 'FlameDNA NFT', 'frequency': 963},
            {'id': 'sovereign_tv', 'type': 'platform', 'name': 'Sovereign TV', 'frequency': 432},
            {'id': 'codex_tv', 'type': 'platform', 'name': 'CodexTV', 'frequency': 369},
        ]

        for concept in core_concepts:
            self.nodes[concept['id']] = concept

        # Define relationships (edges)
        self.edges = [
            {'source': 'scrollverse', 'target': 'omnitech1', 'relationship': 'created_by'},
            {'source': 'scrollverse', 'target': 'sacred_logic', 'relationship': 'founded_on'},
            {'source': 'scrollverse', 'target': 'truth_currency', 'relationship': 'values'},
            {'source': 'scrollverse', 'target': 'remembrance', 'relationship': 'enables'},
            {'source': 'scrollverse', 'target': 'scrollcoin', 'relationship': 'powers'},
            {'source': 'scrollverse', 'target': 'kunta_nft', 'relationship': 'includes'},
            {'source': 'scrollverse', 'target': 'flamedna_nft', 'relationship': 'includes'},
            {'source': 'scrollverse', 'target': 'sovereign_tv', 'relationship': 'distributes_via'},
            {'source': 'scrollverse', 'target': 'codex_tv', 'relationship': 'streams_via'},
            {'source': 'omnitech1', 'target': 'sacred_logic', 'relationship': 'implements'},
        ]

    def get_node(self, node_id):
        """Get a specific node by ID."""
        return self.nodes.get(node_id)

    def get_all_nodes(self):
        """Get all nodes in the knowledge graph."""
        return list(self.nodes.values())

    def get_edges(self):
        """Get all edges (relationships) in the graph."""
        return self.edges

    def get_connected_nodes(self, node_id):
        """Get all nodes connected to a specific node."""
        connected = []
        for edge in self.edges:
            if edge['source'] == node_id:
                target = self.nodes.get(edge['target'])
                if target:
                    connected.append({'node': target, 'relationship': edge['relationship']})
            elif edge['target'] == node_id:
                source = self.nodes.get(edge['source'])
                if source:
                    connected.append({'node': source, 'relationship': edge['relationship']})
        return connected

    def get_graph_data(self):
        """Get the complete graph data for visualization."""
        return {
            'nodes': self.get_all_nodes(),
            'edges': self.edges,
            'sacred_frequencies': self.sacred_frequencies
        }


# Initialize the Knowledge Graph
knowledge_graph = OmniTech1KnowledgeGraph()


# ==================== Real-time Progress Tracker ====================
class ProgressTracker:
    """
    Real-time progress tracking for ScrollVerse operations.
    Broadcasts updates via SocketIO.
    """

    def __init__(self):
        self.current_progress = {}
        self.history = []

    def update_progress(self, task_id, progress, message, status='in_progress'):
        """Update progress for a specific task."""
        update = {
            'task_id': task_id,
            'progress': progress,
            'message': message,
            'status': status,
            'timestamp': datetime.now().isoformat()
        }
        self.current_progress[task_id] = update
        self.history.append(update)

        # Broadcast to all connected clients
        socketio.emit('progress_update', update)
        return update

    def get_progress(self, task_id=None):
        """Get current progress for a task or all tasks."""
        if task_id:
            return self.current_progress.get(task_id)
        return self.current_progress

    def get_history(self, limit=50):
        """Get progress history."""
        return self.history[-limit:]


# Initialize the Progress Tracker
progress_tracker = ProgressTracker()


# ==================== Token-based Admin Authentication ====================
def require_admin_token(f):
    """
    Decorator for token-based admin authentication.
    Secures admin routes with bearer token validation.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        # Check for Bearer token
        if not auth_header.startswith('Bearer '):
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Missing or invalid authorization header'
            }), 401

        token = auth_header[7:]  # Remove 'Bearer ' prefix

        # Constant-time comparison to prevent timing attacks
        if not hmac.compare_digest(token, ADMIN_TOKEN):
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Invalid admin token'
            }), 401

        return f(*args, **kwargs)
    return decorated_function

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


# ==================== Admin Routes (Token Protected) ====================
@app.route('/admin')
@require_admin_token
def admin():
    """
    Admin dashboard page.
    Requires valid admin token for access.
    """
    return render_template('admin.html',
                           data=SCROLLVERSE_DATA,
                           knowledge_graph=knowledge_graph.get_graph_data(),
                           progress=progress_tracker.get_progress())


@app.route('/api/admin/progress', methods=['GET', 'POST'])
@require_admin_token
def api_admin_progress():
    """API endpoint for managing progress tracking."""
    if request.method == 'POST':
        data = request.get_json() or {}
        task_id = data.get('task_id', 'default')
        progress = data.get('progress', 0)
        message = data.get('message', '')
        status = data.get('status', 'in_progress')

        update = progress_tracker.update_progress(task_id, progress, message, status)
        return jsonify({'success': True, 'update': update})

    return jsonify({
        'current': progress_tracker.get_progress(),
        'history': progress_tracker.get_history()
    })


@app.route('/api/admin/stats')
@require_admin_token
def api_admin_stats():
    """API endpoint for admin statistics."""
    return jsonify({
        'service': 'ScrollVerse Portfolio',
        'version': '2.0.0',
        'features': {
            'knowledge_graph': True,
            'real_time_progress': True,
            'socketio_enabled': True
        },
        'knowledge_graph': {
            'nodes_count': len(knowledge_graph.get_all_nodes()),
            'edges_count': len(knowledge_graph.get_edges())
        },
        'progress_tracker': {
            'active_tasks': len(progress_tracker.get_progress()),
            'history_count': len(progress_tracker.history)
        },
        'timestamp': datetime.now().isoformat()
    })


# ==================== Knowledge Graph API Endpoints ====================
@app.route('/api/knowledge-graph')
def api_knowledge_graph():
    """API endpoint for the complete knowledge graph."""
    return jsonify(knowledge_graph.get_graph_data())


@app.route('/api/knowledge-graph/node/<node_id>')
def api_knowledge_graph_node(node_id):
    """API endpoint for a specific knowledge graph node."""
    node = knowledge_graph.get_node(node_id)
    if not node:
        return jsonify({'error': 'Node not found'}), 404
    return jsonify({
        'node': node,
        'connections': knowledge_graph.get_connected_nodes(node_id)
    })


# ==================== Progress Tracking API ====================
@app.route('/api/progress')
def api_progress():
    """Public API endpoint for progress status (read-only)."""
    return jsonify({
        'tasks': progress_tracker.get_progress(),
        'timestamp': datetime.now().isoformat()
    })


# ==================== SocketIO Event Handlers ====================
@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    emit('connected', {
        'message': 'Connected to ScrollVerse real-time server',
        'timestamp': datetime.now().isoformat()
    })


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    pass  # Connection closed


@socketio.on('subscribe_progress')
def handle_subscribe_progress(data):
    """Handle progress subscription requests."""
    task_id = data.get('task_id') if data else None
    progress = progress_tracker.get_progress(task_id)
    emit('progress_status', {
        'progress': progress,
        'timestamp': datetime.now().isoformat()
    })


@socketio.on('request_graph')
def handle_request_graph():
    """Handle knowledge graph data requests via SocketIO."""
    emit('graph_data', knowledge_graph.get_graph_data())


# ==================== Error Handlers ====================
@app.errorhandler(404)
def not_found(_):
    """Handle 404 errors."""
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(_):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    # Use SocketIO run method for development
    socketio.run(app, host='0.0.0.0', port=port, debug=debug)
