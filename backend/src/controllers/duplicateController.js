const { DuplicateComplaint, Complaint, Customer } = require('../models');
const { Op } = require('sequelize');

// Calculate text similarity (simple implementation)
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  // Simple word overlap calculation
  const words1 = s1.split(/\s+/).filter(w => w.length > 3);
  const words2 = s2.split(/\s+/).filter(w => w.length > 3);

  const overlap = words1.filter(w => words2.includes(w)).length;
  const total = Math.max(words1.length, words2.length);

  return overlap / total;
};

// Detect potential duplicates when creating complaint
exports.detectDuplicates = async (req, res) => {
  try {
    const { customerId, description, title } = req.body;
    const thresholdDays = 30;
    const thresholdSimilarity = 0.4;

    // Get recent complaints for this customer
    const recentDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);
    const recentComplaints = await Complaint.findAll({
      where: {
        customerId,
        createdAt: { [Op.gte]: recentDate }
      },
      attributes: ['id', 'title', 'description', 'status', 'createdAt'],
      limit: 10
    });

    // Find similar complaints
    const potentialDuplicates = recentComplaints
      .map(complaint => ({
        complaint,
        similarity: Math.max(
          calculateSimilarity(description, complaint.description || ''),
          calculateSimilarity(title, complaint.title || '')
        )
      }))
      .filter(item => item.similarity >= thresholdSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(item => ({
        ...item.complaint.dataValues,
        similarityScore: (item.similarity * 100).toFixed(0)
      }));

    res.json({
      success: true,
      potentialDuplicates,
      hasDuplicates: potentialDuplicates.length > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Link complaints as duplicates
exports.linkDuplicates = async (req, res) => {
  try {
    const { primaryComplaintId, duplicateComplaintId, linkReason, consolidationNotes } = req.body;
    const detectedBy = req.currentUser.id;

    // Calculate similarity score
    const primary = await Complaint.findByPk(primaryComplaintId);
    const duplicate = await Complaint.findByPk(duplicateComplaintId);

    const similarity = calculateSimilarity(
      primary.description || '',
      duplicate.description || ''
    );

    const link = await DuplicateComplaint.create({
      primaryComplaintId,
      duplicateComplaintId,
      similarityScore: similarity,
      linkReason,
      detectedBy,
      consolidationNotes
    });

    // Update duplicate complaint status
    await duplicate.update({
      status: 'duplicate',
      relatedComplaintId: primaryComplaintId
    });

    res.status(201).json({ success: true, link });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get duplicates for a complaint
exports.getComplaintDuplicates = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const duplicates = await DuplicateComplaint.findAll({
      where: {
        [Op.or]: [
          { primaryComplaintId: complaintId },
          { duplicateComplaintId: complaintId }
        ]
      },
      include: [
        {
          model: Complaint,
          as: 'primaryComplaint',
          attributes: ['id', 'title', 'status', 'createdAt']
        },
        {
          model: Complaint,
          as: 'duplicateComplaint',
          attributes: ['id', 'title', 'status', 'createdAt']
        }
      ]
    });

    res.json({ success: true, duplicates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Merge complaints
exports.mergeComplaints = async (req, res) => {
  try {
    const { primaryComplaintId, duplicateComplaintId, mergeNotes } = req.body;

    const primary = await Complaint.findByPk(primaryComplaintId);
    const duplicate = await Complaint.findByPk(duplicateComplaintId);

    if (!primary || !duplicate) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Combine notes
    const combinedNotes = `${primary.notes || ''}\n\n[MERGED FROM DUPLICATE ID: ${duplicateComplaintId}]\n${duplicate.notes || ''}\n${mergeNotes || ''}`;

    await primary.update({
      notes: combinedNotes,
      updatedAt: new Date()
    });

    // Mark duplicate as merged
    await duplicate.update({
      status: 'merged',
      relatedComplaintId: primaryComplaintId
    });

    // Create linking record
    await DuplicateComplaint.create({
      primaryComplaintId,
      duplicateComplaintId,
      linkReason: 'Manually merged by user',
      detectedBy: req.currentUser.id,
      consolidationNotes: mergeNotes
    });

    res.json({
      success: true,
      message: 'Complaints merged successfully',
      primary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get duplicate statistics
exports.getDuplicateStats = async (req, res) => {
  try {
    const totalDuplicates = await DuplicateComplaint.count();

    const duplicatesByReason = await DuplicateComplaint.findAll({
      attributes: ['linkReason', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      group: ['linkReason'],
      raw: true
    });

    const duplicateComplaints = await Complaint.count({
      where: { status: { [Op.in]: ['duplicate', 'merged'] } }
    });

    res.json({
      success: true,
      stats: {
        totalDuplicateLinks: totalDuplicates,
        totalAffectedComplaints: duplicateComplaints,
        duplicatesByReason
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unlink duplicates
exports.unlinkDuplicates = async (req, res) => {
  try {
    const { linkId } = req.params;

    const link = await DuplicateComplaint.findByPk(linkId);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Restore duplicate complaint status
    const duplicate = await Complaint.findByPk(link.duplicateComplaintId);
    await duplicate.update({
      status: 'pending',
      relatedComplaintId: null
    });

    await link.destroy();

    res.json({ success: true, message: 'Link removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
