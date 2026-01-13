const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Leave = sequelize.define('Leave', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    engineerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    leaveType: {
      type: DataTypes.ENUM('sick', 'casual', 'personal', 'other'),
      allowNull: false,
      defaultValue: 'casual'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    numDays: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    approvedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    approvalNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Leaves',
    timestamps: true
  });

  return Leave;
};
