const express = require('express');
const bcrypt = require('bcryptjs');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('first_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('last_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user')
];

const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
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
  query('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters')
];

// GET /api/users - Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), queryValidation, async (req, res) => {
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
    const { role, search } = req.query;

    // Build WHERE clause
    let whereConditions = [];
    let params = [];
    let paramIndex = 0;

    if (role) {
      whereConditions.push(`role = ${db.getPlaceholder(paramIndex++)}`);
      params.push(role);
    }

    if (search) {
      whereConditions.push(`(username LIKE ${db.getPlaceholder(paramIndex++)} OR email LIKE ${db.getPlaceholder(paramIndex++)} OR first_name LIKE ${db.getPlaceholder(paramIndex++)} OR last_name LIKE ${db.getPlaceholder(paramIndex++)})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = db.adaptQuery(`
      SELECT COUNT(*) as total 
      FROM users 
      ${whereClause}
    `);
    
    const countResult = await db.query(countQuery, params);
    const total = countResult[0].total || countResult[0].count;

    // Get users (exclude password)
    const usersQuery = db.adaptQuery(`
      SELECT 
        id, 
        username, 
        email, 
        first_name, 
        last_name, 
        role, 
        created_at, 
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${db.getPlaceholder(paramIndex++)} OFFSET ${db.getPlaceholder(paramIndex++)}
    `);

    params.push(limit, offset);
    const users = await db.query(usersQuery, params);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
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
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// GET /api/users/me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// GET /api/users/:id - Get a single user (admin or own profile)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (!userId || userId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check permissions: admin can see any user, users can only see their own profile
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own profile'
      });
    }

    const { sql, params } = db.buildQuery(`
      SELECT 
        id, 
        username, 
        email, 
        first_name, 
        last_name, 
        role, 
        created_at, 
        updated_at
      FROM users 
      WHERE id = ?
    `, [userId]);

    const users = await db.query(sql, params);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// PUT /api/users/:id - Update a user (admin or own profile)
router.put('/:id', authenticateToken, updateUserValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = parseInt(req.params.id);
    
    if (!userId || userId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check permissions: admin can update any user, users can only update their own profile
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own profile'
      });
    }

    // Non-admin users cannot change their role
    if (req.user.role !== 'admin' && req.body.hasOwnProperty('role')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot change your own role'
      });
    }

    // Check if user exists
    const { sql: checkSql, params: checkParams } = db.buildQuery(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );
    
    const existingUsers = await db.query(checkSql, checkParams);
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 0;

    const allowedFields = ['username', 'email', 'first_name', 'last_name', 'role'];
    
    for (const field of allowedFields) {
      if (req.body.hasOwnProperty(field)) {
        // Check for unique constraints
        if (field === 'username' || field === 'email') {
          const { sql: uniqueSql, params: uniqueParams } = db.buildQuery(
            `SELECT id FROM users WHERE ${field} = ? AND id != ?`,
            [req.body[field], userId]
          );
          
          const existing = await db.query(uniqueSql, uniqueParams);
          if (existing.length > 0) {
            return res.status(409).json({
              success: false,
              message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            });
          }
        }

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

    // Add updated_at field
    updateFields.push(`updated_at = ${db.dbType === 'mysql' ? 'NOW()' : 'CURRENT_TIMESTAMP'}`);
    updateParams.push(userId);

    const updateQuery = db.adaptQuery(`
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = ${db.getPlaceholder(paramIndex)}
    `);

    await db.query(updateQuery, updateParams);

    // Fetch updated user
    const { sql: fetchSql, params: fetchParams } = db.buildQuery(`
      SELECT 
        id, 
        username, 
        email, 
        first_name, 
        last_name, 
        role, 
        created_at, 
        updated_at
      FROM users 
      WHERE id = ?
    `, [userId]);

    const users = await db.query(fetchSql, fetchParams);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: users[0]
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// POST /api/users/:id/change-password - Change user password (admin or own profile)
router.post('/:id/change-password', authenticateToken, changePasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = parseInt(req.params.id);
    
    if (!userId || userId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check permissions: admin can change any password, users can only change their own
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only change your own password'
      });
    }

    const { current_password, new_password } = req.body;

    // Get current password hash
    const { sql: passwordSql, params: passwordParams } = db.buildQuery(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    const users = await db.query(passwordSql, passwordParams);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password (except for admin changing other user's password)
    if (req.user.role !== 'admin' || req.user.id === userId) {
      const isValidPassword = await bcrypt.compare(current_password, users[0].password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    const { sql: updateSql, params: updateParams } = db.buildQuery(
      `UPDATE users SET password = ?, updated_at = ${db.dbType === 'mysql' ? 'NOW()' : 'CURRENT_TIMESTAMP'} WHERE id = ?`,
      [hashedPassword, userId]
    );

    await db.query(updateSql, updateParams);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// DELETE /api/users/:id - Delete a user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (!userId || userId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const { sql: checkSql, params: checkParams } = db.buildQuery(
      'SELECT id, username, email FROM users WHERE id = ?',
      [userId]
    );
    
    const existingUsers = await db.query(checkSql, checkParams);
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    const { sql, params } = db.buildQuery(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    await db.query(sql, params);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deleted_user: existingUsers[0]
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

module.exports = router;
