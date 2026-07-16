"""
Basic API tests for Campus Info Hub backend.
Run with: python -m pytest tests/test_api.py -v
"""
import pytest
import json
import tempfile
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, init_db


@pytest.fixture
def client():
    """Create test client with fresh database."""
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    app.config['DATABASE'] = db_path
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret'

    with app.app_context():
        init_db()

    yield app.test_client()

    os.close(db_fd)
    os.unlink(db_path)


def test_health_check(client):
    """Test health check endpoint."""
    rv = client.get('/api/health')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['status'] == 'ok'


def test_register(client):
    """Test user registration."""
    rv = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123',
        'contact': 'wechat123'
    })
    assert rv.status_code == 201
    data = rv.get_json()
    assert 'token' in data
    assert data['user']['username'] == 'testuser'


def test_register_duplicate(client):
    """Test duplicate registration fails."""
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    rv = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password456'
    })
    assert rv.status_code == 409


def test_login_success(client):
    """Test successful login."""
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    rv = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    assert rv.status_code == 200
    assert 'token' in rv.get_json()


def test_login_wrong_password(client):
    """Test login with wrong password."""
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    rv = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'wrongpassword'
    })
    assert rv.status_code == 401


def test_create_post_without_auth(client):
    """Test creating post without authentication fails."""
    rv = client.post('/api/posts', json={
        'title': 'Test Post',
        'content': 'Test content',
        'category': 'lost_found'
    })
    assert rv.status_code == 401


def test_create_post_with_auth(client):
    """Test creating post with authentication."""
    # Register and get token
    rv = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = rv.get_json()['token']

    # Create post
    rv = client.post('/api/posts', json={
        'title': 'Lost Wallet',
        'content': 'Found a black wallet near library',
        'category': 'lost_found',
        'contact': 'wechat123'
    }, headers={'Authorization': f'Bearer {token}'})
    assert rv.status_code == 201
    data = rv.get_json()
    assert data['post']['title'] == 'Lost Wallet'
    assert data['post']['category'] == 'lost_found'


def test_get_posts(client):
    """Test getting posts list."""
    # Register and create posts
    rv = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = rv.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    for i in range(3):
        client.post('/api/posts', json={
            'title': f'Post {i}',
            'content': f'Content {i}',
            'category': 'info'
        }, headers=headers)

    rv = client.get('/api/posts?category=info')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['total'] == 3
    assert len(data['posts']) == 3


def test_get_single_post(client):
    """Test getting a single post."""
    rv = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = rv.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    rv = client.post('/api/posts', json={
        'title': 'Test Post',
        'content': 'Test content',
        'category': 'market',
        'price': 99.5
    }, headers=headers)
    post_id = rv.get_json()['post']['id']

    rv = client.get(f'/api/posts/{post_id}')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['post']['title'] == 'Test Post'
    assert data['post']['price'] == 99.5


def test_update_post(client):
    """Test updating a post."""
    rv = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = rv.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    rv = client.post('/api/posts', json={
        'title': 'Original Title',
        'content': 'Original content',
        'category': 'lost_found'
    }, headers=headers)
    post_id = rv.get_json()['post']['id']

    rv = client.put(f'/api/posts/{post_id}', json={
        'title': 'Updated Title',
        'status': 'resolved'
    }, headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['post']['title'] == 'Updated Title'
    assert data['post']['status'] == 'resolved'


def test_delete_post(client):
    """Test deleting a post."""
    rv = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = rv.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    rv = client.post('/api/posts', json={
        'title': 'To Delete',
        'content': 'This will be deleted',
        'category': 'info'
    }, headers=headers)
    post_id = rv.get_json()['post']['id']

    rv = client.delete(f'/api/posts/{post_id}', headers=headers)
    assert rv.status_code == 200

    # Verify it's gone
    rv = client.get(f'/api/posts/{post_id}')
    assert rv.status_code == 404


def test_stats(client):
    """Test stats endpoint."""
    rv = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = rv.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    client.post('/api/posts', json={
        'title': 'Post 1', 'content': 'Content 1', 'category': 'lost_found'
    }, headers=headers)
    client.post('/api/posts', json={
        'title': 'Post 2', 'content': 'Content 2', 'category': 'market'
    }, headers=headers)

    rv = client.get('/api/stats')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['total_posts'] == 2
    assert 'lost_found' in data['by_category']
    assert 'market' in data['by_category']
