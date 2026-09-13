/**
 * Request Logger Middleware
 * Logs incoming HTTP requests
 */

const logger = require('../utils/logger');

/**
 * Middleware to log all HTTP requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
    const reset = '\x1b[0m';

    logger.info(
      `${req.method} ${req.originalUrl} - ${statusColor}${status}${reset} - ${duration}ms`
    );
  });

  next();
};

module.exports = { requestLogger };
