const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notice', NoticeSchema);
