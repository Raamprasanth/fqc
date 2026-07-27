// ─────────────────────────────────────────────────────────────────────────────
// backend/middleware/auth.js
// JWT verification middleware — attach to any protected route
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer token in the Authorization header.
 * On success: attaches `req.user` and calls next().
 * On failure: responds with 401.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, name, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Role-based guard — usage: requireRole('admin')
 * Must be used AFTER authenticateToken.
 */
function requireRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions.' });
  };
}

module.exports = { authenticateToken, requireRole };
