// src/middleware/validateApiKey.js

function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  console.log('🔑 validateApiKey middleware hit');
  console.log('📨 x-api-key:', apiKey ? `${apiKey.slice(0, 10)}...` : 'NOT PROVIDED');

  if (!apiKey) {
    return res.status(401).json({
      status:  'error',
      message: 'API key is required. Provide it via the x-api-key header.'
    });
  }

  // Attach raw key to request for downstream use
  req.apiKey = apiKey;

  console.log('✅ API key present — passing to route');
  next();
}

module.exports = validateApiKey;