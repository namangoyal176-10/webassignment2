const mongoose = require('mongoose');

const roomRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  preferredBlock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelBlock',
    required: true,
  },
  preferredRoomType: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Four Sharing'],
    required: true,
  },
  reason: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  adminRemarks: {
    type: String,
    default: '',
    trim: true,
  },
  reviewedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RoomRequest', roomRequestSchema);
