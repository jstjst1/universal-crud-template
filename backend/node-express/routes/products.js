const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
];

const updateProductValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters')
];

// GET /api/products - Get all products with pagination and filtering
router.get('/', queryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { category_id, status, search } = req.query;

    // Build WHERE clause
    let whereConditions = [];
    let params = [];
    let paramIndex = 0;

    if (category_id) {
      whereConditions.push(`p.category_id = ${db.getPlaceholder(paramIndex++)}`);
      params.push(category_id);
    }

    if (status) {
      whereConditions.push(`p.status = ${db.getPlaceholder(paramIndex++)}`);
      params.push(status);
    }

    if (search) {
      whereConditions.push(`(p.name LIKE ${db.getPlaceholder(paramIndex++)} OR p.description LIKE ${db.getPlaceholder(paramIndex++)})`);
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = db.adaptQuery(`
      SELECT COUNT(*) as total 
      FROM products p 
      ${whereClause}
    `);
    
    const countResult = await db.query(countQuery, params);
    const total = countResult[0].total || countResult[0].count;

    // Get products with category information
    const productsQuery = db.adaptQuery(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.quantity, 
        p.category_id,
        c.name as category_name,
        p.image_url, 
        p.status, 
        p.created_at, 
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ${db.getPlaceholder(paramIndex++)} OFFSET ${db.getPlaceholder(paramIndex++)}
    `);

    params.push(limit, offset);
    const products = await db.query(productsQuery, params);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limit,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// GET /api/products/:id - Get a single product
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (!productId || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const { sql, params } = db.buildQuery(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.quantity, 
        p.category_id,
        c.name as category_name,
        p.image_url, 
        p.status, 
        p.created_at, 
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    const products = await db.query(sql, params);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        product: products[0]
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// POST /api/products - Create a new product (requires authentication)
router.post('/', authenticateToken, createProductValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, price, quantity, category_id, image_url } = req.body;

    // Verify category exists if provided
    if (category_id) {
      const { sql: categorySql, params: categoryParams } = db.buildQuery(
        'SELECT id FROM categories WHERE id = ?',
        [category_id]
      );
      
      const categories = await db.query(categorySql, categoryParams);
      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Insert product
    const { sql, params } = db.buildQuery(`
      INSERT INTO products (name, description, price, quantity, category_id, image_url) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, description || null, price, quantity || 0, category_id || null, image_url || null]);

    const result = await db.query(sql, params);
    const productId = result.insertId || result[0]?.id;

    // Fetch the created product
    const { sql: fetchSql, params: fetchParams } = db.buildQuery(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.quantity, 
        p.category_id,
        c.name as category_name,
        p.image_url, 
        p.status, 
        p.created_at, 
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    const products = await db.query(fetchSql, fetchParams);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: products[0]
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Update a product (requires authentication)
router.put('/:id', authenticateToken, updateProductValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productId = parseInt(req.params.id);
    
    if (!productId || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Check if product exists
    const { sql: checkSql, params: checkParams } = db.buildQuery(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );
    
    const existingProducts = await db.query(checkSql, checkParams);
    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 0;

    const allowedFields = ['name', 'description', 'price', 'quantity', 'category_id', 'image_url', 'status'];
    
    for (const field of allowedFields) {
      if (req.body.hasOwnProperty(field)) {
        updateFields.push(`${field} = ${db.getPlaceholder(paramIndex++)}`);
        updateParams.push(req.body[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Verify category exists if being updated
    if (req.body.category_id) {
      const { sql: categorySql, params: categoryParams } = db.buildQuery(
        'SELECT id FROM categories WHERE id = ?',
        [req.body.category_id]
      );
      
      const categories = await db.query(categorySql, categoryParams);
      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Add updated_at field
    updateFields.push(`updated_at = ${db.dbType === 'mysql' ? 'NOW()' : 'CURRENT_TIMESTAMP'}`);
    updateParams.push(productId);

    const updateQuery = db.adaptQuery(`
      UPDATE products 
      SET ${updateFields.join(', ')} 
      WHERE id = ${db.getPlaceholder(paramIndex)}
    `);

    await db.query(updateQuery, updateParams);

    // Fetch updated product
    const { sql: fetchSql, params: fetchParams } = db.buildQuery(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.quantity, 
        p.category_id,
        c.name as category_name,
        p.image_url, 
        p.status, 
        p.created_at, 
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    const products = await db.query(fetchSql, fetchParams);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: products[0]
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Delete a product (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (!productId || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Check if product exists
    const { sql: checkSql, params: checkParams } = db.buildQuery(
      'SELECT id, name FROM products WHERE id = ?',
      [productId]
    );
    
    const existingProducts = await db.query(checkSql, checkParams);
    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product
    const { sql, params } = db.buildQuery(
      'DELETE FROM products WHERE id = ?',
      [productId]
    );

    await db.query(sql, params);

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        deleted_product: existingProducts[0]
      }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

module.exports = router;
