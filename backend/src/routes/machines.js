const express = require('express');
const router = express.Router();
const { requireLogin, loadCurrentUser, roleAtLeast } = require('../middleware/auth');
const { listMachines, createMachine, updateMachine, deleteMachine } = require('../controllers/machineController');

router.use(loadCurrentUser);
router.use(requireLogin);

router.get('/', roleAtLeast('manager'), listMachines);
router.post('/', requireLogin, createMachine);
router.put('/:id', roleAtLeast('manager'), updateMachine);
router.delete('/:id', roleAtLeast('admin'), deleteMachine);

module.exports = router;