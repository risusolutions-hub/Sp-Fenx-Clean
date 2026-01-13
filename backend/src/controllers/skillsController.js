const { EngineerSkill, Certification, User } = require('../models');

// Add skill to engineer
exports.addSkill = async (req, res) => {
  try {
    const { engineerId, skillName, proficiencyLevel, yearsOfExperience } = req.body;
    const verifiedBy = req.currentUser.role === 'manager' ? req.currentUser.id : null;

    const skill = await EngineerSkill.create({
      engineerId,
      skillName,
      proficiencyLevel,
      yearsOfExperience,
      verifiedBy,
      verifiedAt: verifiedBy ? new Date() : null
    });

    res.status(201).json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get engineer skills
exports.getEngineerSkills = async (req, res) => {
  try {
    const { engineerId } = req.params;

    const skills = await EngineerSkill.findAll({
      where: { engineerId },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update skill
exports.updateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { proficiencyLevel, yearsOfExperience } = req.body;

    const skill = await EngineerSkill.findByPk(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    await skill.update({
      proficiencyLevel,
      yearsOfExperience
    });

    res.json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const skill = await EngineerSkill.findByPk(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    await skill.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add certification
exports.addCertification = async (req, res) => {
  try {
    const {
      engineerId,
      certificationName,
      issuingBody,
      certificationNumber,
      issuedAt,
      expiresAt,
      documentUrl
    } = req.body;

    const certification = await Certification.create({
      engineerId,
      certificationName,
      issuingBody,
      certificationNumber,
      issuedAt,
      expiresAt,
      documentUrl,
      status: expiresAt ? (new Date(expiresAt) < new Date() ? 'expired' : 'active') : 'active'
    });

    res.status(201).json({ success: true, certification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get engineer certifications
exports.getEngineerCertifications = async (req, res) => {
  try {
    const { engineerId } = req.params;

    const certifications = await Certification.findAll({
      where: { engineerId },
      order: [['expiresAt', 'ASC']]
    });

    // Check and update expired status
    const updated = certifications.map(cert => {
      const isExpired = cert.expiresAt && new Date(cert.expiresAt) < new Date();
      const expiringIn30Days = cert.expiresAt && 
        (new Date(cert.expiresAt) - new Date()) < 30 * 24 * 60 * 60 * 1000;

      return {
        ...cert.dataValues,
        isExpired,
        expiringIn30Days
      };
    });

    res.json({ success: true, certifications: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expiring certifications (for notifications)
exports.getExpiringCertifications = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const certifications = await Certification.findAll({
      where: {
        expiresAt: {
          [Op.between]: [new Date(), thirtyDaysFromNow]
        },
        status: { [Op.ne]: 'expired' }
      },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['expiresAt', 'ASC']]
    });

    res.json({ success: true, certifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update certification
exports.updateCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;
    const { certificationName, issuingBody, issuedAt, expiresAt, documentUrl } = req.body;

    const cert = await Certification.findByPk(certificationId);
    if (!cert) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    await cert.update({
      certificationName,
      issuingBody,
      issuedAt,
      expiresAt,
      documentUrl,
      status: expiresAt ? (new Date(expiresAt) < new Date() ? 'expired' : 'active') : 'active'
    });

    res.json({ success: true, certification: cert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete certification
exports.deleteCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;

    const cert = await Certification.findByPk(certificationId);
    if (!cert) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    await cert.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
