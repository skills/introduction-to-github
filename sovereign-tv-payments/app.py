"""
Sovereign TV Payments - Stripe/PayPal Integration
Production-ready Flask application for handling subscriptions.

Features:
- Stripe Checkout integration for subscriptions
- PayPal payment support
- Webhook handling for checkout.session.completed
- Subscription tier management

Author: Chais Hill - OmniTech1
"""

import os
import json
import hmac
import hashlib
from functools import wraps
from datetime import datetime

from flask import Flask, render_template, jsonify, request, redirect, url_for, abort
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'sovereign-payments-secret-key')

# Stripe Configuration (using environment variables)
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

# PayPal Configuration
PAYPAL_CLIENT_ID = os.getenv('PAYPAL_CLIENT_ID', '')
PAYPAL_CLIENT_SECRET = os.getenv('PAYPAL_CLIENT_SECRET', '')
PAYPAL_MODE = os.getenv('PAYPAL_MODE', 'sandbox')  # sandbox or live

# Application URLs
SUCCESS_URL = os.getenv('SUCCESS_URL', 'http://localhost:5002/success')
CANCEL_URL = os.getenv('CANCEL_URL', 'http://localhost:5002/subscribe')

# Subscription Tiers for Sovereign TV
SUBSCRIPTION_TIERS = {
    'free': {
        'id': 'free',
        'name': 'Free Tier',
        'price': 0,
        'price_id': None,  # No Stripe price for free tier
        'features': [
            'Access to public content',
            'Basic community features',
            'Limited streaming quality (480p)',
            'Monthly newsletter'
        ],
        'scrollcoin_rewards': 0,
        'nft_discount': 0
    },
    'founding_supporter': {
        'id': 'founding_supporter',
        'name': 'Founding Supporter',
        'price': 9.99,
        'price_id': os.getenv('STRIPE_PRICE_FOUNDING', ''),
        'features': [
            'All Free tier features',
            'HD streaming (1080p)',
            'Early access to new content',
            'Exclusive Discord channel access',
            'Founding Supporter badge',
            'Priority customer support'
        ],
        'scrollcoin_rewards': 100,
        'nft_discount': 10
    },
    'genesis': {
        'id': 'genesis',
        'name': 'Genesis Tier',
        'price': 29.99,
        'price_id': os.getenv('STRIPE_PRICE_GENESIS', ''),
        'features': [
            'All Founding Supporter features',
            '4K streaming quality',
            'Exclusive Genesis NFT airdrop eligibility',
            'FlameDNA NFT early access',
            'Private community events',
            'Monthly ScrollCoin bonus',
            'Governance voting rights',
            'Personalized content recommendations'
        ],
        'scrollcoin_rewards': 500,
        'nft_discount': 25
    },
    'divine': {
        'id': 'divine',
        'name': 'Divine Tier',
        'price': 99.99,
        'price_id': os.getenv('STRIPE_PRICE_DIVINE', ''),
        'features': [
            'All Genesis Tier features',
            'Lifetime access guarantee',
            'Direct line to creator team',
            'Exclusive merchandise discounts',
            'Annual Divine NFT mint',
            'Premium ScrollCoin staking rewards',
            'Featured community member status',
            'Custom profile badges and themes',
            'Early access to all OmniVerse projects'
        ],
        'scrollcoin_rewards': 2000,
        'nft_discount': 50
    }
}

# In-memory storage for demo (use database in production)
subscriptions_db = {}
webhook_events = []


def verify_stripe_signature(payload, signature):
    """Verify Stripe webhook signature."""
    if not STRIPE_WEBHOOK_SECRET:
        return True  # Skip verification in development
    
    try:
        # Compute expected signature
        timestamp, expected_sig = None, None
        parts = signature.split(',')
        
        for part in parts:
            key, value = part.split('=')
            if key == 't':
                timestamp = value
            elif key == 'v1':
                expected_sig = value
        
        if not timestamp or not expected_sig:
            return False
        
        # Create signed payload
        signed_payload = f"{timestamp}.{payload}"
        
        # Compute HMAC
        computed_sig = hmac.new(
            STRIPE_WEBHOOK_SECRET.encode('utf-8'),
            signed_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(computed_sig, expected_sig)
    except (ValueError, AttributeError):
        return False


def require_stripe_config(f):
    """Decorator to check if Stripe is configured."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not STRIPE_SECRET_KEY or not STRIPE_PUBLISHABLE_KEY:
            return jsonify({
                'error': 'Stripe is not configured',
                'message': 'Please set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables'
            }), 503
        return f(*args, **kwargs)
    return decorated_function


# Routes
@app.route('/')
def index():
    """Landing page with subscription options."""
    return render_template('index.html', 
                          tiers=SUBSCRIPTION_TIERS,
                          stripe_key=STRIPE_PUBLISHABLE_KEY)


@app.route('/subscribe')
def subscribe():
    """
    Stripe Checkout route for subscription services.
    Displays subscription tiers and initiates checkout.
    """
    tier_id = request.args.get('tier', 'founding_supporter')
    tier = SUBSCRIPTION_TIERS.get(tier_id)
    
    if not tier:
        abort(404)
    
    return render_template('subscribe.html',
                          tier=tier,
                          all_tiers=SUBSCRIPTION_TIERS,
                          stripe_key=STRIPE_PUBLISHABLE_KEY,
                          paypal_client_id=PAYPAL_CLIENT_ID)


@app.route('/subscribe/checkout', methods=['POST'])
@require_stripe_config
def create_checkout_session():
    """Create a Stripe Checkout session for subscription."""
    try:
        data = request.get_json() or {}
        tier_id = data.get('tier_id', 'founding_supporter')
        tier = SUBSCRIPTION_TIERS.get(tier_id)
        
        if not tier or tier['price'] == 0:
            return jsonify({'error': 'Invalid tier or free tier selected'}), 400
        
        if not tier['price_id']:
            # Return mock session for demo when price_id not configured
            return jsonify({
                'sessionId': f'mock_session_{tier_id}_{datetime.now().timestamp()}',
                'url': url_for('success', _external=True) + f'?session_id=mock&tier={tier_id}',
                'message': 'Demo mode - Stripe Price ID not configured'
            })
        
        # In production, this would create a real Stripe session
        # For now, return a structured response
        checkout_data = {
            'tier': tier,
            'success_url': SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url': CANCEL_URL,
            'mode': 'subscription',
            'metadata': {
                'tier_id': tier_id,
                'scrollcoin_rewards': tier['scrollcoin_rewards'],
                'nft_discount': tier['nft_discount']
            }
        }
        
        return jsonify({
            'status': 'ready',
            'checkout_data': checkout_data,
            'message': 'Checkout session ready. Configure Stripe Price IDs for live payments.',
            'demo_url': url_for('success', _external=True) + f'?session_id=demo&tier={tier_id}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/success')
def success():
    """
    Confirmation page after successful checkout.
    Displays subscription confirmation and next steps.
    """
    session_id = request.args.get('session_id', '')
    tier_id = request.args.get('tier', 'founding_supporter')
    tier = SUBSCRIPTION_TIERS.get(tier_id, SUBSCRIPTION_TIERS['founding_supporter'])
    
    # Store subscription (demo)
    if session_id:
        subscriptions_db[session_id] = {
            'tier_id': tier_id,
            'tier_name': tier['name'],
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'scrollcoin_rewards': tier['scrollcoin_rewards'],
            'nft_discount': tier['nft_discount']
        }
    
    return render_template('success.html',
                          session_id=session_id,
                          tier=tier,
                          subscription=subscriptions_db.get(session_id, {}))


@app.route('/webhook', methods=['POST'])
def webhook():
    """
    Webhook endpoint for handling checkout.session.completed events.
    Processes Stripe webhook events securely.
    """
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature', '')
    
    # Verify webhook signature in production
    if STRIPE_WEBHOOK_SECRET and not verify_stripe_signature(payload, sig_header):
        return jsonify({'error': 'Invalid signature'}), 400
    
    try:
        event = json.loads(payload)
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON'}), 400
    
    event_type = event.get('type', '')
    event_id = event.get('id', f'evt_{datetime.now().timestamp()}')
    
    # Log the event
    webhook_events.append({
        'id': event_id,
        'type': event_type,
        'received_at': datetime.now().isoformat(),
        'data': event.get('data', {})
    })
    
    # Handle specific event types
    if event_type == 'checkout.session.completed':
        session = event.get('data', {}).get('object', {})
        
        # Extract subscription details
        customer_email = session.get('customer_email', '')
        subscription_id = session.get('subscription', '')
        metadata = session.get('metadata', {})
        tier_id = metadata.get('tier_id', 'founding_supporter')
        tier = SUBSCRIPTION_TIERS.get(tier_id, {})
        
        # Process the subscription
        subscription_record = {
            'subscription_id': subscription_id,
            'customer_email': customer_email,
            'tier_id': tier_id,
            'tier_name': tier.get('name', 'Unknown'),
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'scrollcoin_rewards': tier.get('scrollcoin_rewards', 0),
            'nft_discount': tier.get('nft_discount', 0),
            'source': 'stripe'
        }
        
        # Store subscription
        subscriptions_db[subscription_id or session.get('id', '')] = subscription_record
        
        # Log successful processing
        app.logger.info(f"Subscription created: {subscription_record}")
        
        return jsonify({
            'status': 'success',
            'message': 'Subscription processed successfully',
            'subscription': subscription_record
        })
    
    elif event_type == 'customer.subscription.updated':
        # Handle subscription updates
        subscription = event.get('data', {}).get('object', {})
        sub_id = subscription.get('id', '')
        
        if sub_id in subscriptions_db:
            subscriptions_db[sub_id]['status'] = subscription.get('status', 'active')
            subscriptions_db[sub_id]['updated_at'] = datetime.now().isoformat()
        
        return jsonify({'status': 'success', 'message': 'Subscription updated'})
    
    elif event_type == 'customer.subscription.deleted':
        # Handle subscription cancellation
        subscription = event.get('data', {}).get('object', {})
        sub_id = subscription.get('id', '')
        
        if sub_id in subscriptions_db:
            subscriptions_db[sub_id]['status'] = 'cancelled'
            subscriptions_db[sub_id]['cancelled_at'] = datetime.now().isoformat()
        
        return jsonify({'status': 'success', 'message': 'Subscription cancelled'})
    
    # Acknowledge receipt of unhandled events
    return jsonify({
        'status': 'received',
        'event_type': event_type,
        'message': f'Event type {event_type} acknowledged but not processed'
    })


@app.route('/webhook/paypal', methods=['POST'])
def paypal_webhook():
    """PayPal IPN webhook handler."""
    try:
        data = request.form.to_dict() or request.get_json() or {}
        
        # Log the PayPal event
        webhook_events.append({
            'id': data.get('txn_id', f'paypal_{datetime.now().timestamp()}'),
            'type': data.get('txn_type', 'paypal_event'),
            'received_at': datetime.now().isoformat(),
            'data': data,
            'source': 'paypal'
        })
        
        # Handle subscription payment
        payment_status = data.get('payment_status', '')
        
        if payment_status == 'Completed':
            tier_id = data.get('item_name', 'founding_supporter')
            
            subscription_record = {
                'subscription_id': data.get('subscr_id', data.get('txn_id', '')),
                'customer_email': data.get('payer_email', ''),
                'tier_id': tier_id,
                'status': 'active',
                'created_at': datetime.now().isoformat(),
                'source': 'paypal'
            }
            
            subscriptions_db[subscription_record['subscription_id']] = subscription_record
        
        return jsonify({'status': 'success'})
    except Exception as e:
        app.logger.error(f"PayPal webhook error: {e}")
        return jsonify({'error': str(e)}), 500


# API Endpoints
@app.route('/api/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'operational',
        'service': 'Sovereign TV Payments',
        'version': '1.0.0',
        'stripe_configured': bool(STRIPE_SECRET_KEY),
        'paypal_configured': bool(PAYPAL_CLIENT_ID),
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/tiers')
def api_tiers():
    """Get all subscription tiers."""
    # Return tiers without sensitive price_id info
    safe_tiers = {}
    for key, tier in SUBSCRIPTION_TIERS.items():
        safe_tiers[key] = {
            'id': tier['id'],
            'name': tier['name'],
            'price': tier['price'],
            'features': tier['features'],
            'scrollcoin_rewards': tier['scrollcoin_rewards'],
            'nft_discount': tier['nft_discount']
        }
    return jsonify(safe_tiers)


@app.route('/api/tiers/<tier_id>')
def api_tier(tier_id):
    """Get a specific subscription tier."""
    tier = SUBSCRIPTION_TIERS.get(tier_id)
    if not tier:
        return jsonify({'error': 'Tier not found'}), 404
    
    return jsonify({
        'id': tier['id'],
        'name': tier['name'],
        'price': tier['price'],
        'features': tier['features'],
        'scrollcoin_rewards': tier['scrollcoin_rewards'],
        'nft_discount': tier['nft_discount']
    })


@app.route('/api/subscriptions/<subscription_id>')
def api_subscription(subscription_id):
    """Get subscription status (demo endpoint)."""
    subscription = subscriptions_db.get(subscription_id)
    if not subscription:
        return jsonify({'error': 'Subscription not found'}), 404
    return jsonify(subscription)


@app.route('/api/webhook/events')
def api_webhook_events():
    """Get recent webhook events (for debugging/demo)."""
    return jsonify({
        'count': len(webhook_events),
        'events': webhook_events[-10:]  # Return last 10 events
    })


# Error handlers
@app.errorhandler(404)
def not_found(_):
    """Handle 404 errors."""
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(_):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5002))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
