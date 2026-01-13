const { DailyWorkTime, User } = require('../models');

async function getDailyWorkHistory(req, res) {
  try {
    const { engineerId, fromDate, toDate } = req.query;
    const targetId = engineerId || req.currentUser.id;

    // Verify permission - engineer can only see their own, managers/admins can see all
    if (req.currentUser.role === 'engineer' && req.currentUser.id !== parseInt(targetId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const where = { engineerId: targetId };
    if (fromDate || toDate) {
      where.workDate = {};
      if (fromDate) where.workDate['$gte'] = fromDate;
      if (toDate) where.workDate['$lte'] = toDate;
    }

    const records = await DailyWorkTime.findAll({
      where,
      order: [['workDate', 'DESC']],
      limit: 90 // Last 90 days
    });

    res.json({ records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getWorkStats(req, res) {
  try {
    const { engineerId, fromDate, toDate } = req.query;
    const targetId = engineerId || req.currentUser.id;

    // Verify permission
    if (req.currentUser.role === 'engineer' && req.currentUser.id !== parseInt(targetId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const where = { engineerId: targetId };
    if (fromDate || toDate) {
      where.workDate = {};
      if (fromDate) where.workDate['$gte'] = fromDate;
      if (toDate) where.workDate['$lte'] = toDate;
    }

    const records = await DailyWorkTime.findAll({ where });

    // Calculate statistics
    const totalDays = records.length;
    const totalMinutes = records.reduce((sum, r) => sum + (r.totalWorkTimeMinutes || 0), 0);
    const avgMinutesPerDay = totalDays > 0 ? Math.floor(totalMinutes / totalDays) : 0;
    const maxMinutesDay = records.length > 0 
      ? Math.max(...records.map(r => r.totalWorkTimeMinutes || 0))
      : 0;
    const minMinutesDay = records.length > 0
      ? Math.min(...records.map(r => r.totalWorkTimeMinutes || 0))
      : 0;

    res.json({
      stats: {
        totalDays,
        totalMinutes,
        avgMinutesPerDay,
        maxMinutesDay,
        minMinutesDay,
        avgHoursPerDay: Math.floor(avgMinutesPerDay / 60),
        avgMinsPerDay: avgMinutesPerDay % 60,
        totalHours: Math.floor(totalMinutes / 60),
        totalMins: totalMinutes % 60
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCurrentDayStatus(req, res) {
  try {
    const user = await User.findByPk(req.currentUser.id);
    const today = new Date().toISOString().split('T')[0];
    
    const todayRecord = await DailyWorkTime.findOne({
      where: { engineerId: user.id, workDate: today }
    });

    res.json({
      isCheckedIn: user.isCheckedIn,
      dailyFirstCheckIn: user.dailyFirstCheckIn,
      dailyLastCheckOut: user.dailyLastCheckOut,
      dailyTotalWorkTime: user.dailyTotalWorkTime || 0,
      lastCheckIn: user.lastCheckIn,
      lastCheckOut: user.lastCheckOut,
      activeTime: user.activeTime || 0,
      todayRecord: todayRecord || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getDailyWorkHistory,
  getWorkStats,
  getCurrentDayStatus
};
