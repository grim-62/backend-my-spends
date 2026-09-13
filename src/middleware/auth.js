/**
 * Authentication Middleware
 * Verifies JWT token and extracts user information
 */

const { verifyToken, extractToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is missing',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = { authenticate };
