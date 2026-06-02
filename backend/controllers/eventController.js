const Event = require('../models/Event');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const CalendarEntry = require('../models/CalendarEntry');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');

// ==========================================
// 1. STUDENT PROPOSAL WORKFLOW
// ==========================================

// @desc    Submit an Event Proposal
// @route   POST /api/events/proposals
// @access  Private (Student Only)
exports.submitProposal = async (req, res) => {
  try {
    const { title, category, summary, description } = req.body;

    if (!title || !category || !summary || !description) {
      return res.status(400).json({ success: false, message: 'Please provide all proposal inputs.' });
    }

    const newProposal = await Proposal.create({
      title,
      category,
      summary,
      description,
      student: req.user._id,
      studentName: req.user.name,
      studentRoll: req.user.rollNo
    });

    // Notify coordinator (in mock, we can auto-log notifications)
    await Notification.create({
      user: req.user._id, // notify student that proposal is logged
      title: 'Proposal Logged',
      message: `Your request for "${title}" has been sent to the Academic Coordinator.`,
      type: 'alert'
    });

    return res.status(201).json({ success: true, message: 'Proposal submitted to coordinator.', proposal: newProposal });

  } catch (error) {
    console.error(`Submit Proposal Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during proposal submission.' });
  }
};

// @desc    Get Proposals (Students see theirs, Coordinators see all pending)
// @route   GET /api/events/proposals
// @access  Private (Student/Coordinator)
exports.getProposals = async (req, res) => {
  try {
    let proposals;

    if (req.user.role === 'coordinator') {
      // Coordinators view all pending proposals
      proposals = await Proposal.find({ status: 'Pending' }).sort({ createdAt: -1 });
    } else {
      // Students view their own submitted proposals
      proposals = await Proposal.find({ student: req.user._id }).sort({ createdAt: -1 });
    }

    return res.json({ success: true, count: proposals.length, proposals });

  } catch (error) {
    console.error(`Get Proposals Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving proposals.' });
  }
};

// ==========================================
// 2. COORDINATOR APPROVAL WORKFLOW
// ==========================================

// @desc    Approve and Schedule Event Proposal
// @route   PATCH /api/events/proposals/:id/approve
// @access  Private (Coordinator Only)
exports.approveProposal = async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'Please provide scheduling Date and Time.' });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    if (proposal.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Proposal already processed as: ${proposal.status}` });
    }

    // ⚠️ DYNAMIC CLASH PROTECTION SYSTEM
    // Query database to ensure no scheduled event occupies this date
    const clashingEvent = await Event.findOne({ date: date });
    if (clashingEvent) {
      return res.status(400).json({
        success: false,
        message: `Time Clash Alert: Event "${clashingEvent.title}" is already scheduled on ${date}. Please select another date.`
      });
    }

    // Update status
    proposal.status = 'Approved';
    await proposal.save();

    // 1. Create Event Page automatically
    const newEvent = await Event.create({
      title: proposal.title,
      category: proposal.category,
      summary: proposal.summary,
      description: proposal.description,
      date,
      time,
      organizer: proposal.student,
      organizerName: proposal.studentName,
      organizerRoll: proposal.studentRoll,
      status: 'Upcoming',
      posterPreset: 'tech' // Default layout setting
    });

    // 2. Schedule Event indicator on interactive calendar
    await CalendarEntry.create({
      date,
      title: `Event: ${newEvent.title}`,
      type: 'special',
      createdBy: req.user._id
    });

    // 3. Post a global scrolling announcement notice (notifying before 3 days)
    await Notice.create({
      message: `📢 UPCOMING EVENT: "${newEvent.title}" is scheduled on ${date} at ${time}. Registrations are open on the hub!`
    });

    // 4. Send targeted approval notification to student organizer
    await Notification.create({
      user: proposal.student,
      title: 'Proposal Approved! 🎉',
      message: `Congratulations! Your event "${newEvent.title}" has been scheduled for ${date} at ${time}. You now have Organizer Console access.`,
      type: 'approval'
    });

    return res.json({ success: true, message: 'Proposal approved, event page scheduled successfully.', event: newEvent });

  } catch (error) {
    console.error(`Approve Proposal Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during proposal approval.' });
  }
};

// @desc    Reject Event Proposal
// @route   PATCH /api/events/proposals/:id/reject
// @access  Private (Coordinator Only)
exports.rejectProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    if (proposal.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Proposal already processed as: ${proposal.status}` });
    }

    proposal.status = 'Rejected';
    await proposal.save();

    // Notify student
    await Notification.create({
      user: proposal.student,
      title: 'Proposal Rejected ⚠️',
      message: `Your event proposal "${proposal.title}" has been reviewed and rejected by the Academic Coordinator.`,
      type: 'alert'
    });

    return res.json({ success: true, message: 'Proposal rejected successfully.' });

  } catch (error) {
    console.error(`Reject Proposal Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during proposal rejection.' });
  }
};

// @desc    Create Event Page directly and grant organizer access
// @route   POST /api/events/direct
// @access  Private (Coordinator Only)
exports.createDirectEvent = async (req, res) => {
  try {
    const { title, category, summary, description, date, time, organizerRoll } = req.body;

    if (!title || !category || !summary || !description || !date || !time || !organizerRoll) {
      return res.status(400).json({ success: false, message: 'Please provide event details, schedule, and student coordinator roll number.' });
    }

    const studentCoordinator = await User.findOne({
      rollNo: organizerRoll.toUpperCase(),
      role: 'student'
    });

    if (!studentCoordinator) {
      return res.status(404).json({ success: false, message: 'No active student account found for this roll number.' });
    }

    const clashingEvent = await Event.findOne({ date });
    if (clashingEvent) {
      return res.status(400).json({
        success: false,
        message: `Time Clash Alert: Event "${clashingEvent.title}" is already scheduled on ${date}. Please select another date.`
      });
    }

    const posterPreset = category === 'Cultural' ? 'cultural' : category === 'Sports' ? 'sports' : 'tech';

    const newEvent = await Event.create({
      title,
      category,
      summary,
      description,
      date,
      time,
      organizer: studentCoordinator._id,
      organizerName: studentCoordinator.name,
      organizerRoll: studentCoordinator.rollNo,
      status: 'Upcoming',
      posterPreset
    });

    await CalendarEntry.create({
      date,
      title: `Event: ${newEvent.title}`,
      type: 'special',
      createdBy: req.user._id
    });

    await Notice.create({
      message: `UPCOMING EVENT: "${newEvent.title}" is scheduled on ${date} at ${time}. Registrations are open on the hub!`
    });

    await Notification.create({
      user: studentCoordinator._id,
      title: 'Organizer Access Granted',
      message: `You have been assigned as student coordinator for "${newEvent.title}". Open the event page to use the Organizer Console.`,
      type: 'approval'
    });

    return res.status(201).json({ success: true, message: 'Event page created and student coordinator access granted.', event: newEvent });

  } catch (error) {
    console.error(`Create Direct Event Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error creating event page.' });
  }
};

// ==========================================
// 3. EVENT PAGE INTERACTIVITY & REGISTRY
// ==========================================

// @desc    Get All Active Events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    // Apply category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Apply status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Apply search query (title or summary matching)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query).sort({ date: 1, time: 1 });
    return res.json({ success: true, count: events.length, events });

  } catch (error) {
    console.error(`Get All Events Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving events.' });
  }
};

// @desc    Get Single Event Details
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    return res.json({ success: true, event });
  } catch (error) {
    console.error(`Get Event Details Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving event details.' });
  }
};

// @desc    Toggle Registration for Event
// @route   POST /api/events/:id/register
// @access  Private (Student Only)
exports.toggleEventRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot register for a completed event.' });
    }

    const index = event.registeredStudents.indexOf(req.user._id);
    let registered = false;

    if (index === -1) {
      event.registeredStudents.push(req.user._id);
      registered = true;
      
      // In-app alert
      await Notification.create({
        user: req.user._id,
        title: 'Registered Successfully! 🎫',
        message: `You registered for "${event.title}". You will receive a reminder 30m prior to start.`,
        type: 'alert'
      });
    } else {
      event.registeredStudents.splice(index, 1);
      registered = false;
    }

    await event.save();
    return res.json({ success: true, registered, count: event.registeredStudents.length });

  } catch (error) {
    console.error(`Toggle Registration Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error toggling event registration.' });
  }
};

// @desc    Toggle 30-min Reminder preference
// @route   POST /api/events/:id/notify
// @access  Private (Student Only)
exports.toggleEventReminder = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // In a fully deployed context, we schedule standard agenda/cron.
    // For this full-stack SPA showcase, we instantly generate an active mock reminder notification to trigger and register preferences.
    await Notification.create({
      user: req.user._id,
      title: '⏰ Event Reminder Configured',
      message: `Reminder set! You will be alerted 30 minutes before "${event.title}" starts.`,
      type: 'reminder'
    });

    return res.json({ success: true, message: 'Reminder configured successfully.' });

  } catch (error) {
    console.error(`Toggle Event Reminder Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error configuring reminder.' });
  }
};

// ==========================================
// 4. STUDENT ORGANIZER PAGE CONFIGURATION
// ==========================================

// @desc    Modify Event Details (Organizer Console)
// @route   PATCH /api/events/:id/organizer
// @access  Private (Student Organizer Only)
exports.updateEventOrganizerConsole = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Verify requesting user is the designated organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not the authorized organizer for this event.' });
    }

    const { status, summary, description, posterPreset, posterUrl, gFormLink, ndliLink, photos, winners } = req.body;

    if (typeof summary === 'string' && !summary.trim()) {
      return res.status(400).json({ success: false, message: 'Event summary cannot be empty.' });
    }

    if (typeof description === 'string' && !description.trim()) {
      return res.status(400).json({ success: false, message: 'Event description cannot be empty.' });
    }

    // Update variables
    if (status) event.status = status;
    if (typeof summary === 'string') event.summary = summary.trim();
    if (typeof description === 'string') event.description = description.trim();
    if (posterPreset) event.posterPreset = posterPreset;
    if (typeof posterUrl === 'string') event.posterUrl = posterUrl;
    if (typeof gFormLink === 'string') event.gFormLink = gFormLink;
    if (typeof ndliLink === 'string') event.ndliLink = ndliLink;
    if (Array.isArray(photos)) event.photos = photos.filter(Boolean);
    
    // Save winners arrays (rank 1, 2, 3 name & roll)
    if (Array.isArray(winners)) {
      event.winners = winners
        .filter(w => w.name && w.roll && [1, 2, 3].includes(Number(w.rank)))
        .map(w => ({ rank: Number(w.rank), name: w.name, roll: w.roll.toUpperCase() }));
    }

    await event.save();

    // Trigger scrolling notices if organizer marks it complete
    if (status === 'Completed' && winners && winners.length > 0) {
      const topWinner = winners.find(w => w.rank === 1);
      if (topWinner) {
        await Notice.create({
          message: `🏆 CHAMPION CONGRATS: ${topWinner.name} (${topWinner.roll}) secured 1st Place in "${event.title}"! Scroll the Winners Board to celebrate.`
        });
      }
    }

    return res.json({ success: true, message: 'Organizer console modifications saved successfully.', event });

  } catch (error) {
    console.error(`Organizer Console Update Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error saving organizer changes.' });
  }
};

// ==========================================
// 5. STAR FEEDBACK RATINGS & BADGES REWARDS
// ==========================================

// @desc    Submit Star Rating Feedback
// @route   POST /api/events/:id/feedback
// @access  Private (Student Only)
exports.submitEventFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: 'Please select a star rating (1 to 5).' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Feedback rating is allowed only for Completed events.' });
    }

    // 1. Verify student was registered for this event
    const registered = event.registeredStudents.includes(req.user._id);
    if (!registered) {
      return res.status(400).json({ success: false, message: 'Only registered event participants can leave feedback.' });
    }

    // 2. Prevent duplicate reviews
    const reviewed = event.feedbacks.some(f => f.student.toString() === req.user._id.toString());
    if (reviewed) {
      return res.status(400).json({ success: false, message: 'You have already submitted feedback for this event.' });
    }

    // 3. Log review
    event.feedbacks.push({
      student: req.user._id,
      studentRoll: req.user.rollNo,
      rating,
      comment
    });

    await event.save();

    // ⚠️ 4. FEEDBACK FORMULA: Re-compute Satisfaction Percentage
    // Percentage = (Sum of stars) / (Total reviews * 5) * 100
    const totalStars = event.feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const calculatedPercentage = Math.round((totalStars / (event.feedbacks.length * 5)) * 100);

    // 5. Update Organizer Profile Badge
    const organizer = await User.findById(event.organizer);
    if (organizer) {
      const badgeIdx = organizer.badges.findIndex(b => b.eventId.toString() === event._id.toString());
      const badgeData = {
        eventId: event._id,
        badgeName: `🏆 Organizer: ${event.title}`,
        rating: calculatedPercentage
      };

      if (badgeIdx !== -1) {
        organizer.badges[badgeIdx] = badgeData;
      } else {
        organizer.badges.push(badgeData);
      }

      await organizer.save();

      // Post dynamic congratulatory notice bulletin
      await Notice.create({
        message: `✦ Kudos to student organizer ${organizer.name}! Event "${event.title}" rated highly at ${calculatedPercentage}% satisfaction score!`
      });
    }

    return res.json({ success: true, message: 'Feedback rating submitted successfully!', percentage: calculatedPercentage });

  } catch (error) {
    console.error(`Submit Feedback Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error saving feedback.' });
  }
};

// ==========================================
// 6. COORDINATOR EVENT MANAGEMENT
// ==========================================

// @desc    Delete Event from Home Page
// @route   DELETE /api/events/:id
// @access  Private (Coordinator Only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Get event title for notification
    const eventTitle = event.title;
    const eventId = event._id;

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    // Delete associated calendar entries
    await CalendarEntry.deleteMany({ title: { $regex: eventTitle } });

    // Create notification for organizer
    await Notification.create({
      user: event.organizer,
      title: 'Event Removed by Coordinator ⚠️',
      message: `Your event "${eventTitle}" has been removed from the home page by the Academic Coordinator.`,
      type: 'alert'
    });

    // Post announcement notice about removal
    await Notice.create({
      message: `📢 Event Update: "${eventTitle}" has been removed from the event listings.`
    });

    return res.json({ success: true, message: `Event "${eventTitle}" successfully removed from home page.` });

  } catch (error) {
    console.error(`Delete Event Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error deleting event.' });
  }
};
