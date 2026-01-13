const { SystemConfig, User } = require('../models');

/**
 * Maintenance Mode Middleware
 * Blocks all requests when maintenance mode is enabled (except for superadmin)
 */
const maintenanceMode = async (req, res, next) => {
  try {
    // Skip for certain paths
    const skipPaths = ['/api/auth/login', '/api/auth/me', '/api/system/health'];
    if (skipPaths.some(path => req.path === path)) {
      return next();
    }

    // Check if maintenance mode is enabled
    const config = await SystemConfig.findOne();
    
    if (config?.maintenanceMode) {
      // Check if user is superadmin - load user from session if not already loaded
      let userRole = req.currentUser?.role;
      
      if (!userRole && req.session?.userId) {
        const user = await User.findByPk(req.session.userId, {
          attributes: ['id', 'role']
        });
        userRole = user?.role;
      }

      // Allow superadmin to bypass maintenance mode
      if (userRole === 'superadmin') {
        return next();
      }

      // Check if maintenance end time has passed
      if (config.maintenanceEndTime && new Date() > new Date(config.maintenanceEndTime)) {
        // Maintenance ended, disable it
        await config.update({ maintenanceMode: false });
        return next();
      }

      return res.status(503).json({
        success: false,
        maintenance: true,
        message: config.maintenanceMessage || 'System is under maintenance. Please try again later.',
        endTime: config.maintenanceEndTime
      });
    }

    next();
  } catch (error) {
    // Don't block requests if maintenance check fails
    console.error('Maintenance check error:', error.message);
    next();
  }
};

module.exports = maintenanceMode;
