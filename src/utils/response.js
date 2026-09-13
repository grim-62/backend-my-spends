/**
 * Response Formatter Utility
 * Standardizes API responses across the application
 */

/**
 * Success response format
 */
const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Error response format
 */
const errorResponse = (message = 'Error', error = null, statusCode = 500) => {
  return {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Pagination helper
 */
const paginatedResponse = (data, page = 1, limit = 50, total = 0) => {
  return {
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
