const { DashboardWidget, User } = require('../models');

// Get user dashboard layouts
exports.getUserLayouts = async (req, res) => {
  try {
    const userId = req.currentUser.id;

    const layouts = await DashboardWidget.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({ success: true, layouts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single layout
exports.getLayout = async (req, res) => {
  try {
    const { layoutId } = req.params;
    const userId = req.currentUser.id;

    const layout = await DashboardWidget.findOne({
      where: { id: layoutId, userId }
    });

    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    res.json({ success: true, layout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create dashboard layout
exports.createLayout = async (req, res) => {
  try {
    const { layoutName, widgets, isDefault } = req.body;
    const userId = req.currentUser.id;

    // If setting as default, unset other defaults
    if (isDefault) {
      await DashboardWidget.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    const layout = await DashboardWidget.create({
      userId,
      layoutName,
      widgets,
      isDefault: isDefault || false
    });

    res.status(201).json({ success: true, layout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update dashboard layout
exports.updateLayout = async (req, res) => {
  try {
    const { layoutId } = req.params;
    const { layoutName, widgets, isDefault } = req.body;
    const userId = req.currentUser.id;

    const layout = await DashboardWidget.findOne({
      where: { id: layoutId, userId }
    });

    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    // If setting as default, unset other defaults
    if (isDefault && !layout.isDefault) {
      await DashboardWidget.update(
        { isDefault: false },
        { where: { userId, id: { [require('sequelize').Op.ne]: layoutId } } }
      );
    }

    await layout.update({
      layoutName,
      widgets,
      isDefault
    });

    res.json({ success: true, layout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add widget to layout
exports.addWidget = async (req, res) => {
  try {
    const { layoutId } = req.params;
    const { widget } = req.body;
    const userId = req.currentUser.id;

    const layout = await DashboardWidget.findOne({
      where: { id: layoutId, userId }
    });

    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    const widgets = [...layout.widgets, {
      id: `widget_${Date.now()}`,
      ...widget
    }];

    await layout.update({ widgets });

    res.json({ success: true, layout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update widget
exports.updateWidget = async (req, res) => {
  try {
    const { layoutId, widgetId } = req.params;
    const { position, size, filters } = req.body;
    const userId = req.currentUser.id;

    const layout = await DashboardWidget.findOne({
      where: { id: layoutId, userId }
    });

    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    const widgets = layout.widgets.map(w => {
      if (w.id === widgetId) {
        return {
          ...w,
          position,
          size,
          filters
        };
      }
      return w;
    });

    await layout.update({ widgets });

    res.json({ success: true, layout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove widget
exports.removeWidget = async (req, res) => {
  try {
    const { layoutId, widgetId } = req.params;
    const userId = req.currentUser.id;

    const layout = await DashboardWidget.findOne({
      where: { id: layoutId, userId }
    });

    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    const widgets = layout.widgets.filter(w => w.id !== widgetId);

    await layout.update({ widgets });

    res.json({ success: true, layout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete layout
exports.deleteLayout = async (req, res) => {
  try {
    const { layoutId } = req.params;
    const userId = req.currentUser.id;

    const layout = await DashboardWidget.findOne({
      where: { id: layoutId, userId }
    });

    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    await layout.destroy();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get default widget configuration templates
exports.getWidgetTemplates = async (req, res) => {
  try {
    const templates = {
      engineer: [
        {
          id: 'assigned_tasks',
          type: 'card',
          title: 'Assigned Tasks',
          size: { width: 2, height: 1 },
          filters: {}
        },
        {
          id: 'location_map',
          type: 'map',
          title: 'Location Map',
          size: { width: 2, height: 2 },
          filters: { showMyLocation: true }
        },
        {
          id: 'daily_schedule',
          type: 'timeline',
          title: 'Daily Schedule',
          size: { width: 2, height: 1 },
          filters: {}
        }
      ],
      manager: [
        {
          id: 'team_performance',
          type: 'chart',
          title: 'Team Performance',
          size: { width: 2, height: 2 },
          filters: {}
        },
        {
          id: 'pending_approvals',
          type: 'list',
          title: 'Pending Approvals',
          size: { width: 2, height: 1 },
          filters: {}
        },
        {
          id: 'sla_status',
          type: 'gauge',
          title: 'SLA Compliance',
          size: { width: 2, height: 1 },
          filters: {}
        }
      ],
      admin: [
        {
          id: 'system_health',
          type: 'status',
          title: 'System Health',
          size: { width: 2, height: 1 },
          filters: {}
        },
        {
          id: 'user_activity',
          type: 'chart',
          title: 'User Activity',
          size: { width: 2, height: 2 },
          filters: {}
        },
        {
          id: 'financial_metrics',
          type: 'card',
          title: 'Financial Metrics',
          size: { width: 2, height: 1 },
          filters: {}
        }
      ]
    };

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
