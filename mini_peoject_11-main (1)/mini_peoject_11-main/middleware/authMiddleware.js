const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  // Check authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Feature: Support local mock tokens for prototype/demo purposes
      if (token.startsWith('local_token_')) {
        // Create a mock user object to satisfy the request
        req.user = {
          _id: '60d0fe4f5311236168a109ca', // Valid ObjectId format for local/offline fallback
          name: 'Local User',
          email: 'local@example.com',
          role: 'customer'
        };
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Attach user to req object
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware check
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
// Role authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access Denied: Role (${req.user ? req.user.role : 'unknown'}) is not allowed` });
    }
    next();
  };
};

module.exports = { protect, admin, authorizeRoles };
