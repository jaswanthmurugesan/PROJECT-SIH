const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware to protect routes
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Add user to request object for use in route handlers
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
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

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Optional authentication middleware (doesn't require authentication)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user && user.isActive) {
          req.user = user;
          req.userId = user._id;
        }
      } catch (error) {
        // Token is invalid or expired, but we continue without authentication
        console.log('Optional auth failed:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};

// Admin role middleware (use after authMiddleware)
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Rate limiting middleware for authentication routes
const authRateLimit = (windowMs = 15 * 60 * 1000, maxAttempts = 5) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries
    for (const [key, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(key);
      }
    }
    
    // Check current IP
    const ipData = attempts.get(ip);
    
    if (!ipData) {
      attempts.set(ip, { count: 1, firstAttempt: now });
      return next();
    }
    
    if (now - ipData.firstAttempt > windowMs) {
      // Reset window
      attempts.set(ip, { count: 1, firstAttempt: now });
      return next();
    }
    
    if (ipData.count >= maxAttempts) {
      const timeLeft = Math.ceil((windowMs - (now - ipData.firstAttempt)) / 1000 / 60);
      return res.status(429).json({
        success: false,
        message: `Too many authentication attempts. Try again in ${timeLeft} minutes.`
      });
    }
    
    ipData.count += 1;
    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminOnly,
  authRateLimit
};