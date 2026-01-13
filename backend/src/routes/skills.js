const express = require('express');
const { requireLogin } = require('../middleware/auth');
const skillsController = require('../controllers/skillsController');

const router = express.Router();

// All routes require authentication
router.use(requireLogin);

// Skills management
router.post('/skills', skillsController.addSkill);
router.get('/engineers/:engineerId/skills', skillsController.getEngineerSkills);
router.put('/skills/:skillId', skillsController.updateSkill);
router.delete('/skills/:skillId', skillsController.deleteSkill);

// Certifications management
router.post('/certifications', skillsController.addCertification);
router.get('/engineers/:engineerId/certifications', skillsController.getEngineerCertifications);
router.get('/certifications/expiring', skillsController.getExpiringCertifications);
router.put('/certifications/:certificationId', skillsController.updateCertification);
router.delete('/certifications/:certificationId', skillsController.deleteCertification);

module.exports = router;
