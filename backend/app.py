"""
Campus Info Hub - Backend API
Flask application providing RESTful API for campus information platform.
Features: user auth, lost & found, second-hand market, info board.
"""
import os
import sqlite3
import hashlib
import jwt
import datetime
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS

# --- Configuration ---
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'campus-info-hub-secret-2026')
app.config['DATABASE'] = os.environ.get('DATABASE_PATH', os.path.join(os.path.expanduser('~'), 'campus_info_hub.db'))
app.config['TOKEN_EXPIRY_HOURS'] = 24



# --- Database Helpers ---
def get_db_path():
    """Get current database path from config (allows runtime override for tests)."""
    return app.config['DATABASE']


def get_db():
    """Get database connection with row factory."""
    if 'db' not in g:
        g.db = sqlite3.connect(get_db_path())
        g.db.row_factory = sqlite3.Row
        g.db.execute('PRAGMA foreign_keys = ON')
        g.db.execute('PRAGMA journal_mode = MEMORY')
    return g.db


@app.teardown_appcontext
def close_db(error):
    """Close database connection at end of request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    """Initialize database with schema."""
    conn = sqlite3.connect(get_db_path())
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            contact TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        );

        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category IN ('lost_found', 'market', 'info')),
            contact TEXT DEFAULT '',
            price REAL DEFAULT 0,
            status TEXT DEFAULT 'active' CHECK(status IN ('active', 'resolved', 'closed')),
            image_url TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
        CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
        CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
    """)
    conn.commit()
    conn.close()


# --- Auth Helpers ---
def hash_password(password):
    """Hash password with salt."""
    return hashlib.sha256(password.encode('utf-8') + app.config['SECRET_KEY'].encode('utf-8')).hexdigest()


def generate_token(user_id, username):
    """Generate JWT token."""
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=app.config['TOKEN_EXPIRY_HOURS'])
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def verify_token(token):
    """Verify JWT token and return payload."""
    try:
        return jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def login_required(f):
    """Decorator for routes that require authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid token'}), 401
        token = auth_header.split(' ', 1)[1]
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token expired or invalid'}), 401
        g.current_user = payload
        return f(*args, **kwargs)
    return decorated


# --- Error Handlers ---
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request', 'message': str(error)}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error', 'message': str(error)}), 500


# --- API Routes ---

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'campus-info-hub', 'version': '1.0.0'})


# === Auth API ===

@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    User registration.
    Request: { "username": "...", "password": "...", "contact": "..." }
    Response: { "message": "...", "token": "...", "user": {...} }
    """
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    username = data['username'].strip()
    password = data['password']
    contact = data.get('contact', '')

    if len(username) < 2:
        return jsonify({'error': 'Username must be at least 2 characters'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    db = get_db()
    existing = db.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone()
    if existing:
        return jsonify({'error': 'Username already exists'}), 409

    cursor = db.execute(
        'INSERT INTO users (username, password_hash, contact) VALUES (?, ?, ?)',
        (username, hash_password(password), contact)
    )
    db.commit()
    user_id = cursor.lastrowid
    token = generate_token(user_id, username)

    app.logger.info(f'User registered: {username} (id={user_id})')
    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'user': {'id': user_id, 'username': username, 'contact': contact}
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    User login.
    Request: { "username": "...", "password": "..." }
    Response: { "message": "...", "token": "...", "user": {...} }
    """
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    username = data['username'].strip()
    password = data['password']

    db = get_db()
    user = db.execute(
        'SELECT id, username, password_hash, contact FROM users WHERE username = ?',
        (username,)
    ).fetchone()

    if not user or user['password_hash'] != hash_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    token = generate_token(user['id'], user['username'])
    app.logger.info(f'User logged in: {username} (id={user["id"]})')
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {'id': user['id'], 'username': user['username'], 'contact': user['contact']}
    })


@app.route('/api/auth/profile', methods=['GET'])
@login_required
def get_profile():
    """Get current user profile."""
    db = get_db()
    user = db.execute(
        'SELECT id, username, contact, created_at FROM users WHERE id = ?',
        (g.current_user['user_id'],)
    ).fetchone()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': dict(user)})


# === Posts API ===

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """
    Get posts list with optional filtering.
    Query params: category (lost_found/market/info), status (active/resolved/closed), page, page_size, keyword
    Response: { "posts": [...], "total": N, "page": 1, "page_size": 10 }
    """
    category = request.args.get('category', '')
    status = request.args.get('status', 'active')
    keyword = request.args.get('keyword', '')
    page = max(int(request.args.get('page', 1)), 1)
    page_size = min(int(request.args.get('page_size', 10)), 50)
    offset = (page - 1) * page_size

    query = '''
        SELECT p.*, u.username AS author_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 1=1
    '''
    params = []

    if category:
        query += ' AND p.category = ?'
        params.append(category)
    if status:
        query += ' AND p.status = ?'
        params.append(status)
    if keyword:
        query += ' AND (p.title LIKE ? OR p.content LIKE ?)'
        params.extend([f'%{keyword}%', f'%{keyword}%'])

    # Count total
    count_query = query.replace('SELECT p.*, u.username AS author_name', 'SELECT COUNT(*)')
    db = get_db()
    total = db.execute(count_query, params).fetchone()[0]

    # Get paginated results
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    params.extend([page_size, offset])
    posts = db.execute(query, params).fetchall()

    return jsonify({
        'posts': [dict(p) for p in posts],
        'total': total,
        'page': page,
        'page_size': page_size
    })


@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """
    Get single post by ID.
    Response: { "post": {...} }
    """
    db = get_db()
    post = db.execute('''
        SELECT p.*, u.username AS author_name, u.contact AS author_contact
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ''', (post_id,)).fetchone()

    if not post:
        return jsonify({'error': 'Post not found'}), 404

    return jsonify({'post': dict(post)})


@app.route('/api/posts', methods=['POST'])
@login_required
def create_post():
    """
    Create a new post. Requires authentication.
    Request: { "title": "...", "content": "...", "category": "lost_found|market|info", "contact": "...", "price": 0, "image_url": "..." }
    Response: { "message": "...", "post": {...} }
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    category = data.get('category', '').strip()
    contact = data.get('contact', '')
    price = float(data.get('price', 0))
    image_url = data.get('image_url', '')

    if not title or not content or not category:
        return jsonify({'error': 'Title, content, and category are required'}), 400

    if category not in ('lost_found', 'market', 'info'):
        return jsonify({'error': 'Invalid category. Must be: lost_found, market, or info'}), 400

    if category == 'market' and price < 0:
        return jsonify({'error': 'Price cannot be negative'}), 400

    db = get_db()
    cursor = db.execute('''
        INSERT INTO posts (user_id, title, content, category, contact, price, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (g.current_user['user_id'], title, content, category, contact, price, image_url))
    db.commit()

    post_id = cursor.lastrowid
    post = db.execute('''
        SELECT p.*, u.username AS author_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ''', (post_id,)).fetchone()

    app.logger.info(f'Post created: id={post_id}, title="{title}", by user={g.current_user["username"]}')
    return jsonify({
        'message': 'Post created successfully',
        'post': dict(post)
    }), 201


@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@login_required
def update_post(post_id):
    """
    Update a post. Only the owner can update.
    Request: { "title": "...", "content": "...", "status": "...", "price": 0, ... }
    Response: { "message": "...", "post": {...} }
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    db = get_db()
    post = db.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    if post['user_id'] != g.current_user['user_id']:
        return jsonify({'error': 'Permission denied: you can only edit your own posts'}), 403

    title = data.get('title', post['title'])
    content = data.get('content', post['content'])
    status = data.get('status', post['status'])
    price = data.get('price', post['price'])
    contact = data.get('contact', post['contact'])
    image_url = data.get('image_url', post['image_url'])

    if status not in ('active', 'resolved', 'closed'):
        return jsonify({'error': 'Invalid status'}), 400

    db.execute('''
        UPDATE posts
        SET title = ?, content = ?, status = ?, price = ?, contact = ?, image_url = ?,
            updated_at = datetime('now', 'localtime')
        WHERE id = ?
    ''', (title, content, status, price, contact, image_url, post_id))
    db.commit()

    updated = db.execute('''
        SELECT p.*, u.username AS author_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ''', (post_id,)).fetchone()

    app.logger.info(f'Post updated: id={post_id}, by user={g.current_user["username"]}')
    return jsonify({
        'message': 'Post updated successfully',
        'post': dict(updated)
    })


@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    """
    Delete a post. Only the owner can delete.
    Response: { "message": "..." }
    """
    db = get_db()
    post = db.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    if post['user_id'] != g.current_user['user_id']:
        return jsonify({'error': 'Permission denied: you can only delete your own posts'}), 403

    db.execute('DELETE FROM posts WHERE id = ?', (post_id,))
    db.commit()

    app.logger.info(f'Post deleted: id={post_id}, by user={g.current_user["username"]}')
    return jsonify({'message': 'Post deleted successfully'})


# === Stats API (bonus) ===

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """
    Get platform statistics.
    Response: { "total_posts": N, "by_category": {...}, "recent_posts": [...] }
    """
    db = get_db()
    total = db.execute('SELECT COUNT(*) FROM posts WHERE status = "active"').fetchone()[0]

    categories = db.execute('''
        SELECT category, COUNT(*) as count
        FROM posts WHERE status = 'active'
        GROUP BY category
    ''').fetchall()

    recent = db.execute('''
        SELECT p.id, p.title, p.category, p.created_at, u.username AS author_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT 5
    ''').fetchall()

    return jsonify({
        'total_posts': total,
        'by_category': {row['category']: row['count'] for row in categories},
        'recent_posts': [dict(r) for r in recent]
    })


# --- Main ---
if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
