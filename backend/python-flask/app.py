from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import BadRequest
import os
from datetime import datetime, timedelta
import mysql.connector
import psycopg2
from psycopg2.extras import RealDictCursor
import sqlite3
from functools import wraps
import re

app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

# Initialize extensions
jwt = JWTManager(app)
CORS(app, origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:4200').split(','))

# Database configuration
DB_TYPE = os.getenv('DB_TYPE', 'mysql')
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '3306' if DB_TYPE == 'mysql' else '5432')),
    'database': os.getenv('DB_NAME', 'universal_crud'),
    'user': os.getenv('DB_USER', 'root' if DB_TYPE == 'mysql' else 'postgres'),
    'password': os.getenv('DB_PASSWORD', '')
}

class Database:
    def __init__(self):
        self.db_type = DB_TYPE
        
    def get_connection(self):
        if self.db_type == 'mysql':
            return mysql.connector.connect(**DB_CONFIG)
        elif self.db_type == 'postgresql':
            return psycopg2.connect(**DB_CONFIG)
        elif self.db_type == 'sqlite':
            return sqlite3.connect(os.getenv('DB_NAME', 'universal_crud.db'))
        else:
            raise ValueError(f"Unsupported database type: {self.db_type}")
    
    def execute_query(self, query, params=None, fetch=False):
        conn = self.get_connection()
        try:
            if self.db_type == 'postgresql':
                cursor = conn.cursor(cursor_factory=RealDictCursor)
            else:
                cursor = conn.cursor()
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if fetch:
                if self.db_type == 'sqlite':
                    # Convert sqlite3.Row to dict
                    conn.row_factory = sqlite3.Row
                    cursor = conn.cursor()
                    if params:
                        cursor.execute(query, params)
                    else:
                        cursor.execute(query)
                    rows = cursor.fetchall()
                    return [dict(row) for row in rows]
                else:
                    rows = cursor.fetchall()
                    if self.db_type == 'mysql':
                        columns = [desc[0] for desc in cursor.description]
                        return [dict(zip(columns, row)) for row in rows]
                    return rows
            else:
                conn.commit()
                return cursor.lastrowid if self.db_type != 'postgresql' else cursor.rowcount
        finally:
            conn.close()

db = Database()

# Utility functions
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_username(username):
    pattern = r'^[a-zA-Z0-9_]+$'
    return re.match(pattern, username) is not None and 3 <= len(username) <= 50

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = db.execute_query(
            "SELECT role FROM users WHERE id = %s" if db.db_type != 'sqlite' else "SELECT role FROM users WHERE id = ?",
            (user_id,),
            fetch=True
        )
        if not user or user[0]['role'] != 'admin':
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'success': False, 'message': 'Bad request'}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'success': False, 'message': 'Unauthorized'}), 401

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal server error'}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.utcnow().isoformat(),
        'database': DB_TYPE
    })

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validation
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        
        errors = []
        if not username or not validate_username(username):
            errors.append('Username must be 3-50 characters and contain only letters, numbers, and underscores')
        if not email or not validate_email(email):
            errors.append('Please provide a valid email address')
        if not password or len(password) < 6:
            errors.append('Password must be at least 6 characters long')
        
        if errors:
            return jsonify({'success': False, 'message': 'Validation failed', 'errors': errors}), 400
        
        # Check if user exists
        placeholder = "%s" if db.db_type != 'sqlite' else "?"
        existing_user = db.execute_query(
            f"SELECT id FROM users WHERE username = {placeholder} OR email = {placeholder}",
            (username, email),
            fetch=True
        )
        
        if existing_user:
            return jsonify({'success': False, 'message': 'User with this username or email already exists'}), 409
        
        # Create user
        password_hash = generate_password_hash(password)
        user_id = db.execute_query(
            f"INSERT INTO users (username, email, password, first_name, last_name) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})" if db.db_type != 'sqlite' else 
            "INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
            (username, email, password_hash, first_name or None, last_name or None)
        )
        
        # Create access token
        access_token = create_access_token(identity=user_id)
        
        # Get created user
        user = db.execute_query(
            f"SELECT id, username, email, first_name, last_name, role FROM users WHERE id = {placeholder}",
            (user_id,),
            fetch=True
        )[0]
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'user': user,
                'token': access_token
            }
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        username_or_email = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username_or_email or not password:
            return jsonify({'success': False, 'message': 'Username and password are required'}), 400
        
        # Find user
        placeholder = "%s" if db.db_type != 'sqlite' else "?"
        user = db.execute_query(
            f"SELECT id, username, email, password, first_name, last_name, role FROM users WHERE username = {placeholder} OR email = {placeholder}",
            (username_or_email, username_or_email),
            fetch=True
        )
        
        if not user or not check_password_hash(user[0]['password'], password):
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        user_data = user[0]
        access_token = create_access_token(identity=user_data['id'])
        
        # Remove password from response
        del user_data['password']
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user_data,
                'token': access_token
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        user_id = get_jwt_identity()
        placeholder = "%s" if db.db_type != 'sqlite' else "?"
        user = db.execute_query(
            f"SELECT id, username, email, first_name, last_name, role FROM users WHERE id = {placeholder}",
            (user_id,),
            fetch=True
        )
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'user': user[0]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Products routes
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 10)), 100)
        offset = (page - 1) * limit
        category_id = request.args.get('category_id')
        status = request.args.get('status', 'active')
        search = request.args.get('search', '').strip()
        
        # Build query
        where_conditions = []
        params = []
        
        if category_id:
            where_conditions.append("p.category_id = %s" if db.db_type != 'sqlite' else "p.category_id = ?")
            params.append(category_id)
        
        if status:
            where_conditions.append("p.status = %s" if db.db_type != 'sqlite' else "p.status = ?")
            params.append(status)
        
        if search:
            where_conditions.append("(p.name LIKE %s OR p.description LIKE %s)" if db.db_type != 'sqlite' else "(p.name LIKE ? OR p.description LIKE ?)")
            params.extend([f"%{search}%", f"%{search}%"])
        
        where_clause = " AND ".join(where_conditions)
        if where_clause:
            where_clause = "WHERE " + where_clause
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM products p {where_clause}"
        total = db.execute_query(count_query, params, fetch=True)[0]['total']
        
        # Get products
        placeholder = "%s" if db.db_type != 'sqlite' else "?"
        products_query = f"""
            SELECT p.id, p.name, p.description, p.price, p.quantity, p.category_id,
                   c.name as category_name, p.image_url, p.status, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            {where_clause}
            ORDER BY p.created_at DESC
            LIMIT {placeholder} OFFSET {placeholder}
        """
        
        products = db.execute_query(products_query, params + [limit, offset], fetch=True)
        
        total_pages = (total + limit - 1) // limit
        
        return jsonify({
            'success': True,
            'data': {
                'products': products,
                'pagination': {
                    'current_page': page,
                    'total_pages': total_pages,
                    'total_items': total,
                    'items_per_page': limit,
                    'has_next': page < total_pages,
                    'has_prev': page > 1
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        placeholder = "%s" if db.db_type != 'sqlite' else "?"
        product = db.execute_query(f"""
            SELECT p.id, p.name, p.description, p.price, p.quantity, p.category_id,
                   c.name as category_name, p.image_url, p.status, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = {placeholder}
        """, (product_id,), fetch=True)
        
        if not product:
            return jsonify({'success': False, 'message': 'Product not found'}), 404
        
        return jsonify({
            'success': True,
            'data': {
                'product': product[0]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        price = data.get('price')
        quantity = data.get('quantity', 0)
        category_id = data.get('category_id')
        image_url = data.get('image_url', '').strip()
        
        # Validation
        errors = []
        if not name or len(name) > 100:
            errors.append('Product name is required and must be less than 100 characters')
        if price is None or float(price) < 0:
            errors.append('Price must be a positive number')
        if quantity < 0:
            errors.append('Quantity must be non-negative')
        
        if errors:
            return jsonify({'success': False, 'message': 'Validation failed', 'errors': errors}), 400
        
        # Verify category exists if provided
        if category_id:
            placeholder = "%s" if db.db_type != 'sqlite' else "?"
            category = db.execute_query(
                f"SELECT id FROM categories WHERE id = {placeholder}",
                (category_id,),
                fetch=True
            )
            if not category:
                return jsonify({'success': False, 'message': 'Category not found'}), 400
        
        # Insert product
        product_id = db.execute_query(f"""
            INSERT INTO products (name, description, price, quantity, category_id, image_url)
            VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
        """ if db.db_type != 'sqlite' else """
            INSERT INTO products (name, description, price, quantity, category_id, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, description or None, float(price), int(quantity), category_id, image_url or None))
        
        # Get created product
        product = db.execute_query(f"""
            SELECT p.id, p.name, p.description, p.price, p.quantity, p.category_id,
                   c.name as category_name, p.image_url, p.status, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = {placeholder}
        """, (product_id,), fetch=True)[0]
        
        return jsonify({
            'success': True,
            'message': 'Product created successfully',
            'data': {
                'product': product
            }
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Categories routes
@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        categories = db.execute_query("""
            SELECT c.id, c.name, c.description, c.created_at,
                   COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
            GROUP BY c.id, c.name, c.description, c.created_at
            ORDER BY c.name ASC
        """, fetch=True)
        
        return jsonify({
            'success': True,
            'data': {
                'categories': categories
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    )
