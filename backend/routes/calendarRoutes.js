const express = require('express');
const router = express.Router();
const {
  getCalendarEntries,
  createCalendarEntry,
  deleteCalendarEntry,
  getNotices,
  createNotice,
  getNotifications,
  markNotificationRead,
  getAdminCoordinators,
  createCoordinator,
  toggleCoordinatorStatus,
  getAdminAnalytics
} = require('../controllers/calendarController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Calendar Dates
router.route('/')
  .get(getCalendarEntries)
  .post(protect, authorize('coordinator'), createCalendarEntry);

router.delete('/:id', protect, authorize('coordinator'), deleteCalendarEntry);

// Notices / Scrolling Bulletins
router.route('/notices')
  .get(getNotices)
  .post(protect, authorize('coordinator'), createNotice);

// User Notifications Centres
router.get('/notifications', protect, getNotifications);
router.patch('/notifications/:id', protect, markNotificationRead);

// Super Admin Staff Coordinators Management
router.route('/admin/coordinators')
  .get(protect, authorize('superadmin'), getAdminCoordinators)
  .post(protect, authorize('superadmin'), createCoordinator);

router.patch('/admin/coordinators/:id/toggle', protect, authorize('superadmin'), toggleCoordinatorStatus);

// Analytics
router.get('/admin/analytics', protect, authorize('superadmin', 'coordinator'), getAdminAnalytics);

module.exports = router;
