/**
 * CONFIGURABLE RATE LIMIT SETTINGS
 * Superadmins can modify these via API endpoints
 */

// Default rate limit configuration (15-second window, 100 requests max)
let rateLimitConfig = {
  windowMs: 15 * 1000, // 15 seconds
  maxRequests: 100,
  
  // Tier-specific configs
  tiers: {
    strict: {
      windowMs: 15 * 1000,
      max: 20,
      description: 'Strict: 20 requests per 15 seconds (auth, admin endpoints)'
    },
    standard: {
      windowMs: 15 * 1000,
      max: 100,
      description: 'Standard: 100 requests per 15 seconds (normal endpoints)'
    },
    loose: {
      windowMs: 15 * 1000,
      max: 300,
      description: 'Loose: 300 requests per 15 seconds (read-only endpoints)'
    },
    login: {
      windowMs: 15 * 1000,
      max: 5,
      description: 'Login: 5 attempts per 15 seconds'
    }
  },
  
  // Superadmin bypass enabled
  bypassSuperadmin: true
};

/**
 * Get current rate limit configuration
 */
function getConfig() {
  return JSON.parse(JSON.stringify(rateLimitConfig)); // Return deep copy
}

/**
 * Update global rate limit window (applies to all tiers)
 * @param {number} windowMs - Time window in milliseconds
 */
function setWindowMs(windowMs) {
  if (typeof windowMs !== 'number' || windowMs < 1000) {
    throw new Error('Window must be a number >= 1000ms (1 second minimum)');
  }
  rateLimitConfig.windowMs = windowMs;
  // Update all tiers
  Object.keys(rateLimitConfig.tiers).forEach(tier => {
    rateLimitConfig.tiers[tier].windowMs = windowMs;
  });
  console.log(`[RateLimit] Window updated to ${windowMs}ms (${(windowMs/1000).toFixed(1)}s)`);
}

/**
 * Update max requests for a specific tier
 * @param {string} tier - 'strict', 'standard', 'loose', or 'login'
 * @param {number} max - Maximum requests per window
 */
function setTierMax(tier, max) {
  if (!rateLimitConfig.tiers[tier]) {
    throw new Error(`Invalid tier: ${tier}. Must be: strict, standard, loose, login`);
  }
  if (typeof max !== 'number' || max < 1) {
    throw new Error('Max must be a positive number');
  }
  rateLimitConfig.tiers[tier].max = max;
  console.log(`[RateLimit] ${tier} tier updated to ${max} requests`);
}

/**
 * Update all tier configurations at once
 * @param {object} newConfig - { strict: 20, standard: 100, loose: 300, login: 5 }
 */
function setAllTiers(newConfig) {
  const validTiers = ['strict', 'standard', 'loose', 'login'];
  for (const tier of validTiers) {
    if (newConfig[tier] !== undefined) {
      setTierMax(tier, newConfig[tier]);
    }
  }
}

/**
 * Toggle superadmin bypass
 */
function setBypassSuperadmin(enabled) {
  rateLimitConfig.bypassSuperadmin = !!enabled;
  console.log(`[RateLimit] Superadmin bypass: ${enabled ? 'ENABLED' : 'DISABLED'}`);
}

/**
 * Reset to defaults
 */
function resetDefaults() {
  rateLimitConfig = {
    windowMs: 15 * 1000,
    maxRequests: 100,
    tiers: {
      strict: {
        windowMs: 15 * 1000,
        max: 20,
        description: 'Strict: 20 requests per 15 seconds (auth, admin endpoints)'
      },
      standard: {
        windowMs: 15 * 1000,
        max: 100,
        description: 'Standard: 100 requests per 15 seconds (normal endpoints)'
      },
      loose: {
        windowMs: 15 * 1000,
        max: 300,
        description: 'Loose: 300 requests per 15 seconds (read-only endpoints)'
      },
      login: {
        windowMs: 15 * 1000,
        max: 5,
        description: 'Login: 5 attempts per 15 seconds'
      }
    },
    bypassSuperadmin: true
  };
  console.log('[RateLimit] Reset to defaults');
}

module.exports = {
  getConfig,
  setWindowMs,
  setTierMax,
  setAllTiers,
  setBypassSuperadmin,
  resetDefaults
};
