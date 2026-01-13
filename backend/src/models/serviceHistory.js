const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ServiceHistory = sequelize.define('ServiceHistory', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    complaintId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    workPerformed: { type: DataTypes.TEXT, allowNull: true },
    solutionNotes: { type: DataTypes.TEXT, allowNull: true },
    sparesUsed: { type: DataTypes.JSON, allowNull: true }, // array of spares
    engineerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'service_histories',
    timestamps: true
  });

  ServiceHistory.associate = (models) => {
    ServiceHistory.belongsTo(models.Complaint, { foreignKey: 'complaintId' });
    ServiceHistory.belongsTo(models.User, { foreignKey: 'engineerId' });
  };

  return ServiceHistory;
};