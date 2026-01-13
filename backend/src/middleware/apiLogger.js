const { ApiLog, SystemConfig } = require('../models');

/**
 * API Logger Middleware
 * Logs all API requests for monitoring and debugging
 */
const apiLogger = async (req, res, next) => {
  // Skip logging for certain paths
  const skipPaths = ['/api/system/health', '/api/system/api-logs', '/api/system/api-metrics'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture response
  res.end = async function(chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    try {
      // Check if logging is enabled (default to true)
      const config = await SystemConfig.findOne();
      if (config && config.apiLoggingEnabled === false) {
        return;
      }

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Determine client IP via trusted headers
      const { getClientIp } = require('../utils/network');
      const ip = getClientIp(req);

      // Log the request
      await ApiLog.create({
        method: req.method,
        endpoint: req.originalUrl || req.url,
        statusCode: res.statusCode,
        userId: req.currentUser?.id || null,
        requestBody: req.method !== 'GET' ? sanitizeBody(req.body) : null,
        responseTime,
        ipAddress: ip,
        userAgent: req.get('User-Agent'),
        errorMessage: res.statusCode >= 400 ? getErrorMessage(chunk) : null
      });
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('API logging error:', error.message);
    }
  };

  next();
};

// Sanitize request body (remove sensitive data)
function sanitizeBody(body) {
  if (!body) return null;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'newPassword', 'confirmPassword', 'token', 'secret'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Limit body size
  const bodyStr = JSON.stringify(sanitized);
  if (bodyStr.length > 2000) {
    return '[BODY TOO LARGE]';
  }

  return bodyStr;
}

// Extract error message from response
function getErrorMessage(chunk) {
  try {
    if (chunk) {
      const body = chunk.toString();
      const parsed = JSON.parse(body);
      return parsed.message || parsed.error || null;
    }
  } catch (e) {
    // Not JSON or parsing failed
  }
  return null;
}

module.exports = apiLogger;
