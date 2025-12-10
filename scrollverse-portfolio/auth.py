"""
Auth Module - Token-Based Admin Authentication
Handles admin token validation for protected endpoints.

Features:
- Token-based admin authentication
- Environment variable token configuration
- Warning logging if token is unset
- Decorator for protected routes

Author: Chais Hill - OmniTech1
"""

import os
import logging
from functools import wraps
from flask import request, jsonify

# Configure logging
logger = logging.getLogger(__name__)

# Admin token from environment
ADMIN_TOKEN = os.getenv('ADMIN_TOKEN', '')

# Log warning if admin token is not set
if not ADMIN_TOKEN:
    logger.warning(
        "ADMIN_TOKEN environment variable is not set. "
        "Admin endpoints will reject all requests. "
        "Set ADMIN_TOKEN to enable admin access."
    )


def validate_admin_token(token: str) -> bool:
    """
    Validate the provided admin token.
    
    Args:
        token: The token to validate
        
    Returns:
        bool: True if token is valid, False otherwise
    """
    if not ADMIN_TOKEN:
        return False
    return token == ADMIN_TOKEN


def require_admin_token(f):
    """
    Decorator to require admin token for protected endpoints.
    
    Expects token in Authorization header as 'Bearer <token>'
    or in 'X-Admin-Token' header.
    
    Returns 401 Unauthorized if token is missing or invalid.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check Authorization header (Bearer token)
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
        
        # Fallback to X-Admin-Token header
        if not token:
            token = request.headers.get('X-Admin-Token', '')
        
        # Validate token
        if not token:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Admin token is required'
            }), 401
        
        if not validate_admin_token(token):
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Invalid admin token'
            }), 401
        
        return f(*args, **kwargs)
    return decorated_function


def get_admin_token_status() -> dict:
    """
    Get the current status of admin token configuration.
    
    Returns:
        dict: Status information about admin token
    """
    return {
        'configured': bool(ADMIN_TOKEN),
        'token_length': len(ADMIN_TOKEN) if ADMIN_TOKEN else 0
    }
