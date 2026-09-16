const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email configuration — Gmail SMTP, same pattern used elsewhere in this project
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
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
const APP_URL = process.env.APP_URL || '#';

// Brand palette — matches the app's theme
const ACCENT = '#CC785C';
const ACCENT_SOFT = '#E3A992'; // lighter accent for gradients/hover states
const BG_OUTER = '#F5F3EE'; // warm oatmeal, matches app's light background
const CARD_BG = '#171716'; // near-black warm gray, matches app's dark surface
const CARD_BORDER = '#2A2A28'; // subtle hairline so the card lifts off the outer bg
const TEXT_PRIMARY = '#ECECE9';
const TEXT_SECONDARY = '#A8A79E';
const TEXT_MUTED = '#6F6E67';
const BOX_BG = '#232322'; // matches SurfaceDark
const FONT_STACK = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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
            width: 50px;
            height: 58px;
            background-color: ${BOX_BG};
            background-image: linear-gradient(180deg, #262625 0%, ${BOX_BG} 100%);
            border: 1.5px solid ${ACCENT};
            border-radius: 14px;
            text-align: center;
            line-height: 58px;
            font-size: 26px;
            font-weight: 700;
            font-family: ${FONT_STACK};
            color: ${TEXT_PRIMARY};
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          ">${digit}</div>
        </td>`
    )
    .join('');
};

/** Shared wrapper so both emails look like the same brand — logo mark, dark
 * card on a warm light outer background, consistent footer. */
const wrapEmailBody = (innerContent, preheader = '') => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <title>PennyWise</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${BG_OUTER};">
      <!-- Preheader: hidden preview text shown in inbox list -->
      <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">
        ${preheader}
      </div>
      <div style="background-color: ${BG_OUTER}; padding: 48px 16px; font-family: ${FONT_STACK};">
        <table role="presentation" width="100%" style="max-width: 440px; margin: 0 auto;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding-bottom: 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="
                    width: 56px; height: 56px;
                    background-color: ${ACCENT};
                    background-image: linear-gradient(135deg, ${ACCENT} 0%, #B5624A 100%);
                    border-radius: 16px;
                    text-align: center;
                    vertical-align: middle;
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    color: #FFFFFF;
                    box-shadow: 0 4px 12px rgba(204,120,92,0.35);
                  ">P/W</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="
              background-color: ${CARD_BG};
              border: 1px solid ${CARD_BORDER};
              border-radius: 24px;
              padding: 40px 32px;
              box-shadow: 0 12px 32px rgba(23,23,22,0.12);
            ">
              ${innerContent}
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-top: 28px;">
              <p style="color: ${TEXT_MUTED}; font-size: 12px; margin: 0 0 6px; letter-spacing: 0.2px;">
                PennyWise — your account book, digitized.
              </p>
              <p style="color: ${TEXT_MUTED}; font-size: 11px; margin: 0;">
                This is an automated message, please don't reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </body>
  </html>
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
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align: center; padding-bottom: 4px;">
            <span style="
              display: inline-block;
              background-color: ${BOX_BG};
              color: ${ACCENT};
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
              padding: 6px 14px;
              border-radius: 999px;
              margin-bottom: 20px;
            ">Verification code</span>
          </td>
        </tr>
      </table>
      <h2 style="color: ${TEXT_PRIMARY}; font-size: 21px; font-weight: 700; margin: 0 0 8px; text-align: center; letter-spacing: -0.2px;">
        Verify your email
      </h2>
      <p style="color: ${TEXT_SECONDARY}; font-size: 14px; line-height: 1.5; margin: 0 0 30px; text-align: center;">
        Enter this code in PennyWise to continue. It expires soon, so don't wait too long.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 30px;">
        <tr>${renderOtpBoxes(otp)}</tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="
            background-color: ${BOX_BG};
            border-radius: 12px;
            padding: 14px 16px;
            text-align: center;
          ">
            <p style="color: ${TEXT_SECONDARY}; font-size: 13px; margin: 0; line-height: 1.5;">
              ⏱ Valid for <strong style="color: ${TEXT_PRIMARY};">10 minutes</strong>
            </p>
          </td>
        </tr>
      </table>
      <p style="color: ${TEXT_MUTED}; font-size: 12px; margin: 20px 0 0; text-align: center; line-height: 1.5;">
        Didn't request this? You can safely ignore this email — your account is still secure.
      </p>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Your PennyWise verification code',
      html: wrapEmailBody(inner, `Your PennyWise verification code is ${otp}. It expires in 10 minutes.`),
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
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align: center; padding-bottom: 18px;">
            <div style="
              width: 64px; height: 64px;
              margin: 0 auto;
              background-color: ${BOX_BG};
              border-radius: 50%;
              text-align: center;
              line-height: 64px;
              font-size: 28px;
            ">🎉</div>
          </td>
        </tr>
      </table>
      <h2 style="color: ${TEXT_PRIMARY}; font-size: 22px; font-weight: 700; margin: 0 0 10px; text-align: center; letter-spacing: -0.2px;">
        Welcome, ${username}
      </h2>
      <p style="color: ${TEXT_SECONDARY}; font-size: 14px; margin: 0 0 30px; text-align: center; line-height: 1.6;">
        Your account is ready to go. Start logging your spending and let PennyWise keep the ledger for you — clean, simple, and always up to date.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align: center; padding-bottom: 28px;">
            <a href="${APP_URL}" style="
              display: inline-block;
              background-color: ${ACCENT};
              background-image: linear-gradient(135deg, ${ACCENT_SOFT} 0%, ${ACCENT} 100%);
              color: #FFFFFF;
              font-size: 14px;
              font-weight: 600;
              text-decoration: none;
              padding: 15px 36px;
              border-radius: 50px;
              box-shadow: 0 6px 16px rgba(204,120,92,0.35);
            ">Open PennyWise →</a>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid ${CARD_BORDER};">
        <tr>
          <td style="padding-top: 22px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 12px; vertical-align: top; width: 28px;">
                  <span style="color: ${ACCENT}; font-size: 15px;">＋</span>
                </td>
                <td style="padding-bottom: 12px; color: ${TEXT_SECONDARY}; font-size: 13px; line-height: 1.5;">
                  Log expenses in seconds, right from your phone
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 12px; vertical-align: top; width: 28px;">
                  <span style="color: ${ACCENT}; font-size: 15px;">◔</span>
                </td>
                <td style="padding-bottom: 12px; color: ${TEXT_SECONDARY}; font-size: 13px; line-height: 1.5;">
                  See where your money goes with clear summaries
                </td>
              </tr>
              <tr>
                <td style="vertical-align: top; width: 28px;">
                  <span style="color: ${ACCENT}; font-size: 15px;">✓</span>
                </td>
                <td style="color: ${TEXT_SECONDARY}; font-size: 13px; line-height: 1.5;">
                  Your data stays private and synced across devices
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to PennyWise',
      html: wrapEmailBody(inner, `Welcome to PennyWise, ${username}! Your account is ready.`),
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