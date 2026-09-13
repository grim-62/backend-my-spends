/**
 * Email Service Module
 * Handles sending OTP and other emails via Resend
 */

const { Resend } = require('resend');
const logger = require('../utils/logger');

// Email configuration
const resend = new Resend(process.env.RESEND_API);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev';


/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 4)
 * @returns {string} Random OTP
 */
const generateOTP = (length = 4) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return otp;
};

/**
 * Send OTP to user email
 * @param {string} email - User email address
 * @param {string} otp - OTP to send
 * @returns {Promise<void>}
 */
const sendOTPEmail = async (email, otp) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'SpendSense - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center;">
            <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666; margin-top: 20px;">This OTP is valid for 10 minutes.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #999; font-size: 12px;">SpendSense Team</p>
        </div>
      `,
    });
    logger.info(`OTP email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}: ${error.message}`);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send welcome email
 * @param {string} email - User email address
 * @param {string} username - User username
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (email, username) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to SpendSense!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome, ${username}!</h2>
          <p>Your account has been successfully created.</p>
          <p>You can now start tracking your expenses using SpendSense.</p>
          <p style="color: #666; margin-top: 20px;">Best regards,<br>SpendSense Team</p>
        </div>
      `,
    });
    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send welcome email to ${email}: ${error.message}`);
    throw new Error('Failed to send welcome email');
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
};
