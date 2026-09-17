const { Resend } = require('resend');
const logger = require('../utils/logger');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const FROM_NAME = 'PennyWise';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const ensureEmailConfig = () => {
  const missing = [];

  if (!RESEND_API_KEY) missing.push('RESEND_API_KEY');
  if (!FROM_EMAIL) missing.push('EMAIL_FROM');

  if (missing.length > 0) {
    throw new Error(`Email service is not configured. Missing environment variables: ${missing.join(', ')}`);
  }
};

// Brand palette
const ACCENT = '#CC785C';
const ACCENT_SOFT = '#E3A992';
const BG_OUTER = '#F5F3EE';
const CARD_BG = '#171716';
const CARD_BORDER = '#2A2A28';
const TEXT_PRIMARY = '#ECECE9';
const TEXT_SECONDARY = '#A8A79E';
const TEXT_MUTED = '#6F6E67';
const BOX_BG = '#232322';
const FONT_STACK = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Generate a random OTP
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
 * Render OTP boxes
 */
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

/**
 * Shared email wrapper
 */
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
      <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">
        ${preheader}
      </div>

      <div style="
        background-color: ${BG_OUTER};
        padding: 48px 16px;
        font-family: ${FONT_STACK};
      ">
        <table
          role="presentation"
          width="100%"
          style="max-width: 440px; margin: 0 auto;"
          cellpadding="0"
          cellspacing="0"
        >
          <tr>
            <td style="text-align: center; padding-bottom: 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="
                    width: 56px;
                    height: 56px;
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
              <p style="
                color: ${TEXT_MUTED};
                font-size: 12px;
                margin: 0 0 6px;
                letter-spacing: 0.2px;
              ">
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
 * Send OTP email using Resend
 */
const sendOTPEmail = async (email, otp) => {
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

    <h2 style="
      color: ${TEXT_PRIMARY};
      font-size: 21px;
      font-weight: 700;
      margin: 0 0 8px;
      text-align: center;
    ">
      Verify your email
    </h2>

    <p style="
      color: ${TEXT_SECONDARY};
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 30px;
      text-align: center;
    ">
      Enter this code in PennyWise to continue.
      It expires soon, so don't wait too long.
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
          <p style="
            color: ${TEXT_SECONDARY};
            font-size: 13px;
            margin: 0;
            line-height: 1.5;
          ">
            ⏱ Valid for
            <strong style="color: ${TEXT_PRIMARY};">10 minutes</strong>
          </p>
        </td>
      </tr>
    </table>

    <p style="
      color: ${TEXT_MUTED};
      font-size: 12px;
      margin: 20px 0 0;
      text-align: center;
      line-height: 1.5;
    ">
      Didn't request this? You can safely ignore this email.
    </p>
  `;

  try {
    ensureEmailConfig();

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Your PennyWise verification code',
      html: wrapEmailBody(
        inner,
        `Your PennyWise verification code is ${otp}. It expires in 10 minutes.`
      ),
    });

    if (error) {
      logger.error(`Resend OTP error: ${JSON.stringify(error)}`);
      throw new Error(error.message || 'Failed to send OTP email');
    }

    logger.info(`OTP email sent successfully: ${data?.id}`);
  } catch (error) {
    logger.error(`Actual email sending error: ${error.message}`);
    throw error;
  }
};

/**
 * Send welcome email using Resend
 */
const sendWelcomeEmail = async (email, username) => {
  const inner = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align: center; padding-bottom: 18px;">
          <div style="
            width: 64px;
            height: 64px;
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

    <h2 style="
      color: ${TEXT_PRIMARY};
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 10px;
      text-align: center;
    ">
      Welcome, ${username}
    </h2>

    <p style="
      color: ${TEXT_SECONDARY};
      font-size: 14px;
      margin: 0 0 30px;
      text-align: center;
      line-height: 1.6;
    ">
      Your account is ready to go.
      Start logging your spending and let PennyWise keep the ledger for you —
      clean, simple, and always up to date.
    </p>

    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="border-top: 1px solid ${CARD_BORDER};"
    >
      <tr>
        <td style="padding-top: 22px;">
          <p style="color: ${TEXT_SECONDARY}; font-size: 13px;">
            ＋ Log expenses in seconds, right from your phone
          </p>

          <p style="color: ${TEXT_SECONDARY}; font-size: 13px;">
            ◔ See where your money goes with clear summaries
          </p>

          <p style="color: ${TEXT_SECONDARY}; font-size: 13px;">
            ✓ Your data stays private and synced across devices
          </p>
        </td>
      </tr>
    </table>
  `;

  try {
    ensureEmailConfig();

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Welcome to PennyWise',
      html: wrapEmailBody(
        inner,
        `Welcome to PennyWise, ${username}! Your account is ready.`
      ),
    });

    if (error) {
      logger.error(`Resend welcome email error: ${JSON.stringify(error)}`);
      throw new Error(error.message || 'Failed to send welcome email');
    }

    logger.info(`Welcome email sent successfully: ${data?.id}`);
  } catch (error) {
    logger.error(`Failed to send welcome email to ${email}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
};