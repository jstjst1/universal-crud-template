-- Sample data for SQLite Universal CRUD Template
-- Run this after creating the schema

-- Insert sample categories
INSERT OR IGNORE INTO categories (id, name, description) VALUES 
(1, 'Electronics', 'Electronic devices and gadgets'),
(2, 'Clothing', 'Apparel and fashion items'),
(3, 'Books', 'Books and educational materials'),
(4, 'Home & Garden', 'Home improvement and gardening supplies'),
(5, 'Sports', 'Sports equipment and accessories');

-- Insert sample users (passwords are hashed versions of simple passwords)
-- admin123 hashed and user123 hashed (in real app, use proper bcrypt)
INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES 
(1, 'Admin User', 'admin@example.com', '$2b$10$rQj7QnZvDnZvQj7QnZvDnOeKNrZ9KNrZ9KNrZ9KNrZ9KNrZ9K', 'admin'),
(2, 'John Doe', 'user@example.com', '$2b$10$rQj7QnZvDnZvQj7QnZvDnOeKNrZ9KNrZ9KNrZ9KNrZ9KNrZ9K', 'user'),
(3, 'Jane Smith', 'jane@example.com', '$2b$10$rQj7QnZvDnZvQj7QnZvDnOeKNrZ9KNrZ9KNrZ9KNrZ9KNrZ9K', 'user'),
(4, 'Mike Johnson', 'mike@example.com', '$2b$10$rQj7QnZvDnZvQj7QnZvDnOeKNrZ9KNrZ9KNrZ9KNrZ9KNrZ9K', 'user');

-- Insert sample products
INSERT OR IGNORE INTO products (id, name, description, price, category_id) VALUES 
-- Electronics
(1, 'MacBook Pro 13"', 'Apple MacBook Pro with M2 chip, 256GB SSD, 8GB RAM', 1299.99, 1),
(2, 'iPhone 14', 'Latest iPhone with advanced camera system', 799.99, 1),
(3, 'Samsung Galaxy S23', 'Flagship Android smartphone with excellent display', 699.99, 1),
(4, 'Dell XPS 13', 'Ultra-portable Windows laptop with InfinityEdge display', 999.99, 1),
(5, 'Sony WH-1000XM4', 'Noise-cancelling wireless headphones', 279.99, 1),

-- Clothing
(6, 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt available in multiple colors', 19.99, 2),
(7, 'Levi''s 501 Jeans', 'Classic straight-fit jeans', 59.99, 2),
(8, 'Nike Air Max', 'Comfortable running shoes with air cushioning', 129.99, 2),
(9, 'Wool Sweater', 'Warm merino wool sweater perfect for winter', 89.99, 2),
(10, 'Summer Dress', 'Light and breezy dress perfect for summer', 45.99, 2),

-- Books
(11, 'JavaScript The Complete Guide', 'Comprehensive guide to modern JavaScript development', 39.99, 3),
(12, 'Clean Code', 'A handbook of agile software craftsmanship', 32.99, 3),
(13, 'The Art of War', 'Ancient Chinese military treatise', 12.99, 3),
(14, 'Atomic Habits', 'Tiny changes, remarkable results', 18.99, 3),
(15, 'The Lean Startup', 'How constant innovation creates successful businesses', 24.99, 3),

-- Home & Garden
(16, 'Coffee Maker', 'Programmable drip coffee maker with 12-cup capacity', 79.99, 4),
(17, 'Garden Tool Set', 'Complete set of essential gardening tools', 49.99, 4),
(18, 'LED Table Lamp', 'Adjustable LED desk lamp with USB charging port', 34.99, 4),
(19, 'Indoor Plant Kit', 'Everything needed to start an indoor herb garden', 29.99, 4),
(20, 'Throw Pillows Set', 'Set of 4 decorative throw pillows', 39.99, 4),

-- Sports
(21, 'Yoga Mat', 'Non-slip premium yoga mat with carrying strap', 24.99, 5),
(22, 'Dumbbell Set', 'Adjustable dumbbell set 5-50 lbs', 199.99, 5),
(23, 'Tennis Racket', 'Professional-grade tennis racket', 89.99, 5),
(24, 'Basketball', 'Official size basketball', 19.99, 5),
(25, 'Fitness Tracker', 'Waterproof fitness tracker with heart rate monitor', 59.99, 5);

-- Verify the data was inserted
SELECT 'Categories:' as info;
SELECT COUNT(*) as total_categories FROM categories;

SELECT 'Users:' as info;
SELECT COUNT(*) as total_users FROM users;

SELECT 'Products:' as info;
SELECT COUNT(*) as total_products FROM products;

-- Show sample data
SELECT 'Sample Products:' as info;
SELECT p.name, p.price, c.name as category 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id 
LIMIT 5;
