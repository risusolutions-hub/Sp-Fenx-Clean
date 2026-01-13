const { DataTypes } = require('sequelize');

/**
 * Settings Model - Stores system-wide feature toggles and configurations
 * Only super_admin can modify these settings
 */
module.exports = (sequelize) => {
  const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Setting key identifier'
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Setting value (JSON for complex values)'
  },
  type: {
    type: DataTypes.ENUM('boolean', 'string', 'number', 'json'),
    defaultValue: 'boolean',
    comment: 'Data type of the setting'
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'features',
    comment: 'Category for grouping settings'
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Display label for the setting'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of what the setting does'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this setting is active'
  }
}, {
  tableName: 'settings',
  timestamps: true
});

// Default feature settings
const defaultSettings = [
  {
    key: 'feature_skills',
    value: 'true',
    type: 'boolean',
    category: 'features',
    label: 'Skills Management',
    description: 'Enable/disable skills tracking and management for engineers'
  },
  {
    key: 'feature_certifications',
    value: 'true',
    type: 'boolean',
    category: 'features',
    label: 'Certifications',
    description: 'Enable/disable certification tracking for engineers'
  },
  {
    key: 'feature_checklists',
    value: 'true',
    type: 'boolean',
    category: 'features',
    label: 'Service Checklists',
    description: 'Enable/disable service checklists for tickets'
  },
  {
    key: 'feature_customization',
    value: 'true',
    type: 'boolean',
    category: 'features',
    label: 'UI Customization',
    description: 'Enable/disable user interface customization options'
  },
  {
    key: 'feature_chat',
    value: 'true',
    type: 'boolean',
    category: 'features',
    label: 'Chat System',
    description: 'Enable/disable the internal chat messaging system'
  },
  {
    key: 'feature_leave_management',
    value: 'true',
    type: 'boolean',
    category: 'features',
    label: 'Leave Management',
    description: 'Enable/disable leave request and approval system'
  },
  {
    key: 'feature_analytics',
    value: 'true',
    type: 'boolean',
    category: 'features',
    label: 'Analytics Dashboard',
    description: 'Enable/disable analytics and reporting features'
  },
  {
    key: 'feature_notifications',
    value: 'true',
    type: 'boolean',
    category: 'features',
    label: 'Notifications',
    description: 'Enable/disable system notifications'
  }
];

// Initialize default settings
Settings.initializeDefaults = async () => {
  try {
    for (const setting of defaultSettings) {
      await Settings.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
    }
    console.log('Default settings initialized');
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
};

  return Settings;
};
