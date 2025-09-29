const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'autorestock-jwt-secret-key';

const authMiddleware = (req, res, next) => {
  try {
    // For MVP, we'll support both JWT tokens and mock header authentication
    let token = null;
    let userEmail = null;

    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check for mock user email in header (for MVP testing)
    userEmail = req.headers['x-user-email'];

    if (token) {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        email: decoded.email
      };
    } else if (userEmail) {
      // Mock authentication for MVP testing
      req.user = {
        userId: 'mock-user-id',
        tenantId: 'mock-tenant-id',
        email: userEmail
      };
    } else {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token or user email provided.'
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;
