const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  category: {
    type: String,
    enum: ['Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Internet', 'Other'],
    required: [true, 'Please specify the maintenance category'],
  },
  description: {
    type: String,
    required: [true, 'Please describe the maintenance issue'],
    trim: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  adminRemarks: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
