"""Configuration for Campus Info Hub backend."""
import os

# Flask settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'campus-info-hub-secret-2026')
DATABASE_PATH = os.environ.get('DATABASE_PATH', os.path.join(os.path.dirname(__file__), 'campus.db'))
TOKEN_EXPIRY_HOURS = int(os.environ.get('TOKEN_EXPIRY_HOURS', '24'))

# CORS origins (comma-separated)
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')

# Supabase (for production database)
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

# Flask app config
DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 'yes')
HOST = os.environ.get('HOST', '0.0.0.0')
PORT = int(os.environ.get('PORT', '5000'))
