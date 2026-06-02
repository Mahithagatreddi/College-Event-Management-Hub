require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Schemas for Seeding
const User = require('./models/User');
const Event = require('./models/Event');
const CalendarEntry = require('./models/CalendarEntry');
const Notice = require('./models/Notice');
const Proposal = require('./models/Proposal');

// Connect to MongoDB
connectDB().then(() => {
  seedDatabase();
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Bind REST routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));

// Welcome/Ping endpoint
app.get('/ping', (req, res) => {
  res.json({ success: true, message: 'Apex College Events API Online', timestamp: new Date() });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`🔴 Internal Server Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Setup Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// ==========================================
// 📡 MONGODB AUTO-SEEDING DATABASE ROUTINE
// ==========================================
async function seedDatabase() {
  try {
    // 1. Seed Accounts if empty
    const adminExists = await User.findOne({ role: 'superadmin' });
    if (!adminExists) {
      console.log('🌱 Database Empty. Commencing automatic seed data insertions...');

      // Seed Super Admin
      await User.create({
        username: 'admin',
        email: 'admin@btech.edu',
        password: 'superadmin',
        role: 'superadmin',
        name: 'System Administrator'
      });
      console.log('✅ Hashed Super Admin Account seeded (admin / superadmin).');

      // Seed Default Academic Coordinator
      const defaultCoord = await User.create({
        username: 'coordinator',
        email: 'coordinator@btech.edu',
        password: 'coordinator',
        role: 'coordinator',
        name: 'Academic Coordinator',
        status: 'active'
      });
      console.log('✅ Hashed Default Coordinator seeded (coordinator / coordinator).');

      // Seed Demo Students
      const student1 = await User.create({
        rollNo: '24481A1270',
        email: 'vikram@btech.edu',
        password: 'pass',
        role: 'student',
        name: 'Vikram Reddy',
        department: 'Information Technology',
        section: 'B',
        admissionYear: 2024,
        pursuingYear: 3, // 2026 - 2024 + 1
        gradYear: 2028
      });

      const student2 = await User.create({
        rollNo: '25481A1201',
        email: 'meghana@btech.edu',
        password: 'pass',
        role: 'student',
        name: 'Meghana Sen',
        department: 'Computer Science',
        section: 'A',
        admissionYear: 2025,
        pursuingYear: 2, // 2026 - 2025 + 1
        gradYear: 2029
      });

      console.log('✅ Active demo BTech students seeded (Passcode: "pass").');

      // Seed Calendar Entries
      await CalendarEntry.create([
        { date: '2026-06-10', title: 'Mid-Term Examinations Start', type: 'exam', createdBy: defaultCoord._id },
        { date: '2026-06-14', title: 'Preparation Holiday', type: 'holiday', createdBy: defaultCoord._id },
        { date: '2026-06-25', title: 'Practical Lab External Exams', type: 'exam', createdBy: defaultCoord._id }
      ]);
      console.log('✅ Academic Calendar Entry items seeded.');

      // Seed Global scrolling bulletins
      await Notice.create([
        { message: 'Welcome to Apex College BTech Event Management Hub!' },
        { message: 'Academic Coordinator: Mid-Term exams commence from June 10th. Check interactive calendars.' },
        { message: 'Notice: Event registrations are now open for Rhythm \'26 Cultural Festival!' }
      ]);
      console.log('✅ Scrolling bullet notices seeded.');

      // Seed completed and ongoing events
      const completedEvent = await Event.create({
        title: 'AI & Robotics Summit',
        category: 'Technical',
        summary: 'A futuristic tech summit presenting automated model networks and physical robotic arms.',
        description: 'The AI & Robotics Summit brought top innovators from across the state. Handled fully by Vikram Reddy, the event featured hands-on workshops on LLM tuning, drone programming, and sensor setups.',
        date: '2026-05-28',
        time: '10:00',
        organizer: student1._id,
        organizerName: student1.name,
        organizerRoll: student1.rollNo,
        status: 'Completed',
        posterPreset: 'tech',
        gFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSfD-tech/viewform',
        ndliLink: 'https://ndl.iitkgp.ac.in/document/AI-Summit-Tech',
        registeredStudents: [student2._id],
        winners: [
          { rank: 1, name: 'Siddharth Sen', roll: '24481A0540' },
          { rank: 2, name: 'Aditi Roy', roll: '24481A1211' },
          { rank: 3, name: 'Harish Rao', roll: '25481A0422' }
        ],
        feedbacks: [
          { student: student2._id, studentRoll: student2.rollNo, rating: 5, comment: 'Outstanding robotics demonstration! Very informative.' }
        ]
      });

      // Update student organizer Vikram's badge based on seeded feedback
      student1.badges.push({
        eventId: completedEvent._id,
        badgeName: '🏆 Organizer: AI & Robotics Summit',
        rating: 100
      });
      await student1.save();

      // Seed upcoming event
      await Event.create({
        title: "Rhythm '26 Cultural Night",
        category: 'Cultural',
        summary: 'Annual department cultural festival celebrating dance, music, and dramatic arts.',
        description: 'A spectacular cultural explosion showcasing the finest artistic talents in classical fusion dance, battle of the bands, and theatrical dramas. Supported by modern acoustic engineering systems.',
        date: '2026-06-18',
        time: '17:30',
        organizer: student2._id,
        organizerName: student2.name,
        organizerRoll: student2.rollNo,
        status: 'Upcoming',
        posterPreset: 'cultural',
        gFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSfCultural/viewform',
        ndliLink: 'https://ndl.iitkgp.ac.in/document/Art-And-Culture'
      });

      console.log('✅ Demo Events seeded, badge computed for organizer.');
    }
  } catch (error) {
    console.error(`🔴 Seeding database failure: ${error.message}`);
  }
}
