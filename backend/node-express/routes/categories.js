const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 50 })
    .withMessage('Category name must be less than 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const { sql, params } = db.buildQuery(`
      SELECT 
        c.id, 
        c.name, 
        c.description,
        c.created_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id, c.name, c.description, c.created_at
      ORDER BY c.name ASC
    `);

    const categories = await db.query(sql, params);

    res.json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// GET /api/categories/:id - Get a single category
router.get('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (!categoryId || categoryId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const { sql, params } = db.buildQuery(`
      SELECT 
        c.id, 
        c.name, 
        c.description,
        c.created_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.description, c.created_at
    `, [categoryId]);

    const categories = await db.query(sql, params);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category: categories[0]
      }
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// GET /api/categories/:id/products - Get products in a category
router.get('/:id/products', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    if (!categoryId || categoryId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Check if category exists
    const { sql: checkSql, params: checkParams } = db.buildQuery(
      'SELECT id, name FROM categories WHERE id = ?',
      [categoryId]
    );
    
    const categories = await db.query(checkSql, checkParams);
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get total count
    const { sql: countSql, params: countParams } = db.buildQuery(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND status = ?',
      [categoryId, 'active']
    );
    
    const countResult = await db.query(countSql, countParams);
    const total = countResult[0].total || countResult[0].count;

    // Get products
    const { sql: productsSql, params: productsParams } = db.buildQuery(`
      SELECT 
        id, 
        name, 
        description, 
        price, 
        quantity, 
        image_url, 
        status, 
        created_at, 
        updated_at
      FROM products 
      WHERE category_id = ? AND status = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [categoryId, 'active', limit, offset]);

    const products = await db.query(productsSql, productsParams);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        category: categories[0],
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
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category products',
      error: error.message
    });
  }
});

// POST /api/categories - Create a new category (requires admin)
router.post('/', authenticateToken, authorizeRoles('admin'), createCategoryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description } = req.body;

    // Check if category already exists
    const { sql: checkSql, params: checkParams } = db.buildQuery(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    );
    
    const existingCategories = await db.query(checkSql, checkParams);
    if (existingCategories.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Insert category
    const { sql, params } = db.buildQuery(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    const result = await db.query(sql, params);
    const categoryId = result.insertId || result[0]?.id;

    // Fetch the created category
    const { sql: fetchSql, params: fetchParams } = db.buildQuery(
      'SELECT id, name, description, created_at FROM categories WHERE id = ?',
      [categoryId]
    );

    const categories = await db.query(fetchSql, fetchParams);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category: { ...categories[0], product_count: 0 }
      }
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// PUT /api/categories/:id - Update a category (requires admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateCategoryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const categoryId = parseInt(req.params.id);
    
    if (!categoryId || categoryId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Check if category exists
    const { sql: checkSql, params: checkParams } = db.buildQuery(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    );
    
    const existingCategories = await db.query(checkSql, checkParams);
    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 0;

    if (req.body.hasOwnProperty('name')) {
      // Check if new name already exists (excluding current category)
      const { sql: nameSql, params: nameParams } = db.buildQuery(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [req.body.name, categoryId]
      );
      
      const existingNames = await db.query(nameSql, nameParams);
      if (existingNames.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }

      updateFields.push(`name = ${db.getPlaceholder(paramIndex++)}`);
      updateParams.push(req.body.name);
    }

    if (req.body.hasOwnProperty('description')) {
      updateFields.push(`description = ${db.getPlaceholder(paramIndex++)}`);
      updateParams.push(req.body.description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateParams.push(categoryId);

    const updateQuery = db.adaptQuery(`
      UPDATE categories 
      SET ${updateFields.join(', ')} 
      WHERE id = ${db.getPlaceholder(paramIndex)}
    `);

    await db.query(updateQuery, updateParams);

    // Fetch updated category with product count
    const { sql: fetchSql, params: fetchParams } = db.buildQuery(`
      SELECT 
        c.id, 
        c.name, 
        c.description,
        c.created_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.description, c.created_at
    `, [categoryId]);

    const categories = await db.query(fetchSql, fetchParams);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: categories[0]
      }
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// DELETE /api/categories/:id - Delete a category (requires admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (!categoryId || categoryId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Check if category exists
    const { sql: checkSql, params: checkParams } = db.buildQuery(
      'SELECT id, name FROM categories WHERE id = ?',
      [categoryId]
    );
    
    const existingCategories = await db.query(checkSql, checkParams);
    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const { sql: productsSql, params: productsParams } = db.buildQuery(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [categoryId]
    );
    
    const productCount = await db.query(productsSql, productsParams);
    const hasProducts = (productCount[0].count || productCount[0].total) > 0;

    if (hasProducts) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete category that has products. Please remove or reassign products first.'
      });
    }

    // Delete category
    const { sql, params } = db.buildQuery(
      'DELETE FROM categories WHERE id = ?',
      [categoryId]
    );

    await db.query(sql, params);

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: {
        deleted_category: existingCategories[0]
      }
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

module.exports = router;
