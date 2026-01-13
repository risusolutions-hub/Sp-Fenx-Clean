const express = require('express');
const { requireLogin } = require('../middleware/auth');
const dashboardWidgetController = require('../controllers/dashboardWidgetController');

const router = express.Router();

// All routes require authentication
router.use(requireLogin);

// Get user layouts
router.get('/layouts', dashboardWidgetController.getUserLayouts);

// Get single layout
router.get('/layouts/:layoutId', dashboardWidgetController.getLayout);

// Create layout
router.post('/layouts', dashboardWidgetController.createLayout);

// Update layout
router.put('/layouts/:layoutId', dashboardWidgetController.updateLayout);

// Add widget to layout
router.post('/layouts/:layoutId/widgets', dashboardWidgetController.addWidget);

// Update widget
router.put('/layouts/:layoutId/widgets/:widgetId', dashboardWidgetController.updateWidget);

// Remove widget
router.delete('/layouts/:layoutId/widgets/:widgetId', dashboardWidgetController.removeWidget);

// Delete layout
router.delete('/layouts/:layoutId', dashboardWidgetController.deleteLayout);

// Get widget templates
router.get('/templates', dashboardWidgetController.getWidgetTemplates);

module.exports = router;
