const express = require('express');
const { requireLogin, loadCurrentUser } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

// All routes require authentication
router.use(loadCurrentUser);
router.use(requireLogin);

// Send message
router.post('/', messageController.sendMessage);

// Get messages for a thread
router.get('/', messageController.getMessages);

// Get conversations list
router.get('/conversations', messageController.getConversations);

// Get unread message count
router.get('/unread-count', messageController.getUnreadCount);

// Get messages where user was mentioned
router.get('/mentions', messageController.getMentions);

// Get complaint thread messages
router.get('/complaints/:complaintId', messageController.getComplaintMessages);

// Send message to complaint thread
router.post('/complaints', messageController.sendComplaintMessage);

// Mark message as read
router.put('/read', messageController.markAsRead);

// Mark entire conversation as read
router.put('/conversation/read', messageController.markConversationAsRead);

// Edit message
router.put('/:messageId', messageController.editMessage);

// Delete message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
