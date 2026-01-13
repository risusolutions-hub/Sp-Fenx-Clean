const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    company: { type: DataTypes.STRING, allowNull: true },
    companyName: { type: DataTypes.STRING, allowNull: true }, // Alias for company
    serviceNo: { type: DataTypes.STRING, allowNull: true, unique: true },
    city: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    contactPerson: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true }, // Primary phone
    phones: { type: DataTypes.JSON, allowNull: true }, // Array of multiple phone numbers
    email: { type: DataTypes.STRING, allowNull: true },
    contact: { type: DataTypes.STRING, allowNull: true } // Legacy field
  }, {
    tableName: 'customers',
    timestamps: true
  });

  return Customer;
};