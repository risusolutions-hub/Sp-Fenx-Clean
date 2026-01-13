module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const EngineerSkill = sequelize.define('EngineerSkill', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    engineerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    skillName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g., Electrical, Mechanical, Network, HVAC, Plumbing'
    },
    proficiencyLevel: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      defaultValue: 'intermediate'
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    verifiedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Manager who verified this skill'
    },
    verifiedAt: {
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
    tableName: 'EngineerSkills',
    timestamps: true
  });

  return EngineerSkill;
};
