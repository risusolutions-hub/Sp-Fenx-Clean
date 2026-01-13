const { AuditLog, ApiLog, SystemConfig, User, LoginSession, Settings, sequelize } = require('../models');
const { Op } = require('sequelize');
const os = require('os');

/**
 * System Controller - Handles system admin features
 * Only superadmin can access these endpoints
 */

// ============ AUDIT LOGS ============

// Get audit logs with filtering
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resource, userId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    let count = 0;
    let rows = [];
    
    try {
      const result = await AuditLog.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      count = result.count;
      rows = result.rows;
    } catch (e) {
      // Table might not exist yet
      console.log('AuditLog table not ready:', e.message);
    }

    res.json({
      success: true,
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', logs: [], pagination: {} });
  }
};

// Export audit logs as CSV
exports.exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    let logs = [];
    try {
      logs = await AuditLog.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 10000
      });
    } catch (e) {
      console.log('AuditLog table not ready for export:', e.message);
    }

    // Convert to CSV
    const headers = ['Date', 'User', 'Role', 'Action', 'Resource', 'Resource ID', 'Description', 'IP Address'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = [
        log.createdAt?.toISOString() || '',
        log.userName || '',
        log.userRole || '',
        log.action || '',
        log.resource || '',
        log.resourceId || '',
        `"${(log.description || '').replace(/"/g, '""')}"`,
        log.ipAddress || ''
      ];
      csvRows.push(row.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvRows.join('\n'));
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ success: false, message: 'Failed to export audit logs' });
  }
};

// ============ API LOGS ============

// Get API logs
exports.getApiLogs = async (req, res) => {
  try {
    const { page = 1, limit = 100, endpoint, statusCode, method } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (endpoint) where.endpoint = { [Op.like]: `%${endpoint}%` };
    if (statusCode) where.statusCode = statusCode;
    if (method) where.method = method;

    let count = 0;
    let rows = [];
    
    try {
      const result = await ApiLog.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      count = result.count;
      rows = result.rows;
    } catch (e) {
      // Table might not exist yet
      console.log('ApiLog table not ready:', e.message);
    }

    res.json({
      success: true,
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching API logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch API logs', logs: [] });
  }
};

// Get API metrics
exports.getApiMetrics = async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let totalRequests = 0;
    let avgResponseTime = 0;
    let errorCount = 0;
    let topEndpoints = [];
    let statusCodes = [];

    try {
      // Total requests in last 24h
      totalRequests = await ApiLog.count({
        where: { createdAt: { [Op.gte]: last24h } }
      });

      // Average response time
      const avgResult = await ApiLog.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('responseTime')), 'avg']],
        where: { createdAt: { [Op.gte]: last24h } }
      });
      avgResponseTime = Math.round(avgResult?.dataValues?.avg || 0);

      // Error count (status >= 400)
      errorCount = await ApiLog.count({
        where: {
          createdAt: { [Op.gte]: last24h },
          statusCode: { [Op.gte]: 400 }
        }
      });

      // Requests by endpoint (top 10)
      topEndpoints = await ApiLog.findAll({
        attributes: [
          'endpoint',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: last24h } },
        group: ['endpoint'],
        order: [[sequelize.literal('count'), 'DESC']],
        limit: 10
      });

      // Requests by status code
      statusCodes = await ApiLog.findAll({
        attributes: [
          'statusCode',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: last24h } },
        group: ['statusCode'],
        order: [['statusCode', 'ASC']]
      });
    } catch (e) {
      // Table might not exist yet
      console.log('ApiLog table not ready for metrics:', e.message);
    }

    res.json({
      success: true,
      metrics: {
        totalRequests,
        avgResponseTime,
        errorCount,
        errorRate: totalRequests > 0 ? ((errorCount / totalRequests) * 100).toFixed(2) : 0,
        topEndpoints,
        statusCodes
      }
    });
  } catch (error) {
    console.error('Error fetching API metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch API metrics', metrics: {} });
  }
};

// ============ SYSTEM CONFIG ============

// Get system config
exports.getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    
    if (!config) {
      config = await SystemConfig.create({});
    }

    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch system config' });
  }
};

// Update system config
exports.updateSystemConfig = async (req, res) => {
  try {
    if (req.currentUser?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }

    const allowedFields = [
      'maintenanceMode', 'maintenanceMessage', 'maintenanceEndTime',
      'companyName', 'companyLogo', 'footerText',
      'dataRetentionDays', 'auditLogRetentionDays', 'apiLogRetentionDays',
      'debugMode', 'apiLoggingEnabled', 'verboseErrors',
      'autoBackupEnabled', 'backupFrequency', 'backupRetentionCount'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await config.update(updates);

    // Log the config change
    await createAuditLog(req, 'UPDATE', 'system_config', config.id, 'Updated system configuration');

    res.json({ success: true, config, message: 'Configuration updated' });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({ success: false, message: 'Failed to update system config' });
  }
};

// ============ USER SESSIONS ============

// Get active sessions (users who are logged in)
exports.getActiveSessions = async (req, res) => {
  try {
    // Return login session records (active or recently seen in last 24 hours) with user info
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sessions = await LoginSession.findAll({
      where: {
        [Op.or]: [
          { isActive: true },
          { lastSeenAt: { [Op.gte]: cutoff } }
        ]
      },
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'role', 'lastLoginAt', 'status'] }
      ],
      order: [['lastSeenAt', 'DESC']]
    });

    // Determine whether to show full device info (feature toggle)
    let showDeviceInfo = true;
    try {
      const setting = await Settings.findOne({ where: { key: 'feature_show_session_device_info' } });
      if (setting) showDeviceInfo = setting.value === 'true';
    } catch (e) {
      // ignore and default to true
    }

    // Group sessions by user
    const groupedByUser = {};
    sessions.forEach(s => {
      if (s.User) {
        if (!groupedByUser[s.User.id]) {
          groupedByUser[s.User.id] = {
            userId: s.User.id,
            name: s.User.name,
            email: s.User.email,
            role: s.User.role,
            status: s.User.status,
            lastLoginAt: s.User.lastLoginAt,
            sessionCount: 0,
            sessions: []
          };
        }
        
        groupedByUser[s.User.id].sessions.push({
          id: s.id,
          sessionId: s.sessionId,
          ipAddress: showDeviceInfo ? s.ipAddress : '***',
          ipIsPrivate: showDeviceInfo ? s.ipIsPrivate : null,
          ipSource: showDeviceInfo ? s.ipSource : null,
          device: showDeviceInfo ? s.device : 'Unknown',
          browser: showDeviceInfo ? s.browser : 'Unknown',
          os: showDeviceInfo ? s.os : 'Unknown',
          userAgent: showDeviceInfo ? s.userAgent : null,
          isActive: s.isActive,
          lastSeenAt: s.lastSeenAt,
          createdAt: s.createdAt
        });
        
        groupedByUser[s.User.id].sessionCount++;
      }
    });

    // Convert to array and sort by last seen
    const userSessions = Object.values(groupedByUser)
      .sort((a, b) => new Date(b.sessions[0].lastSeenAt || 0) - new Date(a.sessions[0].lastSeenAt || 0));

    res.json({ success: true, sessions: userSessions, total: userSessions.length });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active sessions' });
  }
};

// Delete a specific session by sessionId (not all user sessions)
exports.deleteSpecificSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find and update the session
    const session = await LoginSession.findOne({ where: { sessionId } });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Mark as inactive
    await session.update({ isActive: false, lastSeenAt: new Date() });

    // Also try to destroy from session store
    const sessionStore = req.sessionStore;
    if (sessionStore && sessionStore.destroy) {
      sessionStore.destroy(sessionId, (err) => {
        if (err) console.error('Failed to destroy session from store:', err);
      });
    }

    await createAuditLog(req, 'DELETE_SESSION', 'login_session', sessionId, `Deleted session ${sessionId} for user ID ${session.userId}`);

    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, message: 'Failed to delete session' });
  }
};

// Terminate user session (force logout)
exports.terminateSession = async (req, res) => {
  try {
    if (req.currentUser?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { userId } = req.params;
    
    // Delete all sessions for this user from session store if store supports listing
    const sessionStore = req.sessionStore;
    if (sessionStore && sessionStore.all && sessionStore.destroy) {
      try {
        sessionStore.all((err, sessions) => {
          if (err) {
            console.error('Error listing sessions from store:', err);
            return;
          }

          for (const sid in sessions) {
            try {
              const sess = sessions[sid];
              const sessUserId = sess?.userId || sess?.userId === 0 ? sess.userId : sess?.userId;
              // connect-session-sequelize stores session data under .data values in some versions
              const parsedUserId = sess?.userId || (sess?.user && sess.user.userId) || (sess?.data && sess.data.userId) || null;
              if (parsedUserId && String(parsedUserId) === String(userId)) {
                sessionStore.destroy(sid, (e)=>{
                  if(e) console.error('Failed to destroy session', sid, e);
                });
              }
            } catch (e) {
              // ignore per-session errors
            }
          }
        });
      } catch (e) {
        console.error('Failed to iterate session store:', e.message);
      }
    }

    // Mark login sessions in DB as inactive for the user
    try {
      await LoginSession.update({ isActive: false, lastSeenAt: new Date() }, { where: { userId } });
    } catch (e) {
      console.error('Failed to update LoginSession records:', e.message);
    }

    await createAuditLog(req, 'TERMINATE_SESSION', 'user', userId, `Terminated session for user ID ${userId}`);

    res.json({ success: true, message: 'Session terminated' });
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({ success: false, message: 'Failed to terminate session' });
  }
};

// ============ HEALTH CHECK ============

// Get system health status
exports.getHealthStatus = async (req, res) => {
  try {
    const startTime = Date.now();

    // Database check
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await sequelize.authenticate();
      dbResponseTime = Date.now() - dbStart;
    } catch (e) {
      dbStatus = 'unhealthy';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    // CPU load
    const cpuLoad = os.loadavg();

    // Uptime
    const uptime = process.uptime();

    // Recent errors count (with try-catch in case table doesn't exist)
    let recentErrors = 0;
    try {
      recentErrors = await ApiLog.count({
        where: {
          statusCode: { [Op.gte]: 500 },
          createdAt: { [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) }
        }
      });
    } catch (e) {
      // Table might not exist yet
    }

    // Active users count (with fallback)
    let activeUsers = 0;
    try {
      activeUsers = await User.count({
        where: {
          [Op.or]: [
            { lastLoginAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            { updatedAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
          ]
        }
      });
    } catch (e) {
      // Fallback to total users
      activeUsers = await User.count();
    }

    // Get config for maintenance mode
    let config = null;
    try {
      config = await SystemConfig.findOne();
    } catch (e) {
      // Table might not exist
    }

    res.json({
      success: true,
      health: {
        status: dbStatus === 'healthy' && recentErrors < 100 ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        uptimeFormatted: formatUptime(uptime),
        maintenanceMode: config?.maintenanceMode || false,
        database: {
          status: dbStatus,
          responseTime: dbResponseTime
        },
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          system: {
            total: Math.round(totalMem / 1024 / 1024 / 1024),
            free: Math.round(freeMem / 1024 / 1024 / 1024),
            usedPercent: Math.round((1 - freeMem / totalMem) * 100)
          }
        },
        cpu: {
          load1m: cpuLoad[0]?.toFixed(2),
          load5m: cpuLoad[1]?.toFixed(2),
          load15m: cpuLoad[2]?.toFixed(2),
          cores: os.cpus().length
        },
        errors: {
          lastHour: recentErrors
        },
        users: {
          active24h: activeUsers
        },
        responseTime: Date.now() - startTime
      }
    });
  } catch (error) {
    console.error('Error fetching health status:', error);
    res.status(500).json({ 
      success: false, 
      health: { status: 'unhealthy', error: error.message }
    });
  }
};

// ============ HELPER FUNCTIONS ============

// Create audit log entry
async function createAuditLog(req, action, resource, resourceId, description, previousValue = null, newValue = null) {
  try {
    await AuditLog.create({
      userId: req.currentUser?.id,
      userName: req.currentUser?.name,
      userRole: req.currentUser?.role,
      action,
      resource,
      resourceId: String(resourceId),
      description,
      previousValue: previousValue ? JSON.stringify(previousValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent')
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// Format uptime to human readable
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || '< 1m';
}

// Export audit log helper for use in other controllers
exports.createAuditLog = createAuditLog;
