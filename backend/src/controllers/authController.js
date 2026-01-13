const { User, LoginSession } = require('../models');
const { Op } = require('sequelize');
const { getClientIp, isPrivateIp } = require('../utils/network');
const { generateCSRFToken, createSessionRecord } = require('../middleware/security');

function parseUserAgent(ua){
  if(!ua) return { browser: null, os: null, device: null };
  const uaLower = ua.toLowerCase();
  let browser = null;
  if(uaLower.includes('edg/')) browser = 'Edge';
  else if(uaLower.includes('chrome/')) browser = 'Chrome';
  else if(uaLower.includes('firefox/')) browser = 'Firefox';
  else if(uaLower.includes('safari/') && !uaLower.includes('chrome')) browser = 'Safari';
  else if(uaLower.includes('opr/') || uaLower.includes('opera')) browser = 'Opera';

  let os = null;
  if(uaLower.includes('windows')) os = 'Windows';
  else if(uaLower.includes('mac os') || uaLower.includes('macintosh')) os = 'macOS';
  else if(uaLower.includes('android')) os = 'Android';
  else if(uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'iOS';

  let device = null;
  if(uaLower.includes('mobile') || uaLower.includes('iphone') || uaLower.includes('android')) device = 'Mobile';
  else device = 'Desktop';

  return { browser, os, device };
}

async function login(req, res){
  const { identifier, password } = req.body; // identifier can be email or name
  if(!identifier || !password) return res.status(400).json({ error: 'Missing credentials' });

  const user = await User.scope('withPassword').findOne({ where: { [Op.or]: [{ email: identifier }, { name: identifier }] } });
  if(!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Account is blocked' });
  }

  const ok = await user.verifyPassword(password);
  if(!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // Update last login time
  await user.update({ lastLoginAt: new Date() });

  // collect device info
  const ipAddress = getClientIp(req);
  const userAgent = req.get('User-Agent') || null;
  const { browser, os, device } = parseUserAgent(userAgent);
  const ipIsPrivate = isPrivateIp(ipAddress);
  const ipSource = (req.headers['x-forwarded-for'] && 'x-forwarded-for') || (req.headers['x-real-ip'] && 'x-real-ip') || 'connection';

  // Create a login session record (for superadmin/monitoring)
  try {
    await LoginSession.create({
      sessionId: req.sessionID,
      userId: user.id,
      ipAddress,
      ipIsPrivate,
      ipSource,
      userAgent,
      device,
      browser,
      os,
      lastSeenAt: new Date(),
      isActive: true
    });
  } catch (e) {
    console.error('Failed to record login session:', e.message);
  }

  req.session.userId = user.id;
  req.session.role = user.role;
  // store brief device info in session for quick access
  req.session.deviceInfo = { ipAddress, userAgent, browser, os };

  // Generate CSRF token
  const csrfToken = generateCSRFToken(user.id);
  
  // Create session record with device fingerprinting
  createSessionRecord(req.sessionID, user.id, req);

  res.json({ 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    role: user.role,
    csrfToken 
  });
}

async function logout(req, res){
  try {
    // Mark the login session as inactive if it exists
    const sessionId = req.sessionID;
    const userId = req.session?.userId;
    if(sessionId && userId){
      try {
        const ls = await LoginSession.findOne({ where: { sessionId, userId, isActive: true } });
        if(ls){
          ls.isActive = false;
          ls.lastSeenAt = new Date();
          await ls.save();
        }
      } catch(e){
        console.error('Failed to mark login session inactive:', e.message);
      }
    }

    req.session.destroy(err=>{
      if(err) return res.status(500).json({ error: 'Failed to logout' });
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
}

async function me(req, res){
  if(!req.session.userId) return res.json(null);
  const user = await User.findByPk(req.session.userId, { attributes: { exclude: ['passwordHash'] } });
  
  if (!user) return res.json(null);

  // Return CSRF token to frontend to ensure sync
  // Reuse existing valid token if possible to avoid multi-tab conflicts
  let csrfToken;
  try {
    const { csrfTokens } = require('../middleware/security');
    const stored = csrfTokens.get(user.id);
    if (stored && Date.now() < stored.expiresAt) {
      csrfToken = stored.token;
    } else {
      csrfToken = generateCSRFToken(user.id);
    }
  } catch (e) {
    csrfToken = generateCSRFToken(user.id);
  }

  res.json({
    ...user.get({ plain: true }),
    csrfToken
  });
}

module.exports = { login, logout, me };
