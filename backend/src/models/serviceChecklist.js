module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const ServiceChecklist = sequelize.define('ServiceChecklist', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    complaintId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    checklistType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g., Electrical Inspection, Refrigeration Service'
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of {id, name, completed, notes, completedAt}'
    },
    completedByEngineerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    reviewedByManagerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Manager who reviewed for audit'
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    photoEvidenceUrls: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of photo URLs for proof of completion'
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
    tableName: 'ServiceChecklists',
    timestamps: true
  });

  return ServiceChecklist;
};
