const { Sequelize } = require('sequelize');

// Try multiple paths to find mysql2 (handles Vercel bundling quirks)
let mysql2;
try {
  // First try: global/root level (set by api/server.js before requiring this)
  mysql2 = global.__mysql2 || require('mysql2');
} catch (e) {
  try {
    // Second try: relative to api folder
    mysql2 = require('../../api/node_modules/mysql2');
  } catch (e2) {
    try {
      // Third try: root node_modules
      mysql2 = require('../../../node_modules/mysql2');
    } catch (e3) {
      console.error('[Database] Could not find mysql2 module');
      throw new Error('mysql2 package not found. Please ensure it is installed.');
    }
  }
}

// Serverless-optimized database configuration
// Uses MySQL with mysql2 driver for remote DB (PlanetScale/RDS)

const useRemoteDB = process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER;

if (!useRemoteDB) {
  console.warn('[Database] WARNING: Remote DB credentials not found. Check environment variables.');
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'database',
  process.env.DB_USER || 'user',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Serverless-optimized pool settings
    // Small pool to avoid connection exhaustion in serverless
    pool: {
      max: 2,           // Max 2 connections per serverless instance
      min: 0,           // Allow pool to shrink to 0
      acquire: 30000,   // 30s to acquire connection
      idle: 10000,      // Release idle connections after 10s
      evict: 10000      // Check for idle connections every 10s
    },
    
    // Timezone configuration
    timezone: process.env.DB_TIMEZONE || '+00:00',
    
    // Disable operators aliases for security
    operatorsAliases: 0,
    
    // SSL for production (PlanetScale/RDS typically require SSL)
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    
    // Retry logic for transient failures
    retry: {
      max: 3
    }
  }
);

console.log(`[Database] Configured for ${useRemoteDB ? 'MySQL' : 'LOCAL'}`);
if (useRemoteDB) {
  console.log(`[Database] Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
  console.log(`[Database] Database: ${process.env.DB_NAME}`);
}

module.exports = sequelize;

