const { Message, User, Complaint } = require('../models');

// Send message (direct or complaint thread)
exports.sendMessage = async (req, res) => {
  try {
    const { threadType, complaintId, recipientId, content, mentions } = req.body;
    const senderId = req.currentUser.id;

    const message = await Message.create({
      threadType,
      complaintId: threadType === 'complaint' ? complaintId : null,
      senderId,
      recipientId: threadType === 'direct' ? recipientId : null,
      content,
      mentions: mentions || []
    });

    await message.reload({
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'recipient', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages for a thread (complaint or direct)
exports.getMessages = async (req, res) => {
  try {
    const { threadType, complaintId, otherUserId } = req.query;
    const userId = req.currentUser.id;
    const { Op } = require('sequelize');
    const query = { threadType };

    if (threadType === 'complaint') {
      query.complaintId = complaintId;
    } else if (threadType === 'direct') {
      query[Op.or] = [
        {
          senderId: userId,
          recipientId: otherUserId
        },
        {
          senderId: otherUserId,
          recipientId: userId
        }
      ];
    }

    const messages = await Message.findAll({
      where: query,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'recipient', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['createdAt', 'ASC']],
      limit: 100
    });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversation list (direct messages)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.currentUser.id;
    const { Op } = require('sequelize');

    const messages = await Message.findAll({
      where: {
        threadType: 'direct',
        [Op.or]: [{ senderId: userId }, { recipientId: userId }]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'recipient', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const isSender = msg.senderId === userId;
      const otherUser = isSender ? msg.recipient : msg.sender;
      
      if (!otherUser) return; // Skip if no other user found
      
      if (!conversations[otherUser.id]) {
        conversations[otherUser.id] = {
          userId: otherUser.id,
          userName: otherUser.name,
          userEmail: otherUser.email,
          userRole: otherUser.role,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0
        };
      }
      
      // Count unread messages (messages sent TO current user that haven't been read)
      if (!isSender && !msg.readAt) {
        conversations[otherUser.id].unreadCount++;
      }
    });

    res.json({ success: true, conversations: Object.values(conversations) });
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body;

    await Message.update(
      { readAt: new Date() },
      { where: { id: messageId } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.currentUser.id;

    const message = await Message.findByPk(messageId);
    if (!message || message.senderId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await message.update({
      content,
      isEdited: true,
      editedAt: new Date()
    });

    await message.reload({
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.currentUser.id;

    const message = await Message.findByPk(messageId);
    if (!message || message.senderId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await message.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk mark conversation as read
exports.markConversationAsRead = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.currentUser.id;
    const { Op } = require('sequelize');

    await Message.update(
      { readAt: new Date() },
      {
        where: {
          threadType: 'direct',
          senderId: otherUserId,
          recipientId: userId,
          readAt: null
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages where user was mentioned
exports.getMentions = async (req, res) => {
  try {
    const userId = req.currentUser.id;
    const { Op, fn, col, literal } = require('sequelize');

    const messages = await Message.findAll({
      where: literal(`JSON_CONTAINS(mentions, '${userId}')`),
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ success: true, mentions: messages });
  } catch (error) {
    console.error('Error in getMentions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.currentUser.id;

    const count = await Message.count({
      where: {
        recipientId: userId,
        readAt: null
      }
    });

    res.json({ success: true, unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message to complaint thread
exports.sendComplaintMessage = async (req, res) => {
  try {
    const { complaintId, content, mentions } = req.body;
    const senderId = req.currentUser.id;

    // Verify complaint exists
    const complaint = await Complaint.findByPk(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const message = await Message.create({
      threadType: 'complaint',
      complaintId,
      senderId,
      content,
      mentions: mentions || []
    });

    await message.reload({
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get complaint thread messages
exports.getComplaintMessages = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const messages = await Message.findAll({
      where: {
        threadType: 'complaint',
        complaintId
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
