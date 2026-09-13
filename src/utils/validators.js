/**
 * Validation Utility Module
 * Helper functions for input validation
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate OTP format
 * @param {string} otp
 * @returns {boolean}
 */
const isValidOTP = (otp) => {
  return /^\d{4}$/.test(otp);
};

/**
 * Validate amount
 * @param {number} amount
 * @returns {boolean}
 */
const isValidAmount = (amount) => {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
};

/**
 * Validate username
 * @param {string} username
 * @returns {boolean}
 */
const isValidUsername = (username) => {
  return username && username.length >= 3 && username.length <= 50;
};

/**
 * Validate payment method
 * @param {string} method
 * @returns {boolean}
 */
const isValidPaymentMethod = (method) => {
  const validMethods = ['Credit/Debit Card', 'UPI', 'Bank Transfer', 'Cash', 'Others'];
  return validMethods.includes(method);
};

/**
 * Validate date format
 * @param {string} dateStr
 * @returns {boolean}
 */
const isValidDate = (dateStr) => {
  const date = new Date(dateStr);
  return !isNaN(date) && date instanceof Date;
};

module.exports = {
  isValidEmail,
  isValidOTP,
  isValidAmount,
  isValidUsername,
  isValidPaymentMethod,
  isValidDate,
};
