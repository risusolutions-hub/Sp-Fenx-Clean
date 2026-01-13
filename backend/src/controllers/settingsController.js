const { Settings } = require('../models');

/**
 * Settings Controller - Handles feature toggle management
 * Only super_admin can modify settings
 */

// Get all settings
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll({
      where: { isActive: true },
      order: [['category', 'ASC'], ['label', 'ASC']]
    });

    // Convert to key-value format for easier frontend use
    const settingsMap = {};
    settings.forEach(setting => {
      let value = setting.value;
      if (setting.type === 'boolean') {
        value = setting.value === 'true';
      } else if (setting.type === 'number') {
        value = Number(setting.value);
      } else if (setting.type === 'json') {
        try {
          value = JSON.parse(setting.value);
        } catch (e) {
          value = setting.value;
        }
      }
      settingsMap[setting.key] = {
        value,
        label: setting.label,
        description: setting.description,
        category: setting.category,
        type: setting.type
      };
    });

    res.json({
      success: true,
      settings: settingsMap,
      rawSettings: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// Get feature settings only (for non-admin users to check feature availability)
exports.getFeatureSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll({
      where: { category: 'features', isActive: true }
    });

    const features = {};
    settings.forEach(setting => {
      features[setting.key] = setting.value === 'true';
    });

    res.json({ success: true, features });
  } catch (error) {
    console.error('Error fetching feature settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch feature settings' });
  }
};

// Update a single setting (super_admin only)
exports.updateSetting = async (req, res) => {
  try {
    // Check if user is super_admin
    if (req.currentUser?.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admin can modify settings' 
      });
    }

    const { key } = req.params;
    const { value } = req.body;

    const setting = await Settings.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Setting not found' 
      });
    }

    // Convert value to string for storage
    let stringValue = value;
    if (typeof value === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else if (typeof value === 'object') {
      stringValue = JSON.stringify(value);
    } else {
      stringValue = String(value);
    }

    await setting.update({ value: stringValue });

    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting: {
        key: setting.key,
        value: value,
        label: setting.label
      }
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, message: 'Failed to update setting' });
  }
};

// Bulk update settings (super_admin only)
exports.bulkUpdateSettings = async (req, res) => {
  try {
    // Check if user is super_admin
    if (req.currentUser?.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admin can modify settings' 
      });
    }

    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Settings array is required' 
      });
    }

    const results = [];
    for (const item of settings) {
      const { key, value } = item;
      
      const setting = await Settings.findOne({ where: { key } });
      if (setting) {
        let stringValue = value;
        if (typeof value === 'boolean') {
          stringValue = value ? 'true' : 'false';
        } else if (typeof value === 'object') {
          stringValue = JSON.stringify(value);
        } else {
          stringValue = String(value);
        }

        await setting.update({ value: stringValue });
        results.push({ key, success: true });
      } else {
        results.push({ key, success: false, message: 'Not found' });
      }
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      results
    });
  } catch (error) {
    console.error('Error bulk updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

// Initialize default settings (called on server start)
exports.initializeSettings = async () => {
  try {
    console.log('Initializing settings...');
    
    // Check if Settings table exists first
    const tableExists = await Settings.sequelize.getQueryInterface().showAllTables();
    if (!tableExists.includes('settings') && !tableExists.includes('Settings')) {
      console.log('Settings table not found, will be created on next sync with alter:true');
      return;
    }
    
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
      },
      {
        key: 'feature_show_session_device_info',
        value: 'true',
        type: 'boolean',
        category: 'features',
        label: 'Show Session Device Info',
        description: 'Allow super admin to view device and network information (IP, User-Agent) for active sessions'
      }
    ];

    for (const setting of defaultSettings) {
      await Settings.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
    }
    console.log('✓ Default settings initialized');
  } catch (error) {
    console.error('Settings init skipped (table may not exist yet):', error.message);
  }
};
