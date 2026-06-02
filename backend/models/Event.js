const mongoose = require('mongoose');

const WinnerSchema = new mongoose.Schema({
  rank: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },
  name: {
    type: String,
    required: true
  },
  roll: {
    type: String,
    required: true,
    uppercase: true
  },
  photo: {
    type: String,
    default: '' // Placeholder for custom profile photo URL
  }
});

const FeedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentRoll: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String
}, {
  timestamps: true
});

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical', 'Cultural', 'Sports']
  },
  summary: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // Format: HH:MM
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: String,
  organizerRoll: String,
  status: {
    type: String,
    required: true,
    enum: ['Upcoming', 'Live', 'Completed'],
    default: 'Upcoming'
  },
  posterPreset: {
    type: String,
    enum: ['tech', 'cultural', 'sports'],
    default: 'tech'
  },
  posterUrl: {
    type: String,
    default: ''
  },
  gFormLink: {
    type: String,
    default: ''
  },
  ndliLink: {
    type: String,
    default: ''
  },
  registeredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  photos: [String], // Array of gallery photos URLs
  winners: [WinnerSchema], // List of top 3 winners
  feedbacks: [FeedbackSchema], // Star rating reviews
  feedbackCount: {
    type: Number,
    default: 0
  },
  feedbackPercentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);
