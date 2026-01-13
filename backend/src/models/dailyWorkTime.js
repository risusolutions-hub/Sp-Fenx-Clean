const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DailyWorkTime = sequelize.define('DailyWorkTime', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    engineerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    firstCheckIn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastCheckOut: {
      type: DataTypes.DATE,
      allowNull: true
    },
    totalWorkTimeMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    checkInCheckOutLog: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of {checkIn, checkOut, duration} objects'
    }
  }, {
    tableName: 'daily_work_times',
    timestamps: true
  });

  return DailyWorkTime;
};
