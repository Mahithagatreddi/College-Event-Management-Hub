const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null/undefined student roll values
    lowercase: true
  },
  rollNo: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['superadmin', 'coordinator', 'student'],
    default: 'student'
  },
  name: {
    type: String,
    required: true
  },
  // BTech Student specific fields
  department: String,
  section: String,
  admissionYear: Number,
  pursuingYear: Number,
  gradYear: Number,
  
  // Coordinator specific fields
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  
  // Accumulated student organizer badges
  badges: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    badgeName: String,
    rating: Number
  }]
}, {
  timestamps: true // Automatically updates createdAt & updatedAt
});

// PRE-SAVE HOOK: Hashing password before database insertion
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// METHOD: Compare input password with database hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
