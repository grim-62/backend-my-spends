/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

const express = require('express');
const { register, login, verifyOTP, getProfile, updateProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * Public routes
 */
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

/**
 * Protected routes
 */
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
