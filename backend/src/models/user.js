const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('superadmin','admin','manager','engineer'), allowNull: false, defaultValue: 'engineer' },
    status: { type: DataTypes.ENUM('active','blocked'), allowNull: false, defaultValue: 'active' },
    lastCheckIn: { type: DataTypes.DATE, allowNull: true },
    lastCheckOut: { type: DataTypes.DATE, allowNull: true },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true, comment: 'Last login timestamp' },
    activeTime: { type: DataTypes.INTEGER, defaultValue: 0 },
    isCheckedIn: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Daily tracking fields
    dailyFirstCheckIn: { type: DataTypes.DATE, allowNull: true, comment: 'First check-in time of the current day' },
    dailyLastCheckOut: { type: DataTypes.DATE, allowNull: true, comment: 'Last check-out time of the current day' },
    dailyTotalWorkTime: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Total accumulated work time for current day in minutes' }
  }, {
    tableName: 'users',
    timestamps: true,
    defaultScope: { attributes: { exclude: ['passwordHash'] } },
    scopes: {
      withPassword: { attributes: {} }
    }
  });

  User.prototype.verifyPassword = async function(password){
    return await bcrypt.compare(password, this.passwordHash);
  }

  User.beforeCreate(async (user) => {
    if(user.passwordHash){
      user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
    }
  });

  User.beforeUpdate(async (user) => {
    if(user.changed('passwordHash')){
      user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
    }
  });

  return User;
};
