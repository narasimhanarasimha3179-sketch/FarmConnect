// FarmConnect Authentication & RBAC Middleware
const { verifyToken } = require('../config/jwt');
const db = require('../config/database');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.id) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
      code: 'INVALID_TOKEN',
    });
  }

  const stmt = db.prepare('SELECT id, name, email, phone, role, status, avatar_url FROM users WHERE id = ?');
  const user = stmt.get(decoded.id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User account no longer exists.',
      code: 'USER_NOT_FOUND',
    });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      message: 'Account has been suspended by administration.',
      code: 'ACCOUNT_SUSPENDED',
    });
  }

  req.user = user;
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to permission check.',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' lacks required permissions for this action. Required: ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
};
