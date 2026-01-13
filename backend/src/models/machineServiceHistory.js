module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const MachineServiceHistory = sequelize.define('MachineServiceHistory', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    machineId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    complaintId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    serviceType: {
      type: DataTypes.ENUM('preventive', 'corrective', 'inspection', 'maintenance'),
      defaultValue: 'corrective'
    },
    issueDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resolutionDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    partsReplaced: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of {partName, quantity, cost}'
    },
    downtime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Downtime in minutes'
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    engineerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    serviceDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextScheduledMaintenance: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'MachineServiceHistories',
    timestamps: true
  });

  return MachineServiceHistory;
};
