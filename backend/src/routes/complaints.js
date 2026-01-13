const express = require('express');
const router = express.Router();
const { requireLogin, loadCurrentUser, roleAtLeast } = require('../middleware/auth');
const { listComplaints, createComplaint, updateComplaint, deleteComplaint, assignComplaint, unassignComplaint, updateStatus, completeComplaint, closeComplaint, summary, startWork, autoAssign, getSuggestedEngineers, getTicketDetails, addTicketComment, getNextServiceNo, lookupByServiceNo } = require('../controllers/complaintController');

router.use(loadCurrentUser);
router.use(requireLogin);

router.get('/', listComplaints);
router.get('/next-service-no', requireLogin, getNextServiceNo);
router.get('/lookup/:serviceNo', requireLogin, lookupByServiceNo);
router.get('/:id/details', requireLogin, getTicketDetails);
router.get('/summary', roleAtLeast('admin'), summary);
router.post('/', requireLogin, createComplaint);
router.put('/:id', roleAtLeast('manager'), updateComplaint);
router.delete('/:id', roleAtLeast('admin'), deleteComplaint);
router.post('/:id/assign', requireLogin, assignComplaint);
router.post('/:id/unassign', requireLogin, unassignComplaint);
router.post('/:id/auto-assign', roleAtLeast('manager'), autoAssign);
router.get('/:id/suggested-engineers', roleAtLeast('manager'), getSuggestedEngineers);
router.post('/:id/complete', roleAtLeast('engineer'), completeComplaint);
router.post('/:id/close', roleAtLeast('engineer'), closeComplaint);
router.put('/:id/status', requireLogin, updateStatus);
router.post('/:id/start-work', roleAtLeast('engineer'), startWork);
router.post('/:id/comments', requireLogin, addTicketComment);

module.exports = router;