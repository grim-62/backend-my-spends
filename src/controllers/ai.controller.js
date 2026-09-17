/**
 * AI Controller
 * Handles AI-powered features like categorization, quick add, receipt scanning, and summaries
 */

const Transaction = require('../models/Transaction');
const {
  categorizeTransaction,
  parseQuickAdd,
  generateSummary,
} = require('../services/gemini.service');
const { scanReceipt } = require('../services/ocr.service');
const logger = require('../utils/logger');

/**
 * Categorize transaction using AI
 * POST /ai/categorize
 */
exports.categorize = async (req, res) => {
  try {
    const { description, amount } = req.body;

    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Description and amount are required',
      });
    }

    const result = await categorizeTransaction(description, amount);

    res.status(200).json({
      success: true,
      category: result.category,
      confidence: result.confidence,
    });
  } catch (error) {
    logger.error(`Categorization error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to categorize transaction',
    });
  }
};

/**
 * Quick add transaction using natural language
 * POST /ai/quick-add
 */
exports.quickAdd = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    // Parse natural language
    const parsed = await parseQuickAdd(text);

    // Create transaction
    const transaction = new Transaction({
      userId,
      description: parsed.description,
      amount: parsed.amount,
      date: new Date(parsed.date),
      isIncome: parsed.isIncome,
      paymentMethod: parsed.paymentMethod,
      category: parsed.category || 'Others',
    });

    await transaction.save();

    logger.info(`Quick add transaction created from: "${text}"`);
    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      transaction,
    });
  } catch (error) {
    logger.error(`Quick add error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add transaction',
    });
  }
};

/**
 * Scan receipt using OCR
 * POST /ai/scan-receipt
 */
exports.scanReceipt = async (req, res) => {
  try {
    const { base64Image, imagePath } = req.body;
    const userId = req.user.userId;

    if (!base64Image && !imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Image or imagePath is required',
      });
    }

    // Scan receipt
    const receiptDetails = await scanReceipt(base64Image, imagePath);

    // Optionally create transaction
    if (req.body.createTransaction) {
      const transaction = new Transaction({
        userId,
        description: receiptDetails.merchant,
        amount: receiptDetails.amount,
        date: new Date(receiptDetails.date),
        category: receiptDetails.category,
        isIncome: false,
        paymentMethod: 'Card',
        note: `Receipt: ${receiptDetails.merchant}`,
      });

      await transaction.save();

      logger.info(`Transaction created from receipt scan`);
      return res.status(201).json({
        success: true,
        message: 'Receipt scanned and transaction created',
        transaction,
        receiptDetails,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Receipt scanned successfully',
      receiptDetails,
    });
  } catch (error) {
    logger.error(`Receipt scanning error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to scan receipt',
    });
  }
};

exports.ocr = exports.scanReceipt;

/**
 * Generate expense summary
 * POST /ai/summary
 */
exports.summary = async (req, res) => {
  try {
    const { month } = req.body;
    const userId = req.user.userId;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Month is required (format: YYYY-MM)',
      });
    }

    // Fetch transactions for the month
    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, parseInt(monthNum) - 1, 1);
    const endDate = new Date(year, parseInt(monthNum), 0);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No transactions found for this month',
        summary: 'No transactions recorded this month.',
      });
    }

    // Generate summary using AI
    const summary = await generateSummary(transactions, month);

    logger.info(`Summary generated for ${month}`);
    res.status(200).json({
      success: true,
      summary,
      transactionCount: transactions.length,
    });
  } catch (error) {
    logger.error(`Summary generation error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
    });
  }
};
