const { Leave, User } = require('../models');
const { Op } = require('sequelize');

async function createLeaveRequest(req, res) {
  const engineerId = req.currentUser.id;
  const { leaveType, reason, startDate, endDate } = req.body;

  if (!leaveType || !reason || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Calculate number of days (excluding weekends)
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    const leave = await Leave.create({
      engineerId,
      leaveType,
      reason,
      startDate: start,
      endDate: end,
      numDays: count,
      status: 'pending'
    });

    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function listLeaves(req, res) {
  try {
    const where = {};
    
    if (req.currentUser.role === 'engineer') {
      where.engineerId = req.currentUser.id;
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    const leaves = await Leave.findAll({
      where,
      include: [
        { model: User, as: 'engineer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ leaves });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function approveLeave(req, res) {
  const { id } = req.params;
  const { approvalNotes } = req.body;
  const actor = req.currentUser;

  // Only manager and admin can approve
  if (!['manager', 'admin', 'superadmin'].includes(actor.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request already processed' });
    }

    leave.status = 'approved';
    leave.approvedBy = actor.id;
    leave.approvalNotes = approvalNotes || '';
    leave.approvalDate = new Date();
    await leave.save();

    const updated = await Leave.findByPk(id, {
      include: [
        { model: User, as: 'engineer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function rejectLeave(req, res) {
  const { id } = req.params;
  const { approvalNotes } = req.body;
  const actor = req.currentUser;

  // Only manager and admin can reject
  if (!['manager', 'admin', 'superadmin'].includes(actor.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request already processed' });
    }

    leave.status = 'rejected';
    leave.approvedBy = actor.id;
    leave.approvalNotes = approvalNotes || 'Leave request rejected';
    leave.approvalDate = new Date();
    await leave.save();

    const updated = await Leave.findByPk(id, {
      include: [
        { model: User, as: 'engineer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteLeaveRequest(req, res) {
  const { id } = req.params;
  const actor = req.currentUser;

  try {
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Only engineer who created it or admin can delete
    if (leave.engineerId !== actor.id && !['admin', 'superadmin'].includes(actor.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Can only delete pending leaves
    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending leave requests' });
    }

    await leave.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  createLeaveRequest,
  listLeaves,
  approveLeave,
  rejectLeave,
  deleteLeaveRequest
};
