const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database
    const { sql, params } = db.buildQuery(
      'SELECT id, username, email, first_name, last_name, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    const users = await db.query(sql, params);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user info to request object
    req.user = users[0];
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource or is admin
const authorizeOwnerOrAdmin = (userIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    if (parseInt(resourceUserId) === req.user.id) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only access your own resources'
    });
  };
};

// Optional authentication - sets user if token is valid but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // No token, continue without user
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { sql, params } = db.buildQuery(
      'SELECT id, username, email, first_name, last_name, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    const users = await db.query(sql, params);
    if (users.length > 0) {
      req.user = users[0];
    }

    next();

  } catch (error) {
    // Invalid token, but we don't fail - just continue without user
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeOwnerOrAdmin,
  optionalAuth
};
