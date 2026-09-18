const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please provide a room number'],
    trim: true,
  },
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelBlock',
    required: [true, 'Please associate this room with a hostel block'],
  },
  roomType: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Four Sharing'],
    required: [true, 'Please specify the room type'],
    default: 'Double',
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1'],
  },
  occupiedBeds: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Available', 'Partially Occupied', 'Full', 'Maintenance'],
    default: 'Available',
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure roomNumber is unique per block
roomSchema.index({ block: 1, roomNumber: 1 }, { unique: true });

// Helper to determine status given occupied beds and capacity
roomSchema.methods.updateOccupancyStatus = function () {
  if (this.status === 'Maintenance') {
    return;
  }
  if (this.occupiedBeds <= 0) {
    this.status = 'Available';
  } else if (this.occupiedBeds >= this.capacity) {
    this.status = 'Full';
  } else {
    this.status = 'Partially Occupied';
  }
};

module.exports = mongoose.model('Room', roomSchema);
