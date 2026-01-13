const { User, DailyWorkTime, Complaint, EngineerStatus, EngineerSkill } = require('../models');
const { canManageTarget } = require('../middleware/auth');
const { Op } = require('sequelize');

async function listUsers(req, res) {
  const { role } = req.currentUser;
  const { search = '', limit = 10 } = req.query;

  // Filter users based on role
  const whereClause = role === 'engineer' ? { role: 'admin' } : {};

  try {
    const users = await User.findAll({
      where: {
        ...whereClause,
        name: { [Op.iLike]: `%${search}%` },
      },
      attributes: { exclude: ['passwordHash'] },
      limit: parseInt(limit, 10),
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function createUser(req, res){
  const actor = req.currentUser;
  const { name, email, password, role } = req.body;
  if(!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if(!canManageTarget(actor.role, role || 'engineer')) return res.status(403).json({ error: 'Cannot create user of this role' });

  // Validate name uniqueness
  const existingUser = await User.findOne({ where: { name } });
  if(existingUser) return res.status(400).json({ error: 'Name already exists' });

  try{
    const user = await User.create({ name, email, passwordHash: password, role: role || 'engineer' });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  }catch(err){
    res.status(400).json({ error: err.message });
  }
}

async function updateUser(req, res){
  const actor = req.currentUser;
  const { id } = req.params;
  const target = await User.scope('withPassword').findByPk(id);
  if(!target) return res.status(404).json({ error: 'Not found' });
  if(!canManageTarget(actor.role, target.role)) return res.status(403).json({ error: 'Forbidden' });

  const { name, email, password, role } = req.body;
  if(role && !canManageTarget(actor.role, role)) return res.status(403).json({ error: 'Cannot set that role' });

  // Validate name uniqueness if name is being changed
  if(name && name !== target.name){
    const existingUser = await User.findOne({ where: { name } });
    if(existingUser) return res.status(400).json({ error: 'Name already exists' });
  }

  if(name) target.name = name;
  if(email) target.email = email;
  if(password) target.passwordHash = password;
  if(role) target.role = role;
  await target.save();
  res.json({ id: target.id, name: target.name, email: target.email, role: target.role });
}

async function deleteUser(req, res){
  const actor = req.currentUser;
  const { id } = req.params;
  const target = await User.findByPk(id);
  if(!target) return res.status(404).json({ error: 'Not found' });
  if(!canManageTarget(actor.role, target.role)) return res.status(403).json({ error: 'Forbidden' });

  await target.destroy();
  res.json({ ok: true });
}

async function checkIn(req, res){
  const user = await User.findByPk(req.currentUser.id);
  if(user.isCheckedIn) return res.status(400).json({ error: 'Already checked in' });

  // Check if current time is between 9am and 7pm
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute; // Convert to minutes since midnight
  const nineAM = 9 * 60; // 540 minutes
  const sevenPM = 19 * 60; // 1140 minutes

  if(currentTime < nineAM || currentTime >= sevenPM){
    const validTime = currentTime < nineAM ? '9:00 AM' : 'before 7:00 PM';
    return res.status(400).json({ error: `Check-in is only allowed between 9:00 AM and 7:00 PM. Please check in ${validTime}` });
  }

  user.lastCheckIn = new Date();
  user.isCheckedIn = true;

  // If this is the first check-in of the day, set dailyFirstCheckIn
  const today = new Date(user.dailyFirstCheckIn || '').toDateString();
  const nowString = now.toDateString();
  
  if (!user.dailyFirstCheckIn || today !== nowString) {
    // New day, reset daily fields
    user.dailyFirstCheckIn = user.lastCheckIn;
    user.dailyLastCheckOut = null;
    user.dailyTotalWorkTime = 0;
  }

  await user.save();
  res.json(user);
}

async function checkOut(req, res){
  const user = await User.findByPk(req.currentUser.id);
  if(!user.isCheckedIn) return res.status(400).json({ error: 'Not checked in' });

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;
  const sevenPM = 19 * 60; // 1140 minutes (7:00 PM)

  // If after 7pm, cap checkout time to 7pm
  const isAutoCheckout = currentTime >= sevenPM;
  
  let checkoutTime;
  if (isAutoCheckout) {
    // Set checkout time to 7:00 PM today
    checkoutTime = new Date(now);
    checkoutTime.setHours(19, 0, 0, 0);
  } else {
    checkoutTime = new Date();
  }

  user.lastCheckOut = checkoutTime;
  user.isCheckedIn = false;

  // Calculate duration from check-in to checkout (capped at 7pm if after)
  const checkInTime = new Date(user.lastCheckIn);
  const duration = Math.floor((checkoutTime - checkInTime) / 60000);

  // Update daily tracking
  user.dailyLastCheckOut = checkoutTime;
  user.dailyTotalWorkTime = (user.dailyTotalWorkTime || 0) + duration;

  // Also update activeTime for backward compatibility
  const lastCheckOutDate = user.lastCheckOut ? new Date(user.lastCheckOut) : now;
  if(now.toDateString() !== lastCheckOutDate.toDateString()){
    user.activeTime = 0;
  }
  user.activeTime = (user.activeTime || 0) + duration;

  await user.save();

  // Save daily work time record if it's the end of day or last checkout
  if (isAutoCheckout || currentTime >= sevenPM - 30) {
    const today = now.toISOString().split('T')[0];
    await DailyWorkTime.findOrCreate({
      where: { engineerId: user.id, workDate: today },
      defaults: {
        engineerId: user.id,
        workDate: today,
        firstCheckIn: user.dailyFirstCheckIn,
        lastCheckOut: user.dailyLastCheckOut,
        totalWorkTimeMinutes: user.dailyTotalWorkTime,
        checkInCheckOutLog: []
      },
      update: {
        lastCheckOut: user.dailyLastCheckOut,
        totalWorkTimeMinutes: user.dailyTotalWorkTime
      }
    });
  }
  
  const response = { ...user.toJSON() };
  if(isAutoCheckout) {
    response.autoCheckout = true;
    response.message = 'Checkout time capped at 7:00 PM';
  }
  res.json(response);
}

async function blockUser(req, res) {
  const actor = req.currentUser;
  const { id } = req.params;
  const target = await User.findByPk(id);

  if (!target) return res.status(404).json({ error: 'User not found' });
  if (!canManageTarget(actor.role, target.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }

  target.status = 'blocked';
  await target.save();
  res.json(target);
}

async function unblockUser(req, res) {
  const actor = req.currentUser;
  const { id } = req.params;
  const target = await User.findByPk(id);

  if (!target) return res.status(404).json({ error: 'User not found' });
  if (!canManageTarget(actor.role, target.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }
  
  target.status = 'active';
  await target.save();
  res.json(target);
}

async function updateProfile(req, res){
  const user = await User.findByPk(req.currentUser.id);
  if(!user) return res.status(404).json({ error: 'User not found' });

  const { name } = req.body;
  if(!name) return res.status(400).json({ error: 'Name is required' });
  if(name.trim() === '') return res.status(400).json({ error: 'Name cannot be empty' });

  // Validate name uniqueness if name is being changed
  if(name !== user.name){
    const existingUser = await User.findOne({ where: { name } });
    if(existingUser) return res.status(400).json({ error: 'Name already exists' });
  }

  user.name = name;
  await user.save();
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

// Get all engineers with their status (for managers/admins)
async function getAllEngineers(req, res) {
  try {
    const engineers = await User.findAll({
      where: { role: 'engineer', status: 'active' },
      include: [
        { model: EngineerStatus }
      ],
      attributes: { exclude: ['passwordHash'] }
    });

    const enrichedEngineers = await Promise.all(engineers.map(async (eng) => {
      // Get active tickets count
      const activeTickets = await Complaint.count({
        where: {
          assignedTo: eng.id,
          status: { [Op.in]: ['assigned', 'in_progress'] }
        }
      });

      // Get current working ticket
      const currentTicket = await Complaint.findOne({
        where: {
          assignedTo: eng.id,
          status: 'in_progress'
        },
        include: [{ model: require('../models').Customer }, { model: require('../models').Machine }]
      });

      return {
        id: eng.id,
        name: eng.name,
        email: eng.email,
        status: eng.EngineerStatus?.status || 'unknown',
        isCheckedIn: eng.isCheckedIn,
        lastCheckIn: eng.lastCheckIn,
        lastCheckOut: eng.lastCheckOut,
        activeTicketsCount: activeTickets,
        currentTicket: currentTicket ? {
          id: currentTicket.id,
          complaintId: currentTicket.complaintId,
          problem: currentTicket.problem,
          priority: currentTicket.priority,
          status: currentTicket.status,
          customer: currentTicket.Customer,
          machine: currentTicket.Machine
        } : null
      };
    }));

    res.json({ engineers: enrichedEngineers });
  } catch (error) {
    console.error('Get all engineers error:', error);
    res.status(500).json({ error: 'Failed to fetch engineers' });
  }
}

// Get engineer details with all relevant info
async function getEngineerDetails(req, res) {
  try {
    const { engineerId } = req.params;
    
    const engineer = await User.findByPk(engineerId, {
      include: [
        { model: EngineerStatus },
        { model: EngineerSkill, as: 'skills' }
      ],
      attributes: { exclude: ['passwordHash'] }
    });

    if (!engineer) return res.status(404).json({ error: 'Engineer not found' });
    if (engineer.role !== 'engineer') return res.status(400).json({ error: 'User is not an engineer' });

    // Get active tickets
    const activeTickets = await Complaint.findAll({
      where: {
        assignedTo: engineerId,
        status: { [Op.in]: ['assigned', 'in_progress'] }
      },
      include: [
        { model: require('../models').Customer },
        { model: require('../models').Machine }
      ],
      order: [['status', 'DESC'], ['updatedAt', 'DESC']]
    });

    // Get completed tickets count
    const completedTicketsCount = await Complaint.count({
      where: {
        assignedTo: engineerId,
        status: { [Op.in]: ['resolved', 'closed'] }
      }
    });

    // Get today's work hours
    const today = new Date().toISOString().split('T')[0];
    const dailyWorkTime = await DailyWorkTime.findOne({
      where: {
        engineerId,
        workDate: today
      }
    });

    res.json({
      engineer: {
        id: engineer.id,
        name: engineer.name,
        email: engineer.email,
        role: engineer.role,
        status: engineer.EngineerStatus?.status || 'unknown',
        isCheckedIn: engineer.isCheckedIn,
        lastCheckIn: engineer.lastCheckIn,
        lastCheckOut: engineer.lastCheckOut,
        dailyFirstCheckIn: engineer.dailyFirstCheckIn,
        dailyLastCheckOut: engineer.dailyLastCheckOut,
        dailyTotalWorkTime: engineer.dailyTotalWorkTime,
        skills: (engineer.skills || []).map(s => ({
          id: s.id,
          skillName: s.skillName,
          proficiencyLevel: s.proficiencyLevel,
          yearsOfExperience: s.yearsOfExperience,
          verifiedBy: s.verifiedBy,
          verifiedAt: s.verifiedAt
        }))
      },
      activeTickets: activeTickets.map(t => ({
        id: t.id,
        complaintId: t.complaintId,
        problem: t.problem,
        priority: t.priority,
        status: t.status,
        workStatus: t.workStatus,
        checkInTime: t.checkInTime,
        customer: t.Customer,
        machine: t.Machine
      })),
      activeTicketsCount: activeTickets.length,
      completedTicketsCount,
      todayWorkInfo: dailyWorkTime ? {
        workDate: dailyWorkTime.workDate,
        firstCheckIn: dailyWorkTime.firstCheckIn,
        lastCheckOut: dailyWorkTime.lastCheckOut,
        totalWorkTimeMinutes: dailyWorkTime.totalWorkTimeMinutes
      } : null
    });
  } catch (error) {
    console.error('Get engineer details error:', error);
    res.status(500).json({ error: 'Failed to fetch engineer details' });
  }
}

// Change password (PATCH /users/:id/password)
async function changePassword(req, res){
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if(!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

  try{
    const target = await User.scope('withPassword').findByPk(id);
    if(!target) return res.status(404).json({ error: 'User not found' });

    // Allow self-change with currentPassword verification, or allow managers/admins to reset without currentPassword
    const actor = req.currentUser;
    const isSelf = String(actor.id) === String(id);
    const canManage = ['manager','admin','superadmin'].includes(actor.role);

    if(isSelf){
      if(!currentPassword) return res.status(400).json({ error: 'Current password required' });
      const ok = await target.verifyPassword(currentPassword);
      if(!ok) return res.status(401).json({ error: 'Invalid current password' });
    } else if(!canManage){
      return res.status(403).json({ error: 'Forbidden' });
    }

    target.passwordHash = newPassword;
    await target.save();

    res.json({ ok: true });
  }catch(err){
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
}

// Get complaints assigned to a user (GET /users/:id/complaints)
async function getUserComplaints(req, res){
  const { id } = req.params;
  try{
    const complaints = await Complaint.findAll({
      where: { assignedTo: id },
      include: [require('../models').Customer, require('../models').Machine],
      order: [['createdAt', 'DESC']]
    });
    res.json({ complaints });
  }catch(err){
    console.error('Get user complaints error:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

// Get basic user stats (GET /users/:id/stats)
async function getUserStats(req, res){
  const { id } = req.params;
  try{
    const totalAssigned = await Complaint.count({ where: { assignedTo: id } });
    const completed = await Complaint.count({ where: { assignedTo: id, status: { [Op.in]: ['completed','resolved','closed'] } } });
    const inProgress = await Complaint.count({ where: { assignedTo: id, status: { [Op.in]: ['assigned','in_progress'] } } });

    // Avg resolution time (completed) in hours
    const completedRows = await Complaint.findAll({
      where: { assignedTo: id, status: { [Op.in]: ['completed','resolved','closed'] }, resolvedAt: { [Op.ne]: null } },
      attributes: ['createdAt','resolvedAt']
    });
    let avgResolutionHours = null;
    if(completedRows.length){
      const totalMs = completedRows.reduce((sum, r) => sum + (new Date(r.resolvedAt) - new Date(r.createdAt)), 0);
      avgResolutionHours = Math.round((totalMs / completedRows.length) / (1000*60*60));
    }

    res.json({ totalAssigned, completed, inProgress, avgResolutionHours });
  }catch(err){
    console.error('Get user stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

// Get available engineers (GET /users/available-engineers)
async function getAvailableEngineers(req, res){
  try{
    const engineers = await User.findAll({
      where: { role: 'engineer', status: 'active' },
      include: [{ model: EngineerStatus }],
      attributes: { exclude: ['passwordHash'] }
    });

    const available = engineers.filter(e => e.EngineerStatus?.status === 'free' && e.isCheckedIn);

    res.json({ engineers: available.map(e => ({ id: e.id, name: e.name, email: e.email, status: e.EngineerStatus?.status || 'unknown', isCheckedIn: e.isCheckedIn })) });
  }catch(err){
    console.error('Get available engineers error:', err);
    res.status(500).json({ error: 'Failed to fetch available engineers' });
  }
}

module.exports = { listUsers, createUser, updateUser, deleteUser, checkIn, checkOut, blockUser, unblockUser, updateProfile, getAllEngineers, getEngineerDetails, changePassword, getUserComplaints, getUserStats, getAvailableEngineers };
