const express = require('express');
const router = express.Router();
const { login, logout, me } = require('../controllers/authController');
const { loadCurrentUser } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', loadCurrentUser, me);

module.exports = router;
