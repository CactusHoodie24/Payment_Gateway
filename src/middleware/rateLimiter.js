const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // max 10 requests per minute
  message: 'Too many requests, please try again later.',
});

module.exports = apiLimiter;