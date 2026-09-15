const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email configuration — Gmail SMTP, same pattern used elsewhere in this project
const transporter = nodemailer.createTransport({
  host: 'google',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, ''), // strips accidental spaces from a pasted App Password
  },
});

// Verify the connection on startup so config errors surface immediately
transporter.verify((err) => {
  if (err) {
    logger.error(`Mailer config error: ${err.message}`);
  } else {
    logger.info('Mailer ready to send emails');
  }
});

const FROM_EMAIL = process.env.EMAIL_USER;
const FROM_NAME = 'PennyWise';

// Brand palette — matches the app's theme
const ACCENT = '#CC785C';
const BG_OUTER = '#F5F3EE'; // warm oatmeal, matches app's light background
const CARD_BG = '#171716'; // near-black warm gray, matches app's dark surface
const TEXT_PRIMARY = '#ECECE9';
const TEXT_SECONDARY = '#A8A79E';
const BOX_BG = '#232322'; // matches SurfaceDark

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

/** Renders the OTP as individual boxed digits, matching the app's DigitBox UI */
const renderOtpBoxes = (otp) => {
  return otp
    .split('')
    .map(
      (digit) => `
        <td style="padding: 0 6px;">
          <div style="
            width: 48px;
            height: 56px;
            background-color: ${BOX_BG};
            border: 1.5px solid ${ACCENT};
            border-radius: 14px;
            text-align: center;
            line-height: 56px;
            font-size: 26px;
            font-weight: 700;
            font-family: 'Segoe UI', Roboto, Arial, sans-serif;
            color: ${TEXT_PRIMARY};
          ">${digit}</div>
        </td>`
    )
    .join('');
};

/** Shared wrapper so both emails look like the same brand — logo mark, dark
 * card on a warm light outer background, consistent footer. */
const wrapEmailBody = (innerContent) => `
  <div style="background-color: ${BG_OUTER}; padding: 40px 16px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
    <table role="presentation" width="100%" style="max-width: 420px; margin: 0 auto;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align: center; padding-bottom: 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td style="
                width: 56px; height: 56px;
                background-color: ${ACCENT};
                border-radius: 16px;
                text-align: center;
                vertical-align: middle;
                font-size: 24px;
                font-weight: 700;
                color: #FFFFFF;
              ">P/W</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="
          background-color: ${CARD_BG};
          border-radius: 24px;
          padding: 36px 28px;
        ">
          ${innerContent}
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding-top: 24px;">
          <p style="color: ${TEXT_SECONDARY}; font-size: 12px; margin: 0;">PennyWise — your account book, digitized.</p>
        </td>
      </tr>
    </table>
  </div>
`;

/**
 * Send OTP to user email
 * @param {string} email - User email address
 * @param {string} otp - OTP to send
 * @returns {Promise<void>}
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const inner = `
      <h2 style="color: ${TEXT_PRIMARY}; font-size: 20px; font-weight: 700; margin: 0 0 8px; text-align: center;">
        Verify your email
      </h2>
      <p style="color: ${TEXT_SECONDARY}; font-size: 14px; margin: 0 0 28px; text-align: center;">
        Enter this code to continue
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
        <tr>${renderOtpBoxes(otp)}</tr>
      </table>
      <p style="color: ${TEXT_SECONDARY}; font-size: 13px; margin: 0; text-align: center;">
        This code is valid for 10 minutes.
      </p>
      <p style="color: ${TEXT_SECONDARY}; font-size: 12px; margin: 16px 0 0; text-align: center; opacity: 0.8;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Your PennyWise verification code',
      html: wrapEmailBody(inner),
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
    const inner = `
      <h2 style="color: ${TEXT_PRIMARY}; font-size: 20px; font-weight: 700; margin: 0 0 8px; text-align: center;">
        Welcome, ${username}
      </h2>
      <p style="color: ${TEXT_SECONDARY}; font-size: 14px; margin: 0 0 24px; text-align: center; line-height: 1.5;">
        Your account is ready. Start logging your spending and let PennyWise keep the ledger for you.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align: center;">
            <a href="#" style="
              display: inline-block;
              background-color: ${ACCENT};
              color: #FFFFFF;
              font-size: 14px;
              font-weight: 600;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 50px;
            ">Open PennyWise</a>
          </td>
        </tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to PennyWise',
      html: wrapEmailBody(inner),
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
