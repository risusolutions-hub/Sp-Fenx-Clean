const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 1 * 1000,
  max: 20000,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = apiLimiter;
