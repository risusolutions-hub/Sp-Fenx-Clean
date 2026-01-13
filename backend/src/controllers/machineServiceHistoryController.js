const { MachineServiceHistory, Machine, Complaint, User } = require('../models');
const { Op } = require('sequelize');

// Add machine service history
exports.addServiceHistory = async (req, res) => {
  try {
    const {
      machineId,
      complaintId,
      serviceType,
      issueDescription,
      resolutionDescription,
      partsReplaced,
      downtime,
      cost,
      nextScheduledMaintenance
    } = req.body;
    const engineerId = req.currentUser.id;

    const history = await MachineServiceHistory.create({
      machineId,
      complaintId,
      serviceType,
      issueDescription,
      resolutionDescription,
      partsReplaced,
      downtime,
      cost,
      engineerId,
      completedAt: new Date(),
      nextScheduledMaintenance
    });

    await history.reload({
      include: [
        { model: Machine, attributes: ['id', 'name', 'type'] },
        { model: User, as: 'engineer', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get machine service history
exports.getMachineServiceHistory = async (req, res) => {
  try {
    const { machineId } = req.params;

    const history = await MachineServiceHistory.findAll({
      where: { machineId },
      include: [
        { model: User, as: 'engineer', attributes: ['id', 'name', 'email'] },
        { model: Complaint, attributes: ['id', 'title', 'status'] }
      ],
      order: [['serviceDate', 'DESC']]
    });

    // Calculate pattern detection - frequent failures on same component
    const patterns = {};
    history.forEach(service => {
      if (service.partsReplaced && Array.isArray(service.partsReplaced)) {
        service.partsReplaced.forEach(part => {
          patterns[part.partName] = (patterns[part.partName] || 0) + 1;
        });
      }
    });

    const frequentFailures = Object.entries(patterns)
      .filter(([_, count]) => count > 2)
      .map(([partName, count]) => ({ partName, failureCount: count }))
      .sort((a, b) => b.failureCount - a.failureCount);

    res.json({ success: true, history, frequentFailures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get service history details
exports.getServiceHistoryDetail = async (req, res) => {
  try {
    const { historyId } = req.params;

    const history = await MachineServiceHistory.findByPk(historyId, {
      include: [
        { model: Machine, attributes: ['id', 'name', 'type', 'serialNumber'] },
        { model: User, as: 'engineer', attributes: ['id', 'name', 'email'] },
        { model: Complaint, attributes: ['id', 'title', 'description', 'priority'] }
      ]
    });

    if (!history) {
      return res.status(404).json({ error: 'Service history not found' });
    }

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update service history
exports.updateServiceHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    const {
      serviceType,
      issueDescription,
      resolutionDescription,
      partsReplaced,
      downtime,
      cost,
      nextScheduledMaintenance
    } = req.body;

    const history = await MachineServiceHistory.findByPk(historyId);
    if (!history) {
      return res.status(404).json({ error: 'Service history not found' });
    }

    await history.update({
      serviceType,
      issueDescription,
      resolutionDescription,
      partsReplaced,
      downtime,
      cost,
      nextScheduledMaintenance
    });

    await history.reload({
      include: [{ model: Machine }, { model: User, as: 'engineer' }]
    });

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get machines requiring maintenance (based on service history)
exports.getMachinesRequiringMaintenance = async (req, res) => {
  try {
    const machines = await Machine.findAll({
      include: [
        {
          model: MachineServiceHistory,
          as: 'serviceHistory',
          required: true,
          attributes: ['nextScheduledMaintenance', 'serviceDate']
        }
      ]
    });

    const requiring = machines.filter(machine => {
      const latest = machine.serviceHistory[machine.serviceHistory.length - 1];
      if (!latest || !latest.nextScheduledMaintenance) return false;
      return new Date(latest.nextScheduledMaintenance) <= new Date();
    });

    res.json({ success: true, machinesRequiringMaintenance: requiring });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get service trends
exports.getServiceTrends = async (req, res) => {
  try {
    const { machineId, days = 90 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const query = { serviceDate: { [Op.gte]: startDate } };
    if (machineId) query.machineId = machineId;

    const history = await MachineServiceHistory.findAll({
      where: query,
      order: [['serviceDate', 'ASC']]
    });

    // Group by month
    const trends = {};
    history.forEach(service => {
      const month = new Date(service.serviceDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
      trends[month] = (trends[month] || 0) + 1;
    });

    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
