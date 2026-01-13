require('dotenv').config();

const serverless = require('serverless-http');
const { sequelize } = require('./src/models');
const { app, store } = require('./src/app');

// Track initialization state for serverless cold starts
let isInitialized = false;

/**
 * Initialize database connection for serverless environment
 * Only runs once per cold start
 */
async function initializeDatabase() {
  if (isInitialized) return;
  
  try {
    console.log('[Serverless] Connecting to database...');
    await sequelize.authenticate();
    console.log('[Serverless] Database connected');
    
    // Sync session store table
    try {
      await store.sync();
      console.log('[Serverless] Session store ready');
    } catch (e) {
      console.warn('[Serverless] Session store sync warning:', e.message);
    }
    
    // Sync models (use { alter: false } in production to avoid schema changes)
    await sequelize.sync();
    console.log('[Serverless] Models synced');
    
    isInitialized = true;
  } catch (err) {
    console.error('[Serverless] Database initialization failed:', err);
    throw err;
  }
}

// Create serverless handler
const handler = serverless(app);

// Export handler for Vercel
module.exports = async (req, res) => {
  // Initialize database on cold start
  await initializeDatabase();
  
  // Handle the request
  return handler(req, res);
};

// For local development only
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 4000;
  
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => console.log(`[Dev] Server listening on ${PORT}`));
    })
    .catch((err) => {
      console.error('[Dev] Failed to start:', err);
      process.exit(1);
    });
}
