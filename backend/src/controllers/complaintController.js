const { Complaint, Customer, Machine, User, ServiceHistory, EngineerStatus, sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');

function parseSpares(sparesUsed){
  if(!sparesUsed) return null;
  if(Array.isArray(sparesUsed)) return sparesUsed;
  if(typeof sparesUsed === 'string'){
    return sparesUsed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return null;
}

async function listComplaints(req, res){
  const where = {};
  if(req.query.status) where.status = req.query.status;
  if(req.query.assignedTo) where.assignedTo = req.query.assignedTo;

  if(req.currentUser.role === 'engineer'){
    if(req.query.open){
      where.status = 'pending';
    }else{
      where.assignedTo = req.currentUser.id;
    }
  }

  const complaints = await Complaint.findAll({
    where,
    include: [Customer, Machine, { model: User, as: 'engineer' }]
  });
  res.json({ complaints });
}

async function createComplaint(req, res){
  const { 
    problem, 
    priority, 
    attachments, 
    customerId, 
    machineId, 
    issueCategories,
    customIssue,
    isNewCustomer,
    isNewMachine,
    customerData,
    machineData,
    serviceNo
  } = req.body;

  try {
    let finalCustomerId = customerId;
    let finalMachineId = machineId;

    // Create new customer if needed
    if (isNewCustomer && customerData) {
      const newCustomer = await Customer.create({
        name: customerData.companyName,
        companyName: customerData.companyName,
        company: customerData.companyName,
        contactPerson: customerData.contactPerson || null,
        email: customerData.email || null,
        phone: customerData.phones?.[0] || customerData.phone || null,
        phones: customerData.phones?.filter(p => p.trim()) || [],
        city: customerData.city || null,
        address: customerData.address || null,
        serviceNo: customerData.serviceNo || serviceNo || null
      });
      finalCustomerId = newCustomer.id;
    }

    // Create new machine if needed
    if (isNewMachine && machineData) {
      if (!machineData.model || !machineData.serialNumber) {
        return res.status(400).json({ error: 'Machine model and serial number are required' });
      }
      
      const newMachine = await Machine.create({
        model: machineData.model,
        serialNumber: machineData.serialNumber,
        mobileNumbers: machineData.mobileNumbers?.filter(m => m.trim()) || [],
        customerId: finalCustomerId
      });
      finalMachineId = newMachine.id;
    }

    if (!problem || !finalCustomerId || !finalMachineId) {
      return res.status(400).json({ error: 'Missing required fields: problem, customer, and machine are required' });
    }

    // Combine issue categories
    let allIssues = issueCategories || [];
    if (customIssue && customIssue.trim()) {
      allIssues = [...allIssues, `custom:${customIssue.trim()}`];
    }

    const complaintId = 'TKT-' + Date.now(); // auto-generated
    
    const complaint = await Complaint.create({
      complaintId,
      problem,
      priority: priority || 'medium',
      attachments: attachments || null,
      issueCategories: allIssues.length > 0 ? allIssues : null,
      customerId: finalCustomerId,
      machineId: finalMachineId,
      createdBy: req.currentUser?.id || null,
      status: 'pending'
    });

    // Reload with associations
    const createdComplaint = await Complaint.findByPk(complaint.id, {
      include: [Customer, Machine, { model: User, as: 'engineer' }]
    });

    res.status(201).json(createdComplaint);
  } catch(err) {
    console.error('Error creating complaint:', err);
    res.status(400).json({ error: err.message });
  }
}

async function updateComplaint(req, res){
  const { id } = req.params;
  const complaint = await Complaint.findByPk(id);
  if(!complaint) return res.status(404).json({ error: 'Not found' });

  const { problem, priority, attachments, status, assignedTo, description } = req.body;
  if(problem) complaint.problem = problem;
  if(priority) complaint.priority = priority;
  if(attachments) complaint.attachments = attachments;
  if(description) complaint.description = description;
  if(status) complaint.status = status;
  if(assignedTo !== undefined) complaint.assignedTo = assignedTo;
  await complaint.save();
  res.json(complaint);
}

async function assignComplaint(req, res){
  const { id } = req.params;
  const engineerId = parseInt(req.body.engineerId || req.body.assignedTo || req.currentUser.id);
  const complaint = await Complaint.findByPk(id);
  if(!complaint) return res.status(404).json({ error: 'Not found' });

  if(!engineerId) return res.status(400).json({ error: 'engineerId required' });

  const role = req.currentUser.role;
  const isEngineer = role === 'engineer';
  const canAssignOthers = ['manager','admin','superadmin'].includes(role);

  // Engineers can only assign tickets to themselves
  if(isEngineer && engineerId !== req.currentUser.id){
    return res.status(403).json({ error: 'Forbidden' });
  }
  if(!isEngineer && !canAssignOthers){
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Only pending tickets can be taken by engineers, managers can reassign
  if(complaint.status !== 'pending' && !canAssignOthers){
    return res.status(400).json({ error: 'Ticket is not pending' });
  }

  complaint.assignedTo = engineerId;
  complaint.status = 'assigned';
  await complaint.save();

  const status = await EngineerStatus.findOne({ where: { engineerId } });
  if(status){
    status.status = 'busy';
    await status.save();
  }

  res.json(complaint);
}

async function unassignComplaint(req, res) {
  const { id } = req.params;
  const complaint = await Complaint.findByPk(id);
  if (!complaint) return res.status(404).json({ error: 'Not found' });

  const isAssignedEngineer = parseInt(complaint.assignedTo) === parseInt(req.currentUser.id);
  const canManage = ['manager','admin','superadmin'].includes(req.currentUser.role);
  
  if (!isAssignedEngineer && !canManage) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const engineerId = complaint.assignedTo;
  complaint.assignedTo = null;
  complaint.status = 'pending';
  await complaint.save();

  const status = await EngineerStatus.findOne({ where: { engineerId } });
  if (status) {
    status.status = 'free';
    await status.save();
  }

  res.json(complaint);
}

async function updateStatus(req, res){
  const { id } = req.params;
  const { status, description } = req.body;
  const allowed = ['pending','assigned','in_progress','completed','closed'];
  if(!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const complaint = await Complaint.findByPk(id);
  if(!complaint) return res.status(404).json({ error: 'Not found' });

  // Only assigned engineer or higher roles can transition
  const isAssignedEngineer = parseInt(complaint.assignedTo) === parseInt(req.currentUser.id);
  const canManage = ['manager','admin','superadmin'].includes(req.currentUser.role);
  if(!isAssignedEngineer && !canManage){
    return res.status(403).json({ error: 'Forbidden' });
  }

  complaint.status = status;
  if(status === 'in_progress'){
    complaint.checkInTime = new Date();
    if(description) complaint.description = description;
    // engineer is now busy
    const engStatus = await EngineerStatus.findOne({ where: { engineerId: complaint.assignedTo } });
    if(engStatus){
      engStatus.status = 'busy';
      engStatus.checkInTime = new Date();
      await engStatus.save();
    }
  }
  await complaint.save();
  res.json(complaint);
}

async function completeComplaint(req, res){
  const { id } = req.params;
  const { workPerformed, solutionNotes, sparesUsed } = req.body;
  const complaint = await Complaint.findByPk(id);
  if(!complaint) return res.status(404).json({ error: 'Not found' });

  const isAssignedEngineer = parseInt(complaint.assignedTo) === parseInt(req.currentUser.id);
  const canManage = ['manager','admin','superadmin'].includes(req.currentUser.role);
  if(!isAssignedEngineer && !canManage){
    return res.status(403).json({ error: 'Forbidden' });
  }

  complaint.status = 'completed';
  if(solutionNotes) complaint.solutionNotes = solutionNotes;
  if(workPerformed) complaint.description = workPerformed;
  complaint.sparesUsed = parseSpares(sparesUsed);
  await complaint.save();

  await ServiceHistory.create({
    complaintId: id,
    workPerformed,
    solutionNotes: solutionNotes || workPerformed,
    sparesUsed: parseSpares(sparesUsed),
    engineerId: complaint.assignedTo
  });

  const engStatus = await EngineerStatus.findOne({ where: { engineerId: complaint.assignedTo } });
  if(engStatus){
    engStatus.status = 'free';
    engStatus.checkOutTime = new Date();
    await engStatus.save();
  }

  res.json(complaint);
}

async function closeComplaint(req, res){
  const { id } = req.params;
  const { solutionNotes } = req.body;
  if(!solutionNotes) return res.status(400).json({ error: 'Notes required for closing' });

  const complaint = await Complaint.findByPk(id);
  if(!complaint) return res.status(404).json({ error: 'Not found' });

  const isAssignedEngineer = parseInt(complaint.assignedTo) === parseInt(req.currentUser.id);
  const canManage = ['manager','admin','superadmin'].includes(req.currentUser.role);
  if(!isAssignedEngineer && !canManage){
    return res.status(403).json({ error: 'Forbidden' });
  }

  complaint.status = 'closed';
  complaint.solutionNotes = solutionNotes;
  await complaint.save();

  await ServiceHistory.create({
    complaintId: id,
    solutionNotes,
    engineerId: complaint.assignedTo
  });

  const engStatus = await EngineerStatus.findOne({ where: { engineerId: complaint.assignedTo } });
  if(engStatus){
    engStatus.status = 'free';
    engStatus.checkOutTime = new Date();
    await engStatus.save();
  }

  res.json(complaint);
}

async function deleteComplaint(req, res){
  const { id } = req.params;
  const complaint = await Complaint.findByPk(id);
  if(!complaint) return res.status(404).json({ error: 'Not found' });

  await complaint.destroy();
  res.json({ ok: true });
}

async function summary(req, res){
  const statusCounts = await Complaint.findAll({
    attributes: ['status', [fn('COUNT', col('status')), 'count']],
    group: ['status']
  });

  const cityCounts = await Complaint.findAll({
    attributes: [[col('Customer.city'), 'city'], [fn('COUNT', col('Complaint.id')), 'count']],
    include: [{ model: Customer, attributes: [] }],
    group: ['Customer.city']
  });

  const engineerCounts = await Complaint.findAll({
    attributes: ['assignedTo', [fn('COUNT', col('assignedTo')), 'count']],
    group: ['assignedTo'],
    include: [{ model: User, as: 'engineer', attributes: ['id','name','role'] }]
  });

  res.json({ statusCounts, cityCounts, engineerCounts });
}

async function startWork(req, res){
  const { id } = req.params;
  const complaint = await Complaint.findByPk(id);
  if(!complaint) return res.status(404).json({ error: 'Not found' });

  complaint.workStatus = 'started';
  await complaint.save();
  res.json(complaint);
}

// Auto-assign complaint to best qualified engineer
async function autoAssign(req, res) {
  const { id } = req.params;
  const complaint = await Complaint.findByPk(id, {
    include: [Machine, Customer]
  });
  if (!complaint) return res.status(404).json({ error: 'Not found' });

  try {
    const { EngineerSkill, EngineerStatus: EngStatus } = require('../models');
    
    // Get all available engineers
    const engineers = await User.findAll({
      where: { role: 'engineer', status: 'active' },
      include: [
        { model: EngineerSkill, as: 'skills' },
        { model: EngStatus }
      ]
    });

    // Get machine type to match skills
    const machineType = complaint.Machine?.model || '';
    const issueCategories = complaint.issueCategories || [];

    // Score each engineer
    const scoredEngineers = engineers.map(eng => {
      let score = 0;
      const status = eng.EngineerStatus;
      
      // Prefer free engineers (+10)
      if (status?.status === 'free') score += 10;
      else if (status?.status === 'busy') score -= 5;
      
      // Check skills match
      const skills = eng.skills || [];
      skills.forEach(skill => {
        // Machine type match
        if (machineType.toLowerCase().includes(skill.skillName.toLowerCase())) {
          score += 5;
          if (skill.proficiencyLevel === 'expert') score += 3;
          else if (skill.proficiencyLevel === 'advanced') score += 2;
        }
        
        // Issue category match
        if (issueCategories.some(cat => 
          skill.skillName.toLowerCase().includes(cat.toLowerCase()) ||
          cat.toLowerCase().includes(skill.skillName.toLowerCase())
        )) {
          score += 4;
        }
      });

      // Experience bonus
      const totalYears = skills.reduce((sum, s) => sum + (s.yearsOfExperience || 0), 0);
      score += Math.min(totalYears / 2, 5); // Max 5 bonus points

      return { engineer: eng, score };
    });

    // Sort by score descending
    scoredEngineers.sort((a, b) => b.score - a.score);

    if (scoredEngineers.length === 0) {
      return res.status(404).json({ error: 'No available engineers found' });
    }

    // Get best match
    const bestMatch = scoredEngineers[0];
    
    // Assign the complaint
    complaint.assignedTo = bestMatch.engineer.id;
    complaint.status = 'assigned';
    await complaint.save();

    // Update engineer status
    const engStatus = await EngStatus.findOne({ where: { engineerId: bestMatch.engineer.id } });
    if (engStatus) {
      engStatus.status = 'busy';
      await engStatus.save();
    }

    res.json({
      success: true,
      complaint,
      assignedTo: {
        id: bestMatch.engineer.id,
        name: bestMatch.engineer.name,
        score: bestMatch.score
      },
      alternatives: scoredEngineers.slice(1, 4).map(e => ({
        id: e.engineer.id,
        name: e.engineer.name,
        score: e.score
      }))
    });
  } catch (error) {
    console.error('Auto-assign error:', error);
    res.status(500).json({ error: 'Failed to auto-assign' });
  }
}

// Get suggested engineer for a complaint
async function getSuggestedEngineers(req, res) {
  const { id } = req.params;
  const complaint = await Complaint.findByPk(id, { include: [Machine] });
  if (!complaint) return res.status(404).json({ error: 'Not found' });

  try {
    const { EngineerSkill, EngineerStatus: EngStatus } = require('../models');
    
    const engineers = await User.findAll({
      where: { role: 'engineer', status: 'active' },
      include: [
        { model: EngineerSkill, as: 'skills' },
        { model: EngStatus }
      ]
    });

    const machineType = complaint.Machine?.model || '';
    const issueCategories = complaint.issueCategories || [];

    const suggestions = engineers.map(eng => {
      const skills = eng.skills || [];
      const matchingSkills = skills.filter(skill => 
        machineType.toLowerCase().includes(skill.skillName.toLowerCase()) ||
        issueCategories.some(cat => skill.skillName.toLowerCase().includes(cat.toLowerCase()))
      );

      const status = eng.EngineerStatus;
      
      return {
        id: eng.id,
        name: eng.name,
        email: eng.email,
        status: status?.status || 'unknown',
        matchingSkills: matchingSkills.map(s => ({
          name: s.skillName,
          level: s.proficiencyLevel,
          years: s.yearsOfExperience
        })),
        totalSkills: skills.length,
        isAvailable: status?.status === 'free'
      };
    });

    // Sort by matching skills count and availability
    suggestions.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      return b.matchingSkills.length - a.matchingSkills.length;
    });

    res.json({ success: true, suggestions: suggestions.slice(0, 5) });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
}

// Get full ticket details with timeline, comments, and creator info
async function getTicketDetails(req, res) {
  const { id } = req.params;
  
  try {
    const { Message, AuditLog } = require('../models');
    
    // Get complaint with all relations
    const complaint = await Complaint.findByPk(id, {
      include: [
        { model: Customer, attributes: ['id', 'name', 'companyName', 'contact', 'email', 'city', 'address'] },
        { model: Machine, attributes: ['id', 'model', 'serialNumber', 'mobileNumbers'] },
        { model: User, as: 'engineer', attributes: { exclude: ['passwordHash'] } }
      ]
    });

    if (!complaint) return res.status(404).json({ error: 'Ticket not found' });

    // Get creator info
    const creator = await User.findOne({
      where: { id: complaint.createdBy || null },
      attributes: { exclude: ['passwordHash'] }
    }).catch(() => null);

    // Get all comments/messages for this ticket
    const messages = await Message.findAll({
      where: { 
        complaintId: id,
        threadType: 'complaint'
      },
      include: [
        { model: User, as: 'sender', attributes: { exclude: ['passwordHash'] } }
      ],
      order: [['createdAt', 'ASC']]
    }).catch(() => []);

    // Get audit logs related to this complaint
    const auditLogs = await AuditLog.findAll({
      where: { 
        resource: 'complaint',
        resourceId: String(id)
      },
      order: [['createdAt', 'ASC']]
    }).catch(() => []);

    // Get service history (work done)
    const serviceHistory = await ServiceHistory.findAll({
      where: { complaintId: id },
      include: [{ model: User, as: 'engineer', attributes: { exclude: ['passwordHash'] } }],
      order: [['createdAt', 'ASC']]
    }).catch(() => []);

    // Build timeline events from different sources
    const timelineEvents = [];

    // Add complaint creation event
    if (complaint.createdAt) {
      timelineEvents.push({
        id: `complaint-created-${id}`,
        type: 'complaint_created',
        timestamp: complaint.complaintDate || complaint.createdAt,
        actor: creator,
        actorName: creator?.name || 'System',
        actorRole: creator?.role || 'system',
        description: `Ticket created: ${complaint.problem}`,
        details: {
          ticketId: complaint.complaintId,
          problem: complaint.problem,
          priority: complaint.priority
        }
      });
    }

    // Add assignment events from audit logs
    auditLogs.forEach(log => {
      if (log.action === 'ASSIGN' || log.action.includes('assign')) {
        const newValue = log.newValue ? JSON.parse(log.newValue) : {};
        timelineEvents.push({
          id: `audit-${log.id}`,
          type: 'assigned',
          timestamp: log.createdAt,
          actor: { id: log.userId, name: log.userName, role: log.userRole },
          actorName: log.userName || 'System',
          actorRole: log.userRole,
          description: `Assigned to engineer`,
          details: newValue
        });
      } else if (log.action === 'UPDATE' && log.description?.includes('status')) {
        timelineEvents.push({
          id: `audit-${log.id}`,
          type: 'status_changed',
          timestamp: log.createdAt,
          actor: { id: log.userId, name: log.userName, role: log.userRole },
          actorName: log.userName || 'System',
          actorRole: log.userRole,
          description: log.description,
          details: { previousValue: log.previousValue, newValue: log.newValue }
        });
      }
    });

    // Add service history events (work done)
    serviceHistory.forEach(history => {
      timelineEvents.push({
        id: `service-${history.id}`,
        type: 'work_logged',
        timestamp: history.createdAt,
        actor: history.engineer,
        actorName: history.engineer?.name || 'Unknown Engineer',
        actorRole: 'engineer',
        description: `Work completed`,
        details: {
          workPerformed: history.workPerformed,
          solutionNotes: history.solutionNotes,
          sparesUsed: history.sparesUsed
        }
      });
    });

    // Add status change events from complaint timestamps
    if (complaint.assignedAt) {
      timelineEvents.push({
        id: `status-assigned-${id}`,
        type: 'status_changed',
        timestamp: complaint.assignedAt,
        description: `Status changed to: assigned`,
        details: { status: 'assigned' }
      });
    }

    if (complaint.checkInTime) {
      timelineEvents.push({
        id: `work-started-${id}`,
        type: 'work_started',
        timestamp: complaint.checkInTime,
        actor: complaint.engineer,
        actorName: complaint.engineer?.name || 'Engineer',
        description: `Work started on ticket`,
        details: { description: complaint.description }
      });
    }

    if (complaint.resolvedAt) {
      timelineEvents.push({
        id: `resolved-${id}`,
        type: 'resolved',
        timestamp: complaint.resolvedAt,
        description: `Ticket resolved`,
        details: { solutionNotes: complaint.solutionNotes }
      });
    }

    if (complaint.closedAt) {
      timelineEvents.push({
        id: `closed-${id}`,
        type: 'closed',
        timestamp: complaint.closedAt,
        description: `Ticket closed`,
        details: { solutionNotes: complaint.solutionNotes }
      });
    }

    // Sort timeline by timestamp
    timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Add comments/messages to timeline
    messages.forEach(msg => {
      timelineEvents.push({
        id: `message-${msg.id}`,
        type: 'comment',
        timestamp: msg.createdAt,
        actor: msg.sender,
        actorName: msg.sender?.name || 'Unknown',
        actorRole: msg.sender?.role,
        description: 'Added a comment',
        details: {
          content: msg.content,
          attachments: msg.attachments || []
        }
      });
    });

    // Re-sort to include messages in chronological order
    timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      ticket: {
        id: complaint.id,
        complaintId: complaint.complaintId,
        problem: complaint.problem,
        priority: complaint.priority,
        status: complaint.status,
        workStatus: complaint.workStatus,
        description: complaint.description,
        solutionNotes: complaint.solutionNotes,
        issueCategories: complaint.issueCategories,
        attachments: complaint.attachments,
        sparesUsed: complaint.sparesUsed,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        complaintDate: complaint.complaintDate,
        checkInTime: complaint.checkInTime,
        assignedAt: complaint.assignedAt,
        resolvedAt: complaint.resolvedAt,
        closedAt: complaint.closedAt,
        customer: complaint.Customer,
        machine: complaint.Machine,
        engineer: complaint.engineer,
        assignedTo: complaint.assignedTo
      },
      creator: creator || null,
      timeline: timelineEvents,
      comments: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        createdAt: msg.createdAt,
        attachments: msg.attachments || [],
        mentions: msg.mentions || []
      })),
      statistics: {
        totalComments: messages.length,
        totalTimelineEvents: timelineEvents.length,
        daysOpen: complaint.closedAt 
          ? Math.floor((new Date(complaint.closedAt) - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24))
          : Math.floor((new Date() - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
}

// Add comment to ticket
async function addTicketComment(req, res) {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  try {
    const { Message } = require('../models');

    // Verify complaint exists
    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ error: 'Ticket not found' });

    // Create message/comment
    const message = await Message.create({
      threadType: 'complaint',
      complaintId: id,
      senderId: req.currentUser.id,
      content: content.trim()
    });

    // Reload with sender info
    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: { exclude: ['passwordHash'] } }
      ]
    });

    res.status(201).json({
      comment: {
        id: populatedMessage.id,
        content: populatedMessage.content,
        sender: populatedMessage.sender,
        createdAt: populatedMessage.createdAt,
        attachments: populatedMessage.attachments || []
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

// Get next service number
async function getNextServiceNo(req, res) {
  try {
    const lastComplaint = await Complaint.findOne({
      order: [['complaintId', 'DESC']],
      attributes: ['complaintId']
    });

    let nextNo = 1;
    if (lastComplaint && lastComplaint.complaintId) {
      const match = lastComplaint.complaintId.match(/\d+/);
      if (match) {
        nextNo = parseInt(match[0]) + 1;
      }
    }

    const timestamp = Date.now();
    const serviceNo = `TKT-${timestamp}${String(nextNo).padStart(3, '0')}`;

    res.json({ serviceNo, nextNumber: nextNo });
  } catch (error) {
    console.error('Get next service number error:', error);
    res.status(500).json({ error: 'Failed to generate service number' });
  }
}

// Lookup complaint by service number
async function lookupByServiceNo(req, res) {
  try {
    const { serviceNo } = req.params;
    const complaint = await Complaint.findOne({
      where: { complaintId: serviceNo },
      include: [
        Customer,
        Machine,
        { model: User, as: 'engineer', attributes: { exclude: ['passwordHash'] } }
      ]
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Service number not found' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Lookup service number error:', error);
    res.status(500).json({ error: 'Failed to lookup service number' });
  }
}

module.exports = { listComplaints, createComplaint, updateComplaint, deleteComplaint, assignComplaint, unassignComplaint, updateStatus, completeComplaint, closeComplaint, summary, startWork, autoAssign, getSuggestedEngineers, getTicketDetails, addTicketComment, getNextServiceNo, lookupByServiceNo };