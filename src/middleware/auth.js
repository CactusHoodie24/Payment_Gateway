// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware factory for role-based access
 * Supports:
 *  - Admin: Bearer token in Authorization header
 *  - Organization: JWT in httpOnly cookie (access_token)
 * @param {Array} allowedRoles - roles allowed to access this route
 */
function authMiddleware(allowedRoles) {
  return (req, res, next) => {

    // Try Authorization header first (admin)
    const authHeader = req.headers['authorization'];
    const headerToken = authHeader ? authHeader.split(' ')[1] : null;

    console.log('🍪 All cookies:', req.cookies);

    // Fall back to cookie (organization)
    const cookieToken = req.cookies?.access_token;

    const token = headerToken || cookieToken;

    console.log('🔐 authMiddleware hit');
    console.log('📨 Source:', headerToken ? 'Authorization header' : cookieToken ? 'Cookie' : 'NONE');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {

      // Verify token
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // Attach payload
      req.user = payload;

      // 🔍 DEBUG LOGS
      console.log('🔑 Token payload:', payload);
      console.log('👤 User role from token:', payload.role);
      console.log('✅ Allowed roles:', allowedRoles);

      // Role check
      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        console.log(`⛔ ROLE MISMATCH — token has "${payload.role}" but route requires one of: [${allowedRoles.join(', ')}]`);
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
      }

      console.log('✅ Role check passed — proceeding to controller');
      next();

    } catch (err) {
      console.log("❌ JWT ERROR:", err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = authMiddleware;