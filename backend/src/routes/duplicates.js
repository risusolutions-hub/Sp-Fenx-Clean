const express = require('express');
const { requireLogin, roleAtLeast } = require('../middleware/auth');
const duplicateController = require('../controllers/duplicateController');

const router = express.Router();

// All routes require authentication
router.use(requireLogin);

// Detect potential duplicates
router.post('/detect', duplicateController.detectDuplicates);

// Link duplicates
router.post('/link', duplicateController.linkDuplicates);

// Get duplicates for complaint
router.get('/complaints/:complaintId', duplicateController.getComplaintDuplicates);

// Merge complaints
router.post('/merge', roleAtLeast('manager'), duplicateController.mergeComplaints);

// Unlink duplicates
router.delete('/link/:linkId', roleAtLeast('manager'), duplicateController.unlinkDuplicates);

// Statistics
router.get('/stats', duplicateController.getDuplicateStats);

module.exports = router;
