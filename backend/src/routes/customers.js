const express = require('express');
const router = express.Router();
const { requireLogin, loadCurrentUser, roleAtLeast } = require('../middleware/auth');
const { listCustomers, searchByServiceNo, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');

router.use(loadCurrentUser);
router.use(requireLogin);

router.get('/', roleAtLeast('manager'), listCustomers);
router.get('/search-by-service', requireLogin, searchByServiceNo);
router.post('/', requireLogin, createCustomer);
router.put('/:id', roleAtLeast('manager'), updateCustomer);
router.delete('/:id', roleAtLeast('admin'), deleteCustomer);

module.exports = router;