const express = require('express');
const router = express.Router();
const { getDailyWorkHistory, getWorkStats, getCurrentDayStatus } = require('../controllers/workTimeController');
const { requireLogin } = require('../middleware/auth');

router.get('/history', requireLogin, getDailyWorkHistory);
router.get('/stats', requireLogin, getWorkStats);
router.get('/today', requireLogin, getCurrentDayStatus);

module.exports = router;
