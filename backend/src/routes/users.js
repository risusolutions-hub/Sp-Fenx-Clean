const express = require('express');
const router = express.Router();
const { requireLogin, loadCurrentUser, roleAtLeast } = require('../middleware/auth');
const { listUsers, createUser, updateUser, deleteUser, checkIn, checkOut, blockUser, unblockUser, updateProfile, getAllEngineers, getEngineerDetails, changePassword, getUserComplaints, getUserStats, getAvailableEngineers } = require('../controllers/userController');

router.use(loadCurrentUser);
router.use(requireLogin);

// Top-level lists and helpers
router.get('/', listUsers);
router.get('/available-engineers', requireLogin, getAvailableEngineers); // NEW
router.get('/engineers/all', roleAtLeast('manager'), getAllEngineers);
router.get('/engineers/:engineerId', roleAtLeast('manager'), getEngineerDetails);

// User operations
router.post('/', roleAtLeast('manager'), createUser);
router.put('/:id', roleAtLeast('manager'), updateUser);
router.delete('/:id', roleAtLeast('admin'), deleteUser);
router.patch('/:id/password', requireLogin, changePassword); // NEW
router.get('/:id/complaints', requireLogin, getUserComplaints); // NEW
router.get('/:id/stats', requireLogin, getUserStats); // NEW

// Check-in/out and status changes
router.post('/check-in', requireLogin, checkIn);
router.post('/check-out', requireLogin, checkOut);
router.post('/:id/block', roleAtLeast('admin'), blockUser);
router.post('/:id/unblock', roleAtLeast('admin'), unblockUser);
router.put('/profile/update-name', requireLogin, updateProfile);

module.exports = router;
