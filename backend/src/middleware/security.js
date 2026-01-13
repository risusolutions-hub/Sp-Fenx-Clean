/**
 * COMPREHENSIVE SECURITY MIDDLEWARE
 * - API Key validation
 * - Request signature verification
 * - CSRF Token validation
 * - Session Device Fingerprinting
 * - Cross-tab/Cross-device Detection
 * - Advanced rate limiting per endpoint
 * - Sanitization
 * - Authentication & Authorization
 */

const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const os = require('os');
const rateLimitConfig = require('../config/rateLimitConfig');

// ============ API KEY MANAGEMENT ============
const VALID_API_KEYS = new Map();
const API_KEY_PREFIX = 'sk_';

// Initialize with default keys (should be in environment)
function initializeAPIKeys() {
  const keys = (process.env.API_KEYS || '').split(',').filter(Boolean);
  keys.forEach((key, idx) => {
    const hashedKey = hashAPIKey(key);
    VALID_API_KEYS.set(hashedKey, {
      key: key,
      created: new Date(),
      lastUsed: null,
      requestCount: 0,
      rateLimit: process.env[`API_KEY_${idx}_RATE_LIMIT`] || 100
    });
  });
}

function generateAPIKey() {
  return API_KEY_PREFIX + crypto.randomBytes(32).toString('hex');
}

function hashAPIKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function validateAPIKey(key) {
  if (!key || typeof key !== 'string') return null;
  const hashedKey = hashAPIKey(key);
  return VALID_API_KEYS.get(hashedKey);
}

// ============ REQUEST SIGNATURE VERIFICATION ============
function generateRequestSignature(method, path, timestamp, body = '', secret) {
  const message = `${method}${path}${timestamp}${body}`;
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}

function verifyRequestSignature(req, secret) {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

  if (!signature || !timestamp) return false;

  // Check timestamp is within 5 minutes
  const requestTime = parseInt(timestamp);
  const currentTime = Date.now();
  if (Math.abs(currentTime - requestTime) > 5 * 60 * 1000) return false;

  const expectedSignature = generateRequestSignature(
    req.method,
    req.path,
    timestamp,
    body,
    secret
  );

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

// ============ RATE LIMITERS ============

// Create dynamic rate limiters based on config
function createStrictLimiter() {
  const config = rateLimitConfig.getConfig();
  return rateLimit({
    windowMs: config.tiers.strict.windowMs,
    max: config.tiers.strict.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => rateLimitConfig.getConfig().bypassSuperadmin && req.user?.role === 'superadmin',
    message: `Too many requests from this IP, please try again in ${config.tiers.strict.windowMs/1000} seconds.`,
    keyGenerator: (req) => req.ip || req.connection.remoteAddress
  });
}

function createStandardLimiter() {
  const config = rateLimitConfig.getConfig();
  return rateLimit({
    windowMs: config.tiers.standard.windowMs,
    max: config.tiers.standard.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => rateLimitConfig.getConfig().bypassSuperadmin && req.user?.role === 'superadmin',
    keyGenerator: (req) => req.ip || req.connection.remoteAddress
  });
}

function createLooseLimiter() {
  const config = rateLimitConfig.getConfig();
  return rateLimit({
    windowMs: config.tiers.loose.windowMs,
    max: config.tiers.loose.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => rateLimitConfig.getConfig().bypassSuperadmin && req.user?.role === 'superadmin',
    keyGenerator: (req) => req.ip || req.connection.remoteAddress
  });
}

function createLoginLimiter() {
  const config = rateLimitConfig.getConfig();
  return rateLimit({
    windowMs: config.tiers.login.windowMs,
    max: config.tiers.login.max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.body?.email || req.ip || req.connection.remoteAddress
  });
}

// Initialize with config values
let strictLimiter = createStrictLimiter();
let standardLimiter = createStandardLimiter();
let looseLimiter = createLooseLimiter();
let loginLimiter = createLoginLimiter();

// Function to refresh limiters when config changes
function refreshLimiters() {
  strictLimiter = createStrictLimiter();
  standardLimiter = createStandardLimiter();
  looseLimiter = createLooseLimiter();
  loginLimiter = createLoginLimiter();
  console.log('[RateLimit] Limiters refreshed');
}

// API endpoint rate limiter (per API key)
const apiKeyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip
});

// ============ AUTHENTICATION & AUTHORIZATION ============

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

function requireSuperAdmin(req, res, next) {
  if (req.session?.userRole !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin only' });
  }
  next();
}

// ============ INPUT VALIDATION & SANITIZATION ============

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
}

function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// ============ SECURITY HEADERS MIDDLEWARE ============

function securityHeaders(req, res, next) {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
}

// ============ REQUEST LOGGING & MONITORING ============

const requestLog = [];
const MAX_LOG_ENTRIES = 1000;

function logSecurityEvent(req, eventType, details = {}) {
  const event = {
    timestamp: new Date(),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.session?.userId,
    userRole: req.session?.userRole,
    method: req.method,
    path: req.path,
    eventType,
    details
  };

  requestLog.push(event);
  
  // Keep log size manageable
  if (requestLog.length > MAX_LOG_ENTRIES) {
    requestLog.shift();
  }

  console.log(`[SECURITY] ${eventType}:`, event);
}

function getSecurityLogs(filter = {}) {
  return requestLog.filter(log => {
    if (filter.eventType && log.eventType !== filter.eventType) return false;
    if (filter.userId && log.userId !== filter.userId) return false;
    if (filter.startTime && log.timestamp < filter.startTime) return false;
    if (filter.endTime && log.timestamp > filter.endTime) return false;
    return true;
  });
}

// ============ CSRF TOKEN MANAGEMENT ============
const csrfTokens = new Map(); // userId -> { token, createdAt, expiresAt }
const SESSION_TOKENS = new Map(); // sessionId -> { userId, userAgent, ipAddress, createdAt, expiresAt, deviceFingerprint }

function generateCSRFToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 86400000; // 24 hours (matches session lifetime)
  csrfTokens.set(userId, {
    token,
    createdAt: Date.now(),
    expiresAt
  });
  return token;
}

function validateCSRFToken(userId, token) {
  const stored = csrfTokens.get(userId);
  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    csrfTokens.delete(userId);
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token));
}

// ============ SESSION FINGERPRINTING & CROSS-TAB DETECTION ============
function generateDeviceFingerprint(userAgent, ipAddress, acceptLanguage) {
  const fingerprint = `${userAgent}|${ipAddress}|${acceptLanguage}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

function createSessionRecord(sessionId, userId, req) {
  const userAgent = req.get('user-agent') || 'unknown';
  const ipAddress = req.ip || req.connection.remoteAddress;
  const acceptLanguage = req.get('accept-language') || 'unknown';
  const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress, acceptLanguage);
  
  const sessionRecord = {
    userId,
    userAgent,
    ipAddress,
    deviceFingerprint,
    createdAt: Date.now(),
    expiresAt: Date.now() + 86400000, // 24 hours
    lastActivity: Date.now(),
    requestCount: 0,
    suspiciousActivities: []
  };
  
  SESSION_TOKENS.set(sessionId, sessionRecord);
  return sessionRecord;
}

function validateSessionIntegrity(sessionId, req) {
  const session = SESSION_TOKENS.get(sessionId);
  if (!session) return { valid: false, reason: 'Session not found' };
  
  if (Date.now() > session.expiresAt) {
    SESSION_TOKENS.delete(sessionId);
    return { valid: false, reason: 'Session expired' };
  }
  
  // Check device fingerprint
  const userAgent = req.get('user-agent') || 'unknown';
  const ipAddress = req.ip || req.connection.remoteAddress;
  const acceptLanguage = req.get('accept-language') || 'unknown';
  const currentFingerprint = generateDeviceFingerprint(userAgent, ipAddress, acceptLanguage);
  
  const fingerprintMatch = session.deviceFingerprint === currentFingerprint;
  
  if (!fingerprintMatch) {
    session.suspiciousActivities.push({
      type: 'fingerprint_mismatch',
      timestamp: Date.now(),
      oldFingerprint: session.deviceFingerprint,
      newFingerprint: currentFingerprint,
      userAgent: userAgent,
      ip: ipAddress
    });
    
    // Return warning but allow (unless it's a write operation)
    return { 
      valid: true, 
      warning: 'Device fingerprint mismatch - possible cross-tab or cross-device access',
      suspicious: true 
    };
  }
  
  session.lastActivity = Date.now();
  session.requestCount++;
  return { valid: true, suspicious: false };
}

// ============ EXPORTS ============

module.exports = {
  // API Key management
  generateAPIKey,
  validateAPIKey,
  initializeAPIKeys,
  
  // CSRF Token management
  generateCSRFToken,
  validateCSRFToken,
  csrfTokens,
  
  // Session fingerprinting
  generateDeviceFingerprint,
  createSessionRecord,
  validateSessionIntegrity,
  SESSION_TOKENS,
  
  // Signature verification
  generateRequestSignature,
  verifyRequestSignature,
  
  // Rate limiters
  strictLimiter,
  standardLimiter,
  looseLimiter,
  loginLimiter,
  apiKeyLimiter,
  createStrictLimiter,
  createStandardLimiter,
  createLooseLimiter,
  createLoginLimiter,
  refreshLimiters,
  
  // Auth middleware
  requireAuth,
  requireRole,
  requireSuperAdmin,
  
  // Input sanitization
  sanitizeInput,
  sanitizeObject,
  validateEmail,
  validatePhone,
  
  // Security headers
  securityHeaders,
  
  // Logging
  logSecurityEvent,
  getSecurityLogs,
  requestLog
};
