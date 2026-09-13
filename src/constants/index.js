/**
 * Application Constants
 * Central place for all hardcoded constants used across the application
 */

// OTP Configuration
const OTP_LENGTH = 4;
const OTP_EXPIRY_MINUTES = 10;

// JWT Configuration
// Tokens do not expire

// Rate Limiting
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

// Pagination
const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 500;

// Validation Rules
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 200;
const NOTE_MAX_LENGTH = 500;

// Budget Alert Threshold (percentage)
const DEFAULT_BUDGET_ALERT_THRESHOLD = 80;

// Recurring Frequency Options
const RECURRING_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

module.exports = {
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,

  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  DEFAULT_BUDGET_ALERT_THRESHOLD,
  RECURRING_FREQUENCIES,
};
