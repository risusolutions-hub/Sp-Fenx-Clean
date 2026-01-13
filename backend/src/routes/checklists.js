const express = require('express');
const { requireLogin, roleAtLeast } = require('../middleware/auth');
const checklistController = require('../controllers/checklistController');

const router = express.Router();

// All routes require authentication
router.use(requireLogin);

// Checklist management
router.post('/', checklistController.createChecklist);
router.get('/complaints/:complaintId', checklistController.getComplaintChecklist);
router.put('/:checklistId/items/:itemId', checklistController.updateChecklistItem);
router.put('/:checklistId/complete', checklistController.completeChecklist);

// Manager review
router.put('/:checklistId/review', roleAtLeast('manager'), checklistController.reviewChecklist);
router.get('/pending', roleAtLeast('manager'), checklistController.getPendingChecklists);

// Templates
router.get('/templates', checklistController.getCommonChecklistItems);

module.exports = router;
