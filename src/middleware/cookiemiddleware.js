// src/middleware/cookieAuthMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware factory for cookie-based role access
 * @param {Array} allowedRoles - roles allowed to access this route
 */
function cookieAuthMiddleware(allowedRoles) {
  return (req, res, next) => {

    const token = req.cookies.access_token;

    console.log('🍪 cookieAuthMiddleware hit');
    console.log('🔍 Cookie token:', token ? `${token.slice(0, 20)}...` : 'NOT PROVIDED');

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

module.exports = cookieAuthMiddleware;