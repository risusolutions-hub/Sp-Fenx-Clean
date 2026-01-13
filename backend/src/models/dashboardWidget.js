module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const DashboardWidget = sequelize.define('DashboardWidget', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    layoutName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g., Default, Manager View, Engineer View'
    },
    widgets: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of {id, type, position, size, filters}'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Use this layout by default'
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
    tableName: 'DashboardWidgets',
    timestamps: true
  });

  return DashboardWidget;
};
