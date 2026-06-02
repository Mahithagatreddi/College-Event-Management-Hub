const CalendarEntry = require('../models/CalendarEntry');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Event = require('../models/Event');

// ==========================================
// 1. DEPARTMENT CALENDAR METHODS
// ==========================================

// @desc    Get Calendar Entries & Scheduled Dates
// @route   GET /api/calendar
// @access  Public
exports.getCalendarEntries = async (req, res) => {
  try {
    const entries = await CalendarEntry.find({}).sort({ date: 1 });
    return res.json({ success: true, count: entries.length, entries });
  } catch (error) {
    console.error(`Get Calendar Entries Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving calendar entries.' });
  }
};

// @desc    Create Calendar Entry (Holiday, Exam, etc.)
// @route   POST /api/calendar
// @access  Private (Coordinator Only)
exports.createCalendarEntry = async (req, res) => {
  try {
    const { date, title, type } = req.body;

    if (!date || !title || !type) {
      return res.status(400).json({ success: false, message: 'Please provide date, title, and entry type.' });
    }

    // Upsert logic (if calendar day has agenda, overwrite it)
    let entry = await CalendarEntry.findOne({ date });

    if (entry) {
      entry.title = title;
      entry.type = type;
      await entry.save();
    } else {
      entry = await CalendarEntry.create({
        date,
        title,
        type,
        createdBy: req.user._id
      });
    }

    // Add Notice about holiday or exam
    await Notice.create({
      message: `📅 CALENDAR UPDATE: ${title} scheduled on ${date} (${type.toUpperCase()}).`
    });

    return res.status(201).json({ success: true, message: 'Calendar entry saved successfully.', entry });

  } catch (error) {
    console.error(`Create Calendar Entry Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error saving calendar entries.' });
  }
};

// @desc    Delete Calendar Entry
// @route   DELETE /api/calendar/:id
// @access  Private (Coordinator Only)
exports.deleteCalendarEntry = async (req, res) => {
  try {
    const entry = await CalendarEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Calendar Entry not found.' });
    }

    await entry.deleteOne();
    return res.json({ success: true, message: 'Calendar entry deleted.' });
  } catch (error) {
    console.error(`Delete Calendar Entry Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error deleting entry.' });
  }
};

// ==========================================
// 2. SCROLLING GLOBAL NOTICES (BULLETINS)
// ==========================================

// @desc    Get Scrolling Bulletins
// @route   GET /api/notices
// @access  Public
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ active: true }).sort({ createdAt: -1 }).limit(10);
    const noticeStrings = notices.map(n => n.message);
    return res.json({ success: true, count: notices.length, notices: noticeStrings });
  } catch (error) {
    console.error(`Get Notices Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving bulletin notices.' });
  }
};

// @desc    Post Notice Bulletins
// @route   POST /api/notices
// @access  Private (Coordinator Only)
exports.createNotice = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Notice message is missing.' });
    }

    const notice = await Notice.create({ message });
    return res.status(201).json({ success: true, notice });
  } catch (error) {
    console.error(`Post Notice Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error posting notice.' });
  }
};

// ==========================================
// 3. IN-APP USER NOTIFICATION CENTRES
// ==========================================

// @desc    Get Active Notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    console.error(`Get Notifications Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error loading notifications.' });
  }
};

// @desc    Mark Notification as read
// @route   PATCH /api/notifications/:id
// @access  Private
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied.' });
    }

    notification.read = true;
    await notification.save();

    return res.json({ success: true, message: 'Notification read.' });
  } catch (error) {
    console.error(`Mark Notification Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error updating notification.' });
  }
};

// ==========================================
// 4. SUPER ADMIN COORDINATORS PANEL
// ==========================================

// @desc    Get All Coordinators
// @route   GET /api/admin/coordinators
// @access  Private (Super Admin Only)
exports.getAdminCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'coordinator' }).sort({ createdAt: -1 });
    return res.json({ success: true, count: coordinators.length, coordinators });
  } catch (error) {
    console.error(`Get Coordinators Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error loading coordinators.' });
  }
};

// @desc    Create Academic Coordinator
// @route   POST /api/admin/coordinators
// @access  Private (Super Admin Only)
exports.createCoordinator = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all coordinator details.' });
    }

    const cleanUser = username.trim().toLowerCase();

    // Prevent clashing primary staff default config name
    const exists = await User.findOne({
      $or: [{ username: cleanUser }, { email: email.toLowerCase() }]
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Coordinator with this username or email already exists.' });
    }

    const newCoord = await User.create({
      name,
      email: email.toLowerCase(),
      username: cleanUser,
      password, // Password pre-save hashing triggers automatically
      role: 'coordinator',
      status: 'active'
    });

    return res.status(201).json({ success: true, message: 'Academic Coordinator account created.', coordinator: newCoord });

  } catch (error) {
    console.error(`Create Coordinator Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error creating coordinator account.' });
  }
};

// @desc    Toggle Coordinator Status (Suspend / Reactivate)
// @route   PATCH /api/admin/coordinators/:id/toggle
// @access  Private (Super Admin Only)
exports.toggleCoordinatorStatus = async (req, res) => {
  try {
    const coord = await User.findById(req.params.id);
    if (!coord || coord.role !== 'coordinator') {
      return res.status(404).json({ success: false, message: 'Coordinator not found.' });
    }

    // Safety lockout: Cannot suspend primary default coordinator
    if (coord.username === 'coordinator') {
      return res.status(400).json({ success: false, message: 'Primary seed Coordinator account cannot be suspended.' });
    }

    coord.status = coord.status === 'active' ? 'suspended' : 'active';
    await coord.save();

    return res.json({ success: true, message: `Coordinator account suspended status toggled to: ${coord.status}`, status: coord.status });

  } catch (error) {
    console.error(`Toggle Status Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error modifying coordinator status.' });
  }
};

// ==========================================
// 5. GLOBAL ANALYTICS METRICS AGGREGATION
// ==========================================

// @desc    Get Analytics Dashboard Statistics
// @route   GET /api/admin/analytics
// @access  Private (Super Admin / Coordinator)
exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({});
    const activeStudents = await User.countDocuments({ role: 'student' });
    const activeCoordinators = await User.countDocuments({ role: 'coordinator', status: 'active' });
    
    // Accumulate total registered participant counts across all events
    const allEvents = await Event.find({});
    const totalRegistrations = allEvents.reduce((sum, e) => sum + e.registeredStudents.length, 0);

    // Calculate rating breakdowns
    let totalFeedbacksCount = 0;
    let avgFeedbackRating = 0;

    allEvents.forEach(e => {
      if (e.status === 'Completed' && e.feedbacks.length > 0) {
        totalFeedbacksCount += e.feedbacks.length;
        avgFeedbackRating += e.feedbacks.reduce((sum, f) => sum + f.rating, 0);
      }
    });

    const finalAvgRating = totalFeedbacksCount > 0 ? (avgFeedbackRating / totalFeedbacksCount).toFixed(1) : 'N/A';

    return res.json({
      success: true,
      stats: {
        totalEvents,
        activeStudents,
        activeCoordinators,
        totalRegistrations,
        avgRating: finalAvgRating
      }
    });

  } catch (error) {
    console.error(`Get Analytics Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error compiling analytics statistics.' });
  }
};
