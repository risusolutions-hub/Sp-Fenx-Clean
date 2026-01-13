const { User } = require('../models');
const { validateCSRFToken, validateSessionIntegrity } = require('./security');

function requireLogin(req, res, next){
  if(!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

async function loadCurrentUser(req, res, next){
  if(req.session.userId){
    const user = await User.findByPk(req.session.userId, { attributes: { exclude: ['passwordHash'] } });
    if(user) {
      req.currentUser = user;
    }
  }
  next();
}

function roleAtLeast(minRole){
  const order = ['engineer','manager','admin','superadmin'];
  return (req, res, next) => {
    if(!req.currentUser) return res.status(401).json({ error: 'Not authenticated' });
    const userRoleIndex = order.indexOf(req.currentUser.role);
    const minIndex = order.indexOf(minRole);
    if(userRoleIndex < minIndex) return res.status(403).json({ error: 'Forbidden' });
    next();
  }
}

function canManageTarget(actorRole, targetRole){
  const order = ['engineer','manager','admin','superadmin'];
  return order.indexOf(actorRole) > order.indexOf(targetRole);
}

// CSRF Token validation - required for state-changing requests
// BALANCED SECURITY: Validate only for authenticated users on sensitive operations
function validateCSRF(req, res, next) {
  // OPTIONS requests (CORS preflight) don't need CSRF token
  if (req.method === 'OPTIONS') return next();
  
  // GET requests don't need CSRF token
  if (req.method === 'GET') return next();
  
  // Skip CSRF check for login and logout (these are auth endpoints)
  if (req.path === '/auth/login' || req.path === '/auth/logout') return next();
  
  // If user is authenticated, require CSRF for state-changing operations
  if (req.currentUser) {
    const csrfToken = req.headers['x-csrf-token'] || req.body?.csrfToken;
    
    if (!csrfToken) {
      return res.status(403).json({ error: 'CSRF token missing' });
    }
    
    try {
      if (!validateCSRFToken(req.currentUser.id, csrfToken)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
    } catch (err) {
      return res.status(403).json({ error: 'CSRF validation failed' });
    }
  }
  
  next();
}

// Session integrity check - detect cross-tab/cross-device access
// BALANCED SECURITY: Warn on suspicious but allow requests
function checkSessionIntegrity(req, res, next) {
  // Skip OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') return next();
  
  // Only check if user is authenticated
  if (!req.sessionID || !req.currentUser) return next();
  
  try {
    const result = validateSessionIntegrity(req.sessionID, req);
    
    // Warn about suspicious activity but don't block
    if (result.suspicious) {
      res.set('X-Security-Warning', 'Suspicious device access detected');
      console.log('[Security] Suspicious activity for user:', req.currentUser.email);
    }
    
    next();
  } catch (err) {
    // Log errors but continue
    console.log('[Security] Session check error:', err.message);
    next();
  }
}

module.exports = { requireLogin, loadCurrentUser, roleAtLeast, canManageTarget, validateCSRF, checkSessionIntegrity };
