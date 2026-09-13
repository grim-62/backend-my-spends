/**
 * Budget Model
 * Defines the schema for budget documents in MongoDB
 */

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Limit amount is required'],
      min: [0, 'Limit must be greater than 0'],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'], // Format: YYYY-MM
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
    },
    notificationThreshold: {
      type: Number,
      default: 80, // Alert when 80% of budget is spent
      min: [0, 'Threshold must be between 0 and 100'],
      max: [100, 'Threshold must be between 0 and 100'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and category per month
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });
budgetSchema.index({ userId: 1, month: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
