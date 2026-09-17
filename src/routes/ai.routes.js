/**
 * AI Routes
 * Handles all AI-powered feature endpoints
 */

const express = require('express');
const { categorize, quickAdd, scanReceipt, summary } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * Categorization endpoint (can be public for testing)
 */
router.post('/categorize', categorize);

/**
 * All other AI routes require authentication
 */
router.use(authenticate);

/**
 * AI features
 */
router.post('/quick-add', quickAdd);
router.post('/scan-receipt', scanReceipt);
router.post('/ocr', scanReceipt);
router.post('/summary', summary);

module.exports = router;
