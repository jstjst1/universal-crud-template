# Node.js + Express Backend

A robust REST API backend built with Node.js and Express, supporting both MySQL and PostgreSQL databases.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL or PostgreSQL database
- Git

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend/node-express
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database configuration:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Database Configuration
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=universal_crud
   DB_USER=root
   DB_PASSWORD=
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   ```

4. **Database setup:**
   
   **For MySQL (XAMPP):**
   - Start XAMPP (Apache + MySQL)
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Import `../../database/mysql/schema.sql`
   
   **For PostgreSQL:**
   - Ensure PostgreSQL is running
   - Create database: `createdb universal_crud`
   - Import schema: `psql -d universal_crud -f ../../database/postgresql/schema.sql`

5. **Start the server:**
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

The API will be available at `http://localhost:3001`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Products
- `GET /api/products` - Get all products (with pagination, filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `GET /api/categories/:id/products` - Get products in category
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/change-password` - Change password
- `DELETE /api/users/:id` - Delete user (admin only)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Demo Accounts

**Admin Account:**
- Username: `admin`
- Password: `password`
- Role: `admin`

**Regular User:**
- Username: `john_doe`
- Password: `password`
- Role: `user`

## 📊 Database Support

### MySQL Configuration
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=universal_crud
DB_USER=root
DB_PASSWORD=
```

### PostgreSQL Configuration
```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=universal_crud
DB_USER=postgres
DB_PASSWORD=your_password
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - express-validator for all inputs
- **Rate Limiting** - Protect against brute force attacks
- **CORS Protection** - Configurable cross-origin requests
- **Helmet.js** - Security headers
- **SQL Injection Prevention** - Parameterized queries

## 🚦 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 📝 Request/Response Examples

### Create Product
```bash
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 29.99,
  "quantity": 100,
  "category_id": 1,
  "image_url": "https://example.com/image.jpg"
}
```

### Get Products with Filtering
```bash
GET /api/products?page=1&limit=10&category_id=1&status=active&search=laptop
```

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_TYPE` | Database type (mysql/postgresql) | mysql |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | universal_crud |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | |
| `JWT_SECRET` | JWT secret key | required |
| `JWT_EXPIRES_IN` | Token expiration | 24h |
| `ALLOWED_ORIGINS` | CORS origins | localhost:3000,localhost:4200,localhost:8080 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Production Deployment

1. **Set environment variables:**
   ```env
   NODE_ENV=production
   JWT_SECRET=<strong-secret-key>
   DB_PASSWORD=<secure-password>
   ```

2. **Install production dependencies:**
   ```bash
   npm ci --only=production
   ```

3. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "crud-api"
   ```

## 🔍 Health Check

Check if the API is running:
```bash
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "development"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
