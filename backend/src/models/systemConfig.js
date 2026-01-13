const { DataTypes } = require('sequelize');

/**
 * SystemConfig Model - Stores system-wide configuration
 */
module.exports = (sequelize) => {
  const SystemConfig = sequelize.define('SystemConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Maintenance Mode
    maintenanceMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    maintenanceMessage: {
      type: DataTypes.TEXT,
      defaultValue: 'System is under maintenance. Please try again later.'
    },
    maintenanceEndTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Branding
    companyName: {
      type: DataTypes.STRING(100),
      defaultValue: 'LaserService'
    },
    companyLogo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL to company logo'
    },
    footerText: {
      type: DataTypes.STRING(500),
      defaultValue: '© 2026 LaserService. All rights reserved.'
    },
    // Data Retention
    dataRetentionDays: {
      type: DataTypes.INTEGER,
      defaultValue: 365,
      comment: 'Auto-delete closed tickets after X days (0 = never)'
    },
    auditLogRetentionDays: {
      type: DataTypes.INTEGER,
      defaultValue: 90,
      comment: 'Keep audit logs for X days'
    },
    apiLogRetentionDays: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'Keep API logs for X days'
    },
    // Debug Settings
    debugMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    apiLoggingEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    verboseErrors: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Show detailed error messages'
    },
    // Backup Settings
    autoBackupEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    backupFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
      defaultValue: 'weekly'
    },
    backupRetentionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: 'Number of backups to keep'
    },
    lastBackupAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'system_config',
    timestamps: true
  });

  return SystemConfig;
};
