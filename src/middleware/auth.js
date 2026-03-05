const db = require('../db');

async function requireAuth(req, res, next) {

  const authHeader = req.headers.authorization;


  if (!authHeader) {
    console.log('❌ No Authorization header');
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ Wrong Authorization format');
    return res.status(401).json({ message: 'Unauthorized. Invalid token format.' });
  }

  const api_key = authHeader.split(' ')[1];

  console.log('Extracted Token:', api_key);
  console.log('Token Length:', api_key ? api_key.length : 0);

  if (!api_key || api_key === 'undefined' || api_key === 'null') {
    console.log('❌ Token is invalid (undefined or null)');
    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, title FROM users WHERE api_key = ?',
      [api_key]
    );

    console.log('DB Query Result:', rows);

    if (rows.length === 0) {
      console.log('❌ No user found with this token');
      return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
    }

    console.log('✅ Authenticated User:', rows[0]);

    req.user = rows[0];

    console.log('🔐 ---- AUTH SUCCESS ----\n');

    next();

  } catch (err) {
    console.error('🔥 Authentication Error:', err);
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
}

module.exports = { requireAuth };