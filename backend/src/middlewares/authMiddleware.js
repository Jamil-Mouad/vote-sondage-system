const { verifyAccessToken } = require('../config/jwt');
const { error } = require('../utils/responseHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return error(res, 'Authentication token required', 401, 'AUTH_TOKEN_MISSING');
  }

  const user = verifyAccessToken(token);

  if (!user) {
    return error(res, 'Invalid or expired token', 403, 'AUTH_TOKEN_INVALID');
  }

  req.user = user; // Attach user payload to the request
  next();
};

const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'Forbidden: Insufficient permissions', 403, 'FORBIDDEN');
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
