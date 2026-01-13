const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Machine = sequelize.define('Machine', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    model: { type: DataTypes.STRING, allowNull: false },
    serialNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    mobileNumbers: { type: DataTypes.JSON, allowNull: true, defaultValue: [], comment: 'Array of mobile numbers associated with machine' },
    installationDate: { type: DataTypes.DATE, allowNull: true },
    warrantyAmc: { type: DataTypes.TEXT, allowNull: true },
    customerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    tableName: 'machines',
    timestamps: true
  });

  Machine.associate = (models) => {
    Machine.belongsTo(models.Customer, { foreignKey: 'customerId' });
  };

  return Machine;
};