const { DataTypes } = require('sequelize');

/**
 * ApiLog Model - Tracks API requests for debugging
 */
module.exports = (sequelize) => {
  const ApiLog = sequelize.define('ApiLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'GET, POST, PUT, DELETE, etc.'
    },
    endpoint: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    requestBody: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Sanitized request body'
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Response time in milliseconds'
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'api_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['endpoint'] },
      { fields: ['statusCode'] },
      { fields: ['createdAt'] }
    ]
  });

  return ApiLog;
};
