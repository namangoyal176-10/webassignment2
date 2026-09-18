const mongoose = require('mongoose');

const messBillSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: String, // e.g. 'January', 'February', etc.
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  daysPresent: {
    type: Number,
    required: true,
    min: 0,
    max: 31,
    default: 0,
  },
  perDayRate: {
    type: Number,
    required: true,
    default: 120,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid',
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: {
    type: Date,
  },
});

// Unique bill per student for a given month & year
messBillSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MessBill', messBillSchema);
