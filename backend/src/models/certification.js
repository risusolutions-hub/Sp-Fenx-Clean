module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Certification = sequelize.define('Certification', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    engineerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    certificationName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'e.g., HVAC Level 1, Refrigeration Certificate'
    },
    issuingBody: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Organization that issued the certification'
    },
    certificationNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    issuedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isExpired: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.expiresAt) return false;
        return new Date() > new Date(this.expiresAt);
      }
    },
    documentUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL to certificate document/image'
    },
    status: {
      type: DataTypes.ENUM('active', 'expiring_soon', 'expired'),
      defaultValue: 'active'
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
    tableName: 'Certifications',
    timestamps: true
  });

  return Certification;
};
