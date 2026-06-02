const express = require('express');
const router = express.Router();
const {
  submitProposal,
  getProposals,
  approveProposal,
  rejectProposal,
  createDirectEvent,
  getAllEvents,
  getEventById,
  toggleEventRegistration,
  toggleEventReminder,
  updateEventOrganizerConsole,
  submitEventFeedback
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Proposals Routes
router.route('/proposals')
  .post(protect, authorize('student'), submitProposal)
  .get(protect, authorize('student', 'coordinator'), getProposals);

router.patch('/proposals/:id/approve', protect, authorize('coordinator'), approveProposal);
router.patch('/proposals/:id/reject', protect, authorize('coordinator'), rejectProposal);

// Event Page Routes
router.post('/direct', protect, authorize('coordinator'), createDirectEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.post('/:id/register', protect, authorize('student'), toggleEventRegistration);
router.post('/:id/notify', protect, authorize('student'), toggleEventReminder);
router.patch('/:id/organizer', protect, authorize('student'), updateEventOrganizerConsole);
router.post('/:id/feedback', protect, authorize('student'), submitEventFeedback);

module.exports = router;
