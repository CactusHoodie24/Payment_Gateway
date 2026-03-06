const jwt = require('jsonwebtoken');

/**
 * Middleware factory for role-based access
 * @param {Array} allowedRoles - roles allowed to access this route
 */
function authMiddleware(allowedRoles) {
  return (req, res, next) => {

    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

  

    try {

      // Verify token
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // Attach payload
      req.user = payload;

      // 🔍 DEBUG LOGS
   

      

  

      // Role check
      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        console.log("⛔ ROLE MISMATCH");
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
      }

      next();

    } catch (err) {
      console.log("❌ JWT ERROR:", err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = authMiddleware;