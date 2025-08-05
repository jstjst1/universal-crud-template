# SQLite Database Setup - Universal CRUD Template

## Quick Start

SQLite is a file-based database that requires no server setup - perfect for development and small applications!

### 1. Database File
The database file `crud_app.db` will be created automatically when you run the schema for the first time.

### 2. Create Database Schema
```bash
# Using SQLite command line (if installed)
sqlite3 crud_app.db < schema.sql

# Or using Node.js backend (will create automatically)
npm start
```

### 3. Add Sample Data
```bash
# Using SQLite command line
sqlite3 crud_app.db < sample_data.sql

# Sample data includes:
# - 4 users (including admin and regular users)
# - 5 categories (Electronics, Clothing, Books, Home & Garden, Sports)
# - 25 products across all categories
```

## Features

### ✅ Database Schema Includes:
- **Users table** - Authentication and user management
- **Categories table** - Product categorization
- **Products table** - Main product catalog
- **Foreign key constraints** - Data integrity
- **Indexes** - Performance optimization
- **Triggers** - Automatic timestamp updates

### ✅ Sample Data Includes:
- **Admin user**: `admin@example.com` / `admin123`
- **Regular users**: `user@example.com` / `user123`
- **25 sample products** across 5 categories
- **Realistic product data** with descriptions and pricing

## Usage with Different Backends

### Node.js Express
```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/sqlite/crud_app.db');
```

### Python Flask
```python
import sqlite3
conn = sqlite3.connect('./database/sqlite/crud_app.db')
```

### Java Spring Boot
```properties
# application.properties
spring.datasource.url=jdbc:sqlite:./database/sqlite/crud_app.db
spring.datasource.driver-class-name=org.sqlite.JDBC
```

### PHP
```php
$pdo = new PDO('sqlite:./database/sqlite/crud_app.db');
```

## SQLite Browser Tools

For easy database management, you can use:
- **DB Browser for SQLite** - https://sqlitebrowser.org/
- **SQLite Studio** - https://sqlitestudio.pl/
- **VS Code SQLite Extension** - Search "SQLite" in extensions

## Schema Details

### Users Table
- `id` - Primary key (auto-increment)
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - 'admin' or 'user'
- `created_at`, `updated_at` - Timestamps

### Categories Table
- `id` - Primary key (auto-increment)
- `name` - Category name
- `description` - Category description
- `created_at`, `updated_at` - Timestamps

### Products Table
- `id` - Primary key (auto-increment)
- `name` - Product name
- `description` - Product description
- `price` - Product price (decimal)
- `category_id` - Foreign key to categories
- `created_at`, `updated_at` - Timestamps

## Common SQLite Commands

```sql
-- View all tables
.tables

-- View table structure
.schema products

-- Show all products with categories
SELECT p.name, p.price, c.name as category 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id;

-- Count products by category
SELECT c.name, COUNT(p.id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.id = p.category_id 
GROUP BY c.id, c.name;
```

## Advantages of SQLite

✅ **No Setup Required** - File-based, no server needed  
✅ **Perfect for Development** - Instant setup and testing  
✅ **Cross-Platform** - Works on Windows, Mac, Linux  
✅ **Lightweight** - Small footprint, fast performance  
✅ **ACID Compliant** - Reliable transactions  
✅ **SQL Standard** - Standard SQL syntax  
✅ **Backup Friendly** - Just copy the .db file  

## Production Considerations

While SQLite is excellent for development and small applications, consider upgrading to PostgreSQL or MySQL for:
- High concurrent write loads
- Very large datasets (>1TB)
- Network-based applications
- Advanced features like full-text search

## Troubleshooting

### Database Locked Error
```bash
# Usually caused by another process using the database
# Close all applications using the database file
```

### Permission Issues
```bash
# Ensure write permissions to the database directory
chmod 755 ./database/sqlite/
```

### Missing sqlite3 Command
```bash
# Install SQLite command line tools
# Windows: Download from https://www.sqlite.org/download.html
# Mac: brew install sqlite
# Linux: apt-get install sqlite3
```

---

**🎯 SQLite is perfect for getting started quickly with the Universal CRUD Template!**
