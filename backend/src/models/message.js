module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    threadType: {
      type: DataTypes.ENUM('direct', 'complaint', 'team'),
      defaultValue: 'direct',
      comment: 'direct: DM between users, complaint: ticket discussion, team: team channel'
    },
    complaintId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'If threadType is complaint, reference the complaint'
    },
    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    recipientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'For direct messages only'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mentions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of user IDs mentioned with @mention'
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of file URLs/paths'
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When recipient read the message'
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
    tableName: 'Messages',
    timestamps: true
  });

  return Message;
};
