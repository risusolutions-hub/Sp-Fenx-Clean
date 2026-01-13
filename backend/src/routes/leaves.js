const express = require('express');
const router = express.Router();
const { requireLogin, loadCurrentUser, roleAtLeast } = require('../middleware/auth');
const { createLeaveRequest, listLeaves, approveLeave, rejectLeave, deleteLeaveRequest } = require('../controllers/leaveController');

router.use(loadCurrentUser);
router.use(requireLogin);

router.get('/', requireLogin, listLeaves);
router.post('/', requireLogin, createLeaveRequest);
router.post('/:id/approve', roleAtLeast('manager'), approveLeave);
router.post('/:id/reject', roleAtLeast('manager'), rejectLeave);
router.delete('/:id', requireLogin, deleteLeaveRequest);

module.exports = router;
