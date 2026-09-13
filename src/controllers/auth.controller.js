/**
 * Authentication Controller
 * Handles user authentication, registration, login, and OTP verification
 */

const User = require('../models/User');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/email.service');
const { generateToken } = require('../utils/jwt');
const { isValidEmail, isValidUsername, isValidOTP } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * Register user - Send OTP
 * POST /auth/register
 */
exports.register = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!username || !isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-50 characters',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Generate OTP
    const otp = generateOTP(4);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      // Update existing unverified user
      user.username = username;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Create new user
      user = new User({
        username,
        email,
        otp,
        otpExpires,
        isVerified: false,
      });
      await user.save();
    }

    // Send OTP email
    await sendOTPEmail(email, otp);

    logger.info(`Registration initiated for ${email}`);
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Valid for 10 minutes.',
      email,
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

/**
 * Login user - Send OTP
 * POST /auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Find user
    let user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    // Generate OTP
    const otp = generateOTP(4);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    logger.info(`Login OTP sent to ${email}`);
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Valid for 10 minutes.',
      email,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * Verify OTP and issue JWT token
 * POST /auth/verify-otp
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!otp || !isValidOTP(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP format' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check OTP validity
    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (new Date() > user.otpExpires) {
      return res.status(401).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Mark user as verified
    const wasNewUser = !user.isVerified;
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Send welcome email for new users
    if (wasNewUser) {
      await sendWelcomeEmail(email, user.username).catch((err) => {
        logger.warn(`Welcome email failed: ${err.message}`);
      });
    }

    logger.info(`User verified and logged in: ${email}`);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
    });
  }
};

/**
 * Get current user profile
 * GET /auth/me
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-otp -otpExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

/**
 * Update user profile
 * PUT /auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    if (username && !isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-50 characters',
      });
    }

    const updateData = {};
    if (username) updateData.username = username;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-otp -otpExpires');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};
