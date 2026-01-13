const { ServiceChecklist, Complaint, User } = require('../models');

// Create service checklist
exports.createChecklist = async (req, res) => {
  try {
    const { complaintId, checklistType, items } = req.body;
    const completedByEngineerId = req.currentUser.id;

    const checklist = await ServiceChecklist.create({
      complaintId,
      checklistType,
      items: items.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        completed: false,
        notes: '',
        completedAt: null
      })),
      completedByEngineerId
    });

    await checklist.reload({
      include: [
        { model: Complaint, attributes: ['id', 'title'] },
        { model: User, as: 'completedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({ success: true, checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get complaint checklist
exports.getComplaintChecklist = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const checklist = await ServiceChecklist.findOne({
      where: { complaintId },
      include: [
        { model: Complaint, attributes: ['id', 'title', 'status'] },
        { model: User, as: 'completedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    res.json({ success: true, checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update checklist item
exports.updateChecklistItem = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { itemId, completed, notes } = req.body;

    const checklist = await ServiceChecklist.findByPk(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    // Update specific item
    const items = checklist.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completed,
          notes,
          completedAt: completed ? new Date() : null
        };
      }
      return item;
    });

    await checklist.update({ items });

    res.json({ success: true, checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete checklist
exports.completeChecklist = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { photoEvidenceUrls } = req.body;

    const checklist = await ServiceChecklist.findByPk(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    // Check if all items are completed
    const allCompleted = checklist.items.every(item => item.completed);
    if (!allCompleted) {
      return res.status(400).json({ error: 'All checklist items must be completed' });
    }

    await checklist.update({
      isCompleted: true,
      completedAt: new Date(),
      photoEvidenceUrls: photoEvidenceUrls || []
    });

    await checklist.reload({
      include: [
        { model: Complaint },
        { model: User, as: 'completedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({ success: true, checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Review checklist (manager only)
exports.reviewChecklist = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { reviewNotes, approved } = req.body;
    const reviewedByManagerId = req.currentUser.id;

    const checklist = await ServiceChecklist.findByPk(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    await checklist.update({
      reviewedByManagerId,
      reviewedAt: new Date(),
      reviewNotes,
      status: approved ? 'approved' : 'needs_revision'
    });

    await checklist.reload({
      include: [
        { model: Complaint },
        { model: User, as: 'completedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({ success: true, checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending checklists for review
exports.getPendingChecklists = async (req, res) => {
  try {
    const checklists = await ServiceChecklist.findAll({
      where: { isCompleted: true, reviewedAt: null },
      include: [
        { model: Complaint, attributes: ['id', 'title', 'customerName'] },
        { model: User, as: 'completedBy', attributes: ['id', 'name'] }
      ],
      order: [['completedAt', 'DESC']]
    });

    res.json({ success: true, checklists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get common checklist items (templates)
exports.getCommonChecklistItems = async (req, res) => {
  try {
    const { checklistType } = req.query;

    // Common templates
    const templates = {
      'Electrical Inspection': [
        'Check voltage levels',
        'Test circuit breakers',
        'Inspect wiring for damage',
        'Check grounding',
        'Test all outlets',
        'Document any issues'
      ],
      'Refrigeration Service': [
        'Check refrigerant level',
        'Inspect compressor',
        'Clean coils',
        'Check thermostat calibration',
        'Test temperature',
        'Check for leaks',
        'Document pressure readings'
      ],
      'HVAC Maintenance': [
        'Clean filters',
        'Check refrigerant charge',
        'Inspect ductwork',
        'Test thermostat',
        'Check compressor operation',
        'Clean outdoor unit',
        'Document system performance'
      ],
      'Plumbing Service': [
        'Check for leaks',
        'Test water pressure',
        'Inspect pipes',
        'Check drain function',
        'Test hot water',
        'Inspect fixtures'
      ]
    };

    const items = templates[checklistType] || [];
    const formattedItems = items.map((name, idx) => ({
      id: `item_${idx}`,
      name,
      completed: false,
      notes: ''
    }));

    res.json({ success: true, items: formattedItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
