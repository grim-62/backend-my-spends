/**
 * Transaction Model
 * Defines the schema for transaction documents in MongoDB
 */

const mongoose = require('mongoose');

const PAYMENT_METHODS = ['Credit/Debit Card', 'UPI', 'Bank Transfer', 'Cash', 'Others'];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be greater than or equal to 0'],
      validate: {
        validator: (value) => !isNaN(value) && isFinite(value),
        message: 'Amount must be a valid number',
      },
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    category: {
      type: String,
      default: 'Others',
    },
    isIncome: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`,
      },
      default: 'Others',
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: '',
    },
    receiptUrl: {
      type: String,
      default: null,
      validate: {
        validator: (value) => !value || /^(https?|ftp):\/\//.test(value),
        message: 'Receipt URL must be a valid URL',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimal query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, isIncome: 1 });
transactionSchema.index({ date: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
