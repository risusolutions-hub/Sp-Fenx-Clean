const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EngineerStatus = sequelize.define('EngineerStatus', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    engineerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM('free','busy','checked_in'), defaultValue: 'free' },
    location: { type: DataTypes.STRING, allowNull: true },
    checkInTime: { type: DataTypes.DATE, allowNull: true },
    checkOutTime: { type: DataTypes.DATE, allowNull: true },
    dailyCheckInTime: { type: DataTypes.DATE, allowNull: true },      // When engineer checks in for the day
    dailyCheckOutTime: { type: DataTypes.DATE, allowNull: true },    // When engineer checks out for the day
    totalActiveMinutesToday: { type: DataTypes.INTEGER, defaultValue: 0 }, // Total minutes worked today
    dailyActivityLog: { type: DataTypes.JSON, allowNull: true }      // Array of {checkIn, checkOut, duration} for the day
  }, {
    tableName: 'engineer_statuses',
    timestamps: true
  });

  EngineerStatus.associate = (models) => {
    EngineerStatus.belongsTo(models.User, { foreignKey: 'engineerId' });
  };

  return EngineerStatus;
};