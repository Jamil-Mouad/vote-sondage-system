const { error } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  // Handle specific error types if needed
  if (err.name === 'UnauthorizedError') { // Example for JWT errors
    return error(res, 'Unauthorized: Invalid token', 401, 'UNAUTHORIZED');
  }

  // Default to a generic server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';
  const errorCode = err.errorCode || 'SERVER_ERROR';
  const details = process.env.NODE_ENV === 'development' ? err.stack : {};

  return error(res, message, statusCode, errorCode, details);
};

module.exports = errorHandler;
