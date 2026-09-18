const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  breakfast: { type: String, default: 'Not specified' },
  lunch: { type: String, default: 'Not specified' },
  snacks: { type: String, default: 'Not specified' },
  dinner: { type: String, default: 'Not specified' },
}, { _id: false });

const messMenuSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Standard Weekly Mess Menu',
  },
  weekStartDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  monday: { type: mealItemSchema, default: () => ({}) },
  tuesday: { type: mealItemSchema, default: () => ({}) },
  wednesday: { type: mealItemSchema, default: () => ({}) },
  thursday: { type: mealItemSchema, default: () => ({}) },
  friday: { type: mealItemSchema, default: () => ({}) },
  saturday: { type: mealItemSchema, default: () => ({}) },
  sunday: { type: mealItemSchema, default: () => ({}) },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MessMenu', messMenuSchema);
