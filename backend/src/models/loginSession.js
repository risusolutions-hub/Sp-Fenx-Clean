const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LoginSession = sequelize.define('LoginSession', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    ipAddress: { type: DataTypes.STRING, allowNull: true },
    ipIsPrivate: { type: DataTypes.BOOLEAN, defaultValue: false },
    ipSource: { type: DataTypes.STRING, allowNull: true, comment: 'Header or connection that provided IP (xff, x-real-ip, req.ip)' },
    userAgent: { type: DataTypes.TEXT, allowNull: true },
    device: { type: DataTypes.STRING, allowNull: true },
    browser: { type: DataTypes.STRING, allowNull: true },
    os: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    lastSeenAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'login_sessions',
    timestamps: true
  });

  return LoginSession;
};