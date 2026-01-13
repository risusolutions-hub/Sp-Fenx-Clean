const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Complaint = sequelize.define('Complaint', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    complaintId: { type: DataTypes.STRING, allowNull: false, unique: true }, // auto-generated
    problem: { type: DataTypes.TEXT, allowNull: false }, // Main problem description
    issueCategories: { type: DataTypes.JSON, allowNull: true }, // Array of selected categories
    complaintDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    priority: { type: DataTypes.ENUM('low','medium','high','critical'), defaultValue: 'medium' },
    attachments: { type: DataTypes.JSON, allowNull: true }, // array of file objects {name, path, type, size}
    status: { type: DataTypes.ENUM('pending','assigned','in_progress','resolved','closed'), defaultValue: 'pending' },
    workStatus: { type: DataTypes.ENUM('pending','started','completed'), defaultValue: 'pending' },
    description: { type: DataTypes.TEXT, allowNull: true },
    solutionNotes: { type: DataTypes.TEXT, allowNull: true },
    sparesUsed: { type: DataTypes.JSON, allowNull: true }, // array of spares
    checkInTime: { type: DataTypes.DATE, allowNull: true },
    assignedAt: { type: DataTypes.DATE, allowNull: true },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
    closedAt: { type: DataTypes.DATE, allowNull: true },
    createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }, // user who created the ticket
    assignedTo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }, // engineer id
    customerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    machineId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  }, {
    tableName: 'complaints',
    timestamps: true
  });

  Complaint.associate = (models) => {
    Complaint.belongsTo(models.Customer, { foreignKey: 'customerId' });
    Complaint.belongsTo(models.Machine, { foreignKey: 'machineId' });
    Complaint.belongsTo(models.User, { foreignKey: 'assignedTo', as: 'engineer' });
    Complaint.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  };

  return Complaint;
};