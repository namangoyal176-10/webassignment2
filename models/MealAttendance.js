const mongoose = require('mongoose');

const mealAttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  breakfast: {
    type: Boolean,
    default: false,
  },
  lunch: {
    type: Boolean,
    default: false,
  },
  snacks: {
    type: Boolean,
    default: false,
  },
  dinner: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure only one attendance document per student per date
mealAttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MealAttendance', mealAttendanceSchema);
