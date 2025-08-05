from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql://root:@localhost/universal_crud')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
cors = CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    role = db.Column(db.String(20), default='USER')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    products = db.relationship('Product', backref='creator', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'role': self.role,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    products = db.relationship('Product', backref='category', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'productCount': len(self.products)
        }

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    image = db.Column(db.String(255))
    sku = db.Column(db.String(100), unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price) if self.price else 0,
            'quantity': self.quantity,
            'image': self.image,
            'sku': self.sku,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'categoryId': self.category_id,
            'category': self.category.to_dict() if self.category else None,
            'createdBy': self.creator.to_dict() if self.creator else None
        }

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validation
        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'message': 'Username, email, and password are required'}), 400
        
        # Check if user exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'message': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            password=hashed_password,
            first_name=data.get('firstName', ''),
            last_name=data.get('lastName', ''),
            role='USER'
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.username)
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'token': access_token,
                'type': 'Bearer',
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.username)
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'token': access_token,
                    'type': 'Bearer',
                    'username': user.username,
                    'email': user.email,
                    'role': user.role
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        
        if user:
            return jsonify({
                'success': True,
                'data': user.to_dict(),
                'message': 'User details retrieved successfully'
            })
        else:
            return jsonify({'success': False, 'message': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Product Routes
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('size', 10, type=int)
        category_id = request.args.get('categoryId', type=int)
        
        query = Product.query.filter_by(is_active=True)
        
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        products = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': [product.to_dict() for product in products.items],
            'pagination': {
                'page': products.page,
                'size': products.per_page,
                'totalElements': products.total,
                'totalPages': products.pages,
                'hasNext': products.has_next,
                'hasPrevious': products.has_prev
            },
            'message': 'Products retrieved successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)
        if product:
            return jsonify({
                'success': True,
                'data': product.to_dict(),
                'message': 'Product retrieved successfully'
            })
        else:
            return jsonify({'success': False, 'message': 'Product not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        
        data = request.get_json()
        
        # Generate SKU if not provided
        if not data.get('sku'):
            import uuid
            data['sku'] = f"SKU-{uuid.uuid4().hex[:8].upper()}"
        
        product = Product(
            name=data['name'],
            description=data.get('description', ''),
            price=data['price'],
            quantity=data.get('quantity', 0),
            image=data.get('image', ''),
            sku=data['sku'],
            category_id=data.get('categoryId'),
            created_by=user.id
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': product.to_dict(),
            'message': 'Product created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Category Routes
@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.all()
        return jsonify({
            'success': True,
            'data': [category.to_dict() for category in categories],
            'message': 'Categories retrieved successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/categories', methods=['POST'])
@jwt_required()
def create_category():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        
        # Check if user is admin
        if user.role != 'ADMIN':
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        
        data = request.get_json()
        
        # Check if category name exists
        if Category.query.filter_by(name=data['name']).first():
            return jsonify({'success': False, 'message': 'Category name already exists'}), 400
        
        category = Category(
            name=data['name'],
            description=data.get('description', '')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': category.to_dict(),
            'message': 'Category created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# User Routes
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        
        # Check if user is admin
        if user.role != 'ADMIN':
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        
        users = User.query.all()
        return jsonify({
            'success': True,
            'data': [user.to_dict() for user in users],
            'message': 'Users retrieved successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': 'Python Flask API is running',
        'timestamp': datetime.utcnow().isoformat()
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal server error'}), 500

# Initialize database
with app.app_context():
    db.create_all()
    
    # Create admin user if not exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        admin = User(
            username='admin',
            email='admin@example.com',
            password=hashed_password,
            first_name='Admin',
            last_name='User',
            role='ADMIN'
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user created: admin/admin123")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
