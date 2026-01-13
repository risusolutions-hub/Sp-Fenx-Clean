/**
 * Frontend Validation Middleware
 * 
 * Ensures that API requests only come from the official frontend
 * Blocks direct API access via curl, Postman, etc.
 */

const crypto = require('crypto');

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

/**
 * Validate frontend token
 * Matches frontend's token generation algorithm
 * Frontend generates: timestamp.nonce.hash using simple JS hash
 */
function validateFrontendToken(token) {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const [timestamp, nonce, hash] = parts;
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenAge = currentTime - parseInt(timestamp);
    
    // Token must be less than 5 seconds old (to allow for network latency)
    // Frontend generates a NEW token on EVERY request, so old tokens are invalid
    if (tokenAge > 5) {
      return false;
    }
    
    // Reconstruct hash using same algorithm as frontend
    const secret = 'sk_frontend_' + (process.env.FRONTEND_SECRET || 'default');
    let reconstructedHash = 0;
    const str = secret + ':' + timestamp + ':' + nonce;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      reconstructedHash = ((reconstructedHash << 5) - reconstructedHash) + char;
      reconstructedHash = reconstructedHash & reconstructedHash; // Convert to 32bit integer
    }
    
    const expectedHash = Math.abs(reconstructedHash).toString(16);
    return hash === expectedHash;
  } catch (err) {
    console.error('[Frontend Validation] Token validation error:', err.message);
    return false;
  }
}

/**
 * Frontend validation middleware
 * Must be applied BEFORE route handlers
 * 
 * Checks:
 * 1. Origin header (must be official frontend)
 * 2. X-Frontend-Token header (must be valid)
 * 3. Rejects all direct API access
 */
function validateFrontendRequest(req, res, next) {
  // Skip validation for preflight requests
  if (req.method === 'OPTIONS') return next();
  
  // Skip validation for login (frontend can't use token before login)
  if (req.path === '/auth/login' || req.path === '/auth/logout') return next();
  
  // Check Origin header
  const origin = req.headers.origin || req.headers.referer;
  
  if (origin) {
    // Extract base URL from referer if present
    let allowedOriginFound = false;
    for (const allowedOrigin of ALLOWED_ORIGINS) {
      if (origin.startsWith(allowedOrigin)) {
        allowedOriginFound = true;
        break;
      }
    }
    
    if (!allowedOriginFound) {
      console.log('[Frontend Validation] Rejected - Invalid Origin:', origin);
      return res.status(403).json({ 
        error: 'Access denied',
        reason: 'Request must come from official frontend'
      });
    }
  }
  
  // Check frontend token
  const frontendToken = req.headers['x-frontend-token'];
  
  if (!frontendToken) {
    console.log('[Frontend Validation] Rejected - No frontend token');
    return res.status(403).json({ 
      error: 'Access denied',
      reason: 'Official frontend token required'
    });
  }
  
  if (!validateFrontendToken(frontendToken)) {
    console.log('[Frontend Validation] Rejected - Invalid frontend token');
    return res.status(403).json({ 
      error: 'Access denied',
      reason: 'Invalid or expired frontend token'
    });
  }
  
  console.log('[Frontend Validation] ✓ Request validated from official frontend');
  next();
}

module.exports = {
  validateFrontendRequest,
  validateFrontendToken
};
