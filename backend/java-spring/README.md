# Universal CRUD Template - Java Spring Boot Backend

A comprehensive Java Spring Boot backend providing REST APIs for user management, authentication, product management, and category management.

## 🚀 Features

- **Spring Boot 3.2+** with modern Java features
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **MySQL/PostgreSQL** support with automatic schema creation
- **Input validation** with Bean Validation
- **CORS support** for frontend integration
- **Role-based access control** (USER/ADMIN)
- **Comprehensive REST APIs** matching Node.js backend contract
- **Password encryption** with BCrypt
- **Pagination support** for large datasets
- **Exception handling** with proper error responses

## 📋 Prerequisites

- **Java 17+** (Required for Spring Boot 3.x)
- **Maven 3.6+** for dependency management
- **MySQL 8.0+** or **PostgreSQL 12+** database
- **Git** for version control

## 🛠️ Installation & Setup

### 1. Database Setup
```sql
-- For MySQL
CREATE DATABASE universal_crud;
CREATE USER 'crud_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON universal_crud.* TO 'crud_user'@'localhost';
FLUSH PRIVILEGES;

-- For PostgreSQL
CREATE DATABASE universal_crud;
CREATE USER crud_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE universal_crud TO crud_user;
```

### 2. Environment Configuration
Update `src/main/resources/application.properties`:

```properties
# Database Configuration (MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/universal_crud
spring.datasource.username=crud_user
spring.datasource.password=your_password

# OR PostgreSQL
# spring.datasource.url=jdbc:postgresql://localhost:5432/universal_crud
# spring.datasource.username=crud_user
# spring.datasource.password=your_password

# JWT Configuration
app.jwtSecret=your-super-secret-jwt-key-here
app.jwtExpirationMs=86400000

# Server Configuration
server.port=8080
```

### 3. Run the Application

**Option 1: Using Maven**
```bash
mvn clean install
mvn spring-boot:run
```

**Option 2: Using the startup script**
```bash
# Windows
start-java.bat

# Linux/Mac
chmod +x start-java.sh
./start-java.sh
```

**Option 3: Using JAR**
```bash
mvn clean package
java -jar target/universal-crud-1.0.0.jar
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/search?name=` - Search users

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/{id}` - Update category (Admin)
- `DELETE /api/categories/{id}` - Delete category (Admin)
- `GET /api/categories/search?name=` - Search categories

### Products
- `GET /api/products` - Get products (paginated)
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (Auth)
- `PUT /api/products/{id}` - Update product (Owner/Admin)
- `DELETE /api/products/{id}` - Delete product (Owner/Admin)
- `GET /api/products/search?q=` - Search products
- `GET /api/products/category/{id}` - Get products by category
- `GET /api/products/low-stock` - Get low stock products (Admin)
- `GET /api/products/stats` - Get inventory statistics (Admin)

## 🏗️ Project Structure

```
src/main/java/com/universalcrud/
├── controller/          # REST Controllers
│   ├── AuthController.java
│   ├── UserController.java
│   ├── CategoryController.java
│   └── ProductController.java
├── entity/             # JPA Entities
│   ├── User.java
│   ├── Category.java
│   └── Product.java
├── repository/         # Spring Data Repositories
│   ├── UserRepository.java
│   ├── CategoryRepository.java
│   └── ProductRepository.java
├── service/           # Business Logic
│   ├── UserService.java
│   ├── CategoryService.java
│   └── ProductService.java
├── security/          # Security Configuration
│   ├── WebSecurityConfig.java
│   ├── AuthTokenFilter.java
│   └── AuthEntryPointJwt.java
├── dto/              # Data Transfer Objects
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   └── JwtResponse.java
├── util/             # Utilities
│   └── JwtUtils.java
└── UniversalCrudApplication.java
```

## 🔧 Configuration

### Database Profiles
The application supports multiple database configurations:

**MySQL Profile:**
```properties
spring.profiles.active=mysql
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

**PostgreSQL Profile:**
```properties
spring.profiles.active=postgresql
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### JWT Configuration
```properties
app.jwtSecret=your-secret-key-must-be-at-least-256-bits
app.jwtExpirationMs=86400000  # 24 hours
```

### CORS Configuration
CORS is configured to allow all origins for development. For production, update `WebSecurityConfig.java`:

```java
configuration.setAllowedOriginPatterns(List.of("https://yourdomain.com"));
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8080/actuator/health

# Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get products
curl http://localhost:8080/api/products
```

### Integration with Frontend
This backend is fully compatible with the React frontend. Update the API base URL in your frontend configuration:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 📊 Performance & Scaling

- **Connection Pooling**: HikariCP (default in Spring Boot)
- **Database Indexing**: Automatic on primary keys and foreign keys
- **Query Optimization**: Spring Data JPA with JPQL
- **Caching**: Ready for Redis integration
- **Pagination**: Built-in pagination support

## 🔒 Security Features

- **JWT Authentication**: Stateless authentication
- **Password Encryption**: BCrypt hashing
- **Role-based Access**: USER and ADMIN roles
- **CORS Protection**: Configurable CORS policy
- **Input Validation**: Bean Validation annotations
- **SQL Injection Protection**: JPA/Hibernate parameterized queries

## 🚀 Production Deployment

### Docker Deployment
```dockerfile
FROM openjdk:17-jre-slim
COPY target/universal-crud-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment Variables
```bash
SPRING_DATASOURCE_URL=jdbc:mysql://prod-db:3306/universal_crud
SPRING_DATASOURCE_USERNAME=prod_user
SPRING_DATASOURCE_PASSWORD=secure_password
JWT_SECRET=production-secret-key
SERVER_PORT=8080
```

## 🤝 API Compatibility

This Java Spring Boot backend provides the same API contract as the Node.js Express backend, ensuring seamless frontend integration across technology stacks.

## 📚 Dependencies

- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- Spring Boot Starter Validation
- JSON Web Token (JJWT)
- MySQL Connector
- PostgreSQL Driver
- BCrypt Password Encoder

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port in application.properties
   server.port=8081
   ```

2. **Database connection failed**
   ```bash
   # Check database is running
   # Verify credentials in application.properties
   # Ensure database exists
   ```

3. **Maven dependencies not found**
   ```bash
   mvn clean install -U
   ```

4. **JWT token issues**
   ```bash
   # Ensure JWT secret is at least 256 bits
   # Check token expiration time
   ```

## 📈 Next Steps

- Add Redis caching layer
- Implement file upload functionality  
- Add API rate limiting
- Integrate with external services
- Add comprehensive unit tests
- Set up CI/CD pipeline
