const express = require('express');
const { requireLogin } = require('../middleware/auth');
const machineServiceHistoryController = require('../controllers/machineServiceHistoryController');

const router = express.Router();

// All routes require authentication
router.use(requireLogin);

// Service history management
router.post('/', machineServiceHistoryController.addServiceHistory);
router.get('/machines/:machineId', machineServiceHistoryController.getMachineServiceHistory);
router.get('/:historyId', machineServiceHistoryController.getServiceHistoryDetail);
router.put('/:historyId', machineServiceHistoryController.updateServiceHistory);

// Analytics
router.get('/machines/requiring-maintenance', machineServiceHistoryController.getMachinesRequiringMaintenance);
router.get('/trends', machineServiceHistoryController.getServiceTrends);

module.exports = router;
