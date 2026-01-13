const { DataTypes } = require('sequelize');

/**
 * AuditLog Model - Tracks all admin/system actions
 */
module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'User who performed the action'
    },
    userName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Cached user name for history'
    },
    userRole: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'User role at time of action'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Action type: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.'
    },
    resource: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Resource affected: user, complaint, customer, settings, etc.'
    },
    resourceId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'ID of the affected resource'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Human readable description'
    },
    previousValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON of previous state'
    },
    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON of new state'
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional JSON metadata'
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false, // Audit logs should not be updated
    indexes: [
      { fields: ['userId'] },
      { fields: ['action'] },
      { fields: ['resource'] },
      { fields: ['createdAt'] }
    ]
  });

  return AuditLog;
};
