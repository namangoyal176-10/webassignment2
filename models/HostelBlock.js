const mongoose = require('mongoose');

const hostelBlockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a block name'],
    trim: true,
  },
  blockNumber: {
    type: String,
    required: [true, 'Please provide a block number/code'],
    trim: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ['Boys', 'Girls', 'Co-ed'],
    default: 'Boys',
    required: true,
  },
  totalRooms: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HostelBlock', hostelBlockSchema);
