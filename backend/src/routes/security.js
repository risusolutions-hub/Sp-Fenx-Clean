/**
 * SECURITY MANAGEMENT ROUTES
 * - Manage rate limits
 * - View security logs
 * - Manage API keys
 * - Security settings
 */

const express = require('express');
const router = express.Router();
const security = require('../middleware/security');
const rateLimitConfig = require('../config/rateLimitConfig');

// ============ MIDDLEWARE ============

// All security endpoints require auth
router.use(security.requireAuth);

// Most endpoints require admin/superadmin
router.use((req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.session.userRole)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});

// ============ RATE LIMIT MANAGEMENT ============

const RATE_LIMIT_RULES = new Map();

// Initialize default rules
function initializeRateLimitRules() {
  RATE_LIMIT_RULES.set('auth-login', { requests: 5, windowMs: 15 * 60 * 1000, description: 'Login attempts' });
  RATE_LIMIT_RULES.set('api-general', { requests: 100, windowMs: 15 * 60 * 1000, description: 'General API calls' });
  RATE_LIMIT_RULES.set('api-strict', { requests: 20, windowMs: 15 * 60 * 1000, description: 'Sensitive operations' });
  RATE_LIMIT_RULES.set('api-loose', { requests: 300, windowMs: 15 * 60 * 1000, description: 'Read-only operations' });
}

initializeRateLimitRules();

// Get all rate limit configuration
router.get('/rate-limits/config', (req, res) => {
  const config = rateLimitConfig.getConfig();
  res.json({
    success: true,
    config,
    message: 'Current rate limit configuration (15-second window)',
    superAdminExempt: config.bypassSuperadmin
  });
});

// Update window time for all limiters (15 seconds = 15000ms)
router.put('/rate-limits/config/window', security.requireSuperAdmin, (req, res) => {
  const { windowMs } = req.body;

  try {
    rateLimitConfig.setWindowMs(windowMs);
    security.refreshLimiters();
    security.logSecurityEvent(req, 'RATE_LIMIT_WINDOW_UPDATED', { windowMs });

    res.json({
      success: true,
      message: `Rate limit window updated to ${windowMs}ms (${(windowMs/1000).toFixed(1)}s)`,
      windowMs
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update specific tier rate limit (e.g., standard = 100 requests)
router.put('/rate-limits/config/:tier', security.requireSuperAdmin, (req, res) => {
  const { tier } = req.params;
  const { max } = req.body;

  try {
    rateLimitConfig.setTierMax(tier, max);
    security.refreshLimiters();
    security.logSecurityEvent(req, 'RATE_LIMIT_TIER_UPDATED', { tier, max });

    const config = rateLimitConfig.getConfig();
    res.json({
      success: true,
      message: `${tier} tier updated to ${max} requests per ${config.tiers[tier].windowMs/1000}s`,
      tier,
      max,
      description: config.tiers[tier].description
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update all tiers at once
router.put('/rate-limits/config/all-tiers', security.requireSuperAdmin, (req, res) => {
  const { strict, standard, loose, login } = req.body;

  try {
    const updates = {};
    if (strict !== undefined) {
      rateLimitConfig.setTierMax('strict', strict);
      updates.strict = strict;
    }
    if (standard !== undefined) {
      rateLimitConfig.setTierMax('standard', standard);
      updates.standard = standard;
    }
    if (loose !== undefined) {
      rateLimitConfig.setTierMax('loose', loose);
      updates.loose = loose;
    }
    if (login !== undefined) {
      rateLimitConfig.setTierMax('login', login);
      updates.login = login;
    }

    security.refreshLimiters();
    security.logSecurityEvent(req, 'RATE_LIMITS_ALL_UPDATED', updates);

    const config = rateLimitConfig.getConfig();
    res.json({
      success: true,
      message: 'All rate limit tiers updated',
      updates,
      config: config.tiers
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle superadmin bypass
router.put('/rate-limits/config/bypass', security.requireSuperAdmin, (req, res) => {
  const { enabled } = req.body;

  rateLimitConfig.setBypassSuperadmin(enabled);
  security.logSecurityEvent(req, 'RATE_LIMIT_BYPASS_TOGGLED', { enabled });

  res.json({
    success: true,
    message: `Superadmin bypass ${enabled ? 'ENABLED' : 'DISABLED'}`,
    enabled
  });
});

// Reset rate limits to defaults
router.post('/rate-limits/reset', security.requireSuperAdmin, (req, res) => {
  rateLimitConfig.resetDefaults();
  security.refreshLimiters();
  security.logSecurityEvent(req, 'RATE_LIMITS_RESET');

  const config = rateLimitConfig.getConfig();
  res.json({
    success: true,
    message: 'Rate limits reset to defaults (15-second window, 100 requests)',
    config: config.tiers
  });
});

// Get all rate limit rules (legacy)
router.get('/rate-limits', (req, res) => {
  const rules = Array.from(RATE_LIMIT_RULES.entries()).map(([key, value]) => ({
    id: key,
    ...value
  }));

  res.json({
    success: true,
    rules,
    superAdminExempt: true,
    note: 'Superadmin users are exempt from all rate limits'
  });
});

// Update rate limit rule (legacy)
router.put('/rate-limits/:id', security.requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { requests, windowMs, description } = req.body;

  if (!RATE_LIMIT_RULES.has(id)) {
    return res.status(404).json({ error: 'Rate limit rule not found' });
  }

  if (!Number.isInteger(requests) || requests < 1) {
    return res.status(400).json({ error: 'Requests must be a positive integer' });
  }

  if (!Number.isInteger(windowMs) || windowMs < 1000) {
    return res.status(400).json({ error: 'Window must be at least 1000ms' });
  }

  RATE_LIMIT_RULES.set(id, { requests, windowMs, description });

  security.logSecurityEvent(req, 'RATE_LIMIT_UPDATED', { ruleId: id, requests, windowMs });

  res.json({
    success: true,
    message: 'Rate limit updated',
    rule: { id, requests, windowMs, description }
  });
});

// Get rate limit status
router.get('/rate-limits/:id/status', (req, res) => {
  const { id } = req.params;
  const rule = RATE_LIMIT_RULES.get(id);

  if (!rule) {
    return res.status(404).json({ error: 'Rate limit rule not found' });
  }

  res.json({
    success: true,
    rule: { id, ...rule },
    superAdminExempt: req.session.userRole === 'superadmin'
  });
});

// ============ SECURITY LOGS ============

// Get security logs
router.get('/logs', (req, res) => {
  const { eventType, startTime, endTime, limit = 100 } = req.query;

  const filters = {};
  if (eventType) filters.eventType = eventType;
  if (startTime) filters.startTime = new Date(startTime);
  if (endTime) filters.endTime = new Date(endTime);

  const logs = security.getSecurityLogs(filters).slice(-limit);

  res.json({
    success: true,
    count: logs.length,
    logs
  });
});

// Get security log summary
router.get('/logs/summary', (req, res) => {
  const allLogs = security.requestLog;
  
  const summary = {
    totalEvents: allLogs.length,
    eventTypes: {},
    eventsByHour: {},
    topIPs: {},
    suspiciousActivity: []
  };

  allLogs.forEach(log => {
    // Count by event type
    summary.eventTypes[log.eventType] = (summary.eventTypes[log.eventType] || 0) + 1;

    // Count by hour
    const hour = new Date(log.timestamp).toISOString().slice(0, 13);
    summary.eventsByHour[hour] = (summary.eventsByHour[hour] || 0) + 1;

    // Top IPs
    summary.topIPs[log.ip] = (summary.topIPs[log.ip] || 0) + 1;
  });

  // Find suspicious activity
  Object.entries(summary.topIPs).forEach(([ip, count]) => {
    if (count > 50) {
      summary.suspiciousActivity.push({
        ip,
        requestCount: count,
        severity: count > 100 ? 'high' : 'medium'
      });
    }
  });

  res.json({
    success: true,
    summary
  });
});

// Export logs (CSV format)
router.get('/logs/export', (req, res) => {
  const { format = 'json' } = req.query;
  const logs = security.requestLog;

  if (format === 'csv') {
    const csv = [
      'Timestamp,IP,UserID,Role,Method,Path,EventType',
      ...logs.map(log => 
        `"${log.timestamp}","${log.ip}","${log.userId || 'N/A'}","${log.userRole || 'N/A'}","${log.method}","${log.path}","${log.eventType}"`
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="security-logs.csv"');
    res.send(csv);
  } else {
    res.json({ success: true, logs });
  }
});

// ============ API KEY MANAGEMENT ============

const API_KEYS = new Map(); // In production, store in database

// Generate new API key
router.post('/api-keys/generate', security.requireSuperAdmin, (req, res) => {
  const key = security.generateAPIKey();
  const keyInfo = {
    key,
    created: new Date(),
    lastUsed: null,
    requestCount: 0,
    active: true
  };

  API_KEYS.set(key, keyInfo);
  security.logSecurityEvent(req, 'API_KEY_GENERATED', { keyPrefix: key.slice(0, 10) });

  res.json({
    success: true,
    message: 'API key generated. Keep it safe!',
    apiKey: key,
    createdAt: keyInfo.created
  });
});

// List API keys
router.get('/api-keys', (req, res) => {
  const keys = Array.from(API_KEYS.entries()).map(([key, info]) => ({
    key: key.slice(0, 10) + '...' + key.slice(-6),
    created: info.created,
    lastUsed: info.lastUsed,
    requestCount: info.requestCount,
    active: info.active
  }));

  res.json({
    success: true,
    keys,
    total: keys.length
  });
});

// Revoke API key
router.post('/api-keys/:key/revoke', security.requireSuperAdmin, (req, res) => {
  const { key } = req.params;
  
  const fullKey = API_KEYS.keys().find(k => k.includes(key));
  if (!fullKey) {
    return res.status(404).json({ error: 'API key not found' });
  }

  const keyInfo = API_KEYS.get(fullKey);
  keyInfo.active = false;

  security.logSecurityEvent(req, 'API_KEY_REVOKED', { keyPrefix: fullKey.slice(0, 10) });

  res.json({
    success: true,
    message: 'API key revoked'
  });
});

// ============ SECURITY CONFIGURATION ============

let securityConfig = {
  enableTwoFactor: false,
  enableAPIKeyAuth: true,
  enableRequestSignatures: false,
  enableIPWhitelist: false,
  whitelist: [],
  maintenanceMode: false,
  maintenanceModeMessage: 'System is under maintenance',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  passwordMinLength: 8,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  requirePasswordChange: false,
  passwordChangeDays: 90
};

// Get security config
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: securityConfig,
    adminOnly: true
  });
});

// Update security config
router.put('/config', security.requireSuperAdmin, (req, res) => {
  const { config } = req.body;

  if (!config || typeof config !== 'object') {
    return res.status(400).json({ error: 'Invalid config' });
  }

  // Update only allowed fields
  const allowedFields = [
    'enableTwoFactor', 'enableAPIKeyAuth', 'enableRequestSignatures',
    'enableIPWhitelist', 'maintenanceMode', 'maintenanceModeMessage',
    'sessionTimeout', 'passwordMinLength', 'passwordRequireNumbers',
    'passwordRequireSpecialChars', 'requirePasswordChange', 'passwordChangeDays'
  ];

  allowedFields.forEach(field => {
    if (config.hasOwnProperty(field)) {
      securityConfig[field] = config[field];
    }
  });

  security.logSecurityEvent(req, 'SECURITY_CONFIG_UPDATED', config);

  res.json({
    success: true,
    message: 'Security config updated',
    config: securityConfig
  });
});

// ============ IP WHITELIST ============

// Add IP to whitelist
router.post('/whitelist/add', security.requireSuperAdmin, (req, res) => {
  const { ip, description } = req.body;

  if (!ip || !ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
    return res.status(400).json({ error: 'Invalid IP address' });
  }

  securityConfig.whitelist.push({ ip, description, added: new Date() });
  security.logSecurityEvent(req, 'IP_WHITELIST_ADDED', { ip, description });

  res.json({
    success: true,
    message: 'IP added to whitelist'
  });
});

// Remove IP from whitelist
router.post('/whitelist/remove', security.requireSuperAdmin, (req, res) => {
  const { ip } = req.body;

  securityConfig.whitelist = securityConfig.whitelist.filter(w => w.ip !== ip);
  security.logSecurityEvent(req, 'IP_WHITELIST_REMOVED', { ip });

  res.json({
    success: true,
    message: 'IP removed from whitelist'
  });
});

// Get whitelist
router.get('/whitelist', (req, res) => {
  res.json({
    success: true,
    whitelist: securityConfig.whitelist,
    enabled: securityConfig.enableIPWhitelist
  });
});

// ============ SECURITY ALERTS ============

const securityAlerts = [];

function addSecurityAlert(type, severity, message, details) {
  securityAlerts.push({
    id: Date.now(),
    type,
    severity, // 'low', 'medium', 'high', 'critical'
    message,
    details,
    timestamp: new Date(),
    resolved: false
  });

  if (securityAlerts.length > 500) {
    securityAlerts.shift();
  }
}

// Get alerts
router.get('/alerts', (req, res) => {
  const { unreadOnly = false, severity } = req.query;

  let alerts = securityAlerts;

  if (unreadOnly === 'true') {
    alerts = alerts.filter(a => !a.resolved);
  }

  if (severity) {
    alerts = alerts.filter(a => a.severity === severity);
  }

  res.json({
    success: true,
    alerts: alerts.slice(-100),
    total: securityAlerts.length,
    unresolved: securityAlerts.filter(a => !a.resolved).length
  });
});

// Resolve alert
router.put('/alerts/:id/resolve', security.requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const alert = securityAlerts.find(a => a.id === parseInt(id));

  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  alert.resolved = true;
  alert.resolvedAt = new Date();
  alert.resolvedBy = req.session.userId;

  res.json({
    success: true,
    message: 'Alert resolved'
  });
});

// ============ SESSION MANAGEMENT ============

// Get all active sessions
router.get('/sessions', (req, res) => {
  const { SESSION_TOKENS } = require('../middleware/security');
  
  const sessions = Array.from(SESSION_TOKENS.entries()).map(([sessionId, session]) => ({
    sessionId: sessionId.substring(0, 8) + '...', // masked
    userId: session.userId,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent.substring(0, 50),
    createdAt: session.createdAt,
    lastActivity: session.lastActivity,
    requestCount: session.requestCount,
    suspicious: session.suspiciousActivities?.length > 0,
    suspiciousActivities: session.suspiciousActivities || []
  }));

  res.json({
    success: true,
    sessions,
    total: sessions.length
  });
});

// Terminate a session (force logout)
router.post('/sessions/:sessionId/terminate', (req, res) => {
  const { SESSION_TOKENS } = require('../middleware/security');
  const sessionId = req.params.sessionId;
  
  if (!SESSION_TOKENS.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  SESSION_TOKENS.delete(sessionId);
  
  res.json({
    success: true,
    message: 'Session terminated'
  });
});

// Get CSRF tokens status
router.get('/csrf-tokens', (req, res) => {
  const { csrfTokens } = require('../middleware/security');
  
  const tokens = Array.from(csrfTokens.entries()).map(([userId, tokenData]) => ({
    userId,
    createdAt: tokenData.createdAt,
    expiresAt: tokenData.expiresAt,
    expired: Date.now() > tokenData.expiresAt
  }));

  res.json({
    success: true,
    tokens,
    total: tokens.length
  });
});

// Invalidate a CSRF token
router.post('/csrf-tokens/:userId/invalidate', (req, res) => {
  const { csrfTokens } = require('../middleware/security');
  const userId = req.params.userId;
  
  if (!csrfTokens.has(userId)) {
    return res.status(404).json({ error: 'CSRF token not found' });
  }
  
  csrfTokens.delete(userId);
  
  res.json({
    success: true,
    message: 'CSRF token invalidated'
  });
});

// Get suspicious activities summary
router.get('/suspicious-activities', (req, res) => {
  const { SESSION_TOKENS } = require('../middleware/security');
  
  const activities = [];
  SESSION_TOKENS.forEach((session, sessionId) => {
    if (session.suspiciousActivities && session.suspiciousActivities.length > 0) {
      activities.push({
        sessionId: sessionId.substring(0, 8) + '...',
        userId: session.userId,
        ipAddress: session.ipAddress,
        activities: session.suspiciousActivities
      });
    }
  });

  res.json({
    success: true,
    activities,
    total: activities.length
  });
});

module.exports = router;
