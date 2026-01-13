module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const DuplicateComplaint = sequelize.define('DuplicateComplaint', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    primaryComplaintId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'The main/original complaint'
    },
    duplicateComplaintId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'The duplicate complaint'
    },
    similarityScore: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0,
      comment: '0-1 score, 1 being exact match'
    },
    linkReason: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Why they were linked (manual/auto-detected)'
    },
    detectedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'User who detected/linked the duplicate'
    },
    linkedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    consolidationNotes: {
      type: DataTypes.TEXT,
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
    tableName: 'DuplicateComplaints',
    timestamps: true
  });

  return DuplicateComplaint;
};
