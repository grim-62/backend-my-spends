/**
 * OCR Service Module
 * Handles receipt scanning using Tesseract or Google Vision API
 */

const Tesseract = require('tesseract.js');
const logger = require('../utils/logger');

/**
 * Extract text from image using Tesseract OCR
 * @param {string} imagePath - Path to image file
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromImage = async (imagePath) => {
  try {
    logger.info(`Starting OCR on image: ${imagePath}`);

    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m) => logger.debug(`Tesseract: ${m.status} ${m.progress}`),
    });

    const text = result.data.text;
    logger.info('OCR extraction completed');
    return text;
  } catch (error) {
    logger.error(`OCR extraction error: ${error.message}`);
    throw new Error('Failed to extract text from image');
  }
};

/**
 * Extract receipt details from image
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} imagePath - Optional path to save image
 * @returns {Promise<{merchant: string, amount: number, date: string, category: string, items: Array}>}
 */
const scanReceipt = async (imageBase64, imagePath = null) => {
  try {
    let extractedText = '';

    if (imagePath) {
      extractedText = await extractTextFromImage(imagePath);
    } else {
      // For base64 image, would need to save temporarily or use Vision API
      // For now, using Tesseract with buffer
      logger.warn('Image processing for base64 not fully implemented');
      extractedText = '';
    }

    // Parse receipt details from extracted text
    const receiptDetails = parseReceiptText(extractedText);

    logger.info(`Receipt scanned: ${receiptDetails.merchant}`);
    return receiptDetails;
  } catch (error) {
    logger.error(`Receipt scanning error: ${error.message}`);
    throw error;
  }
};

/**
 * Parse receipt text to extract key details
 * @param {string} text - Extracted text from receipt
 * @returns {Object} Parsed receipt details
 */
const parseReceiptText = (text) => {
  const details = {
    merchant: 'Unknown',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Others',
    items: [],
  };

  if (!text) return details;

  // Extract merchant name (usually at top of receipt)
  const merchantMatch = text.match(/^([^\n]+)/);
  if (merchantMatch) {
    details.merchant = merchantMatch[1].trim().slice(0, 100);
  }

  // Extract amount (look for currency symbols and numbers)
  const amountMatch = text.match(/[₹\$€]?\s*(\d+(?:[.,]\d{2})?)/);
  if (amountMatch) {
    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    details.amount = isNaN(amount) ? 0 : amount;
  }

  // Extract date (multiple formats)
  const dateMatch = text.match(
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/
  );
  if (dateMatch) {
    const dateStr = dateMatch[0];
    const date = new Date(dateStr);
    if (!isNaN(date)) {
      details.date = date.toISOString().split('T')[0];
    }
  }

  // Extract items (lines with amounts)
  const itemLines = text.split('\n').filter((line) => /\d+/.test(line));
  details.items = itemLines.slice(0, 10).map((line) => line.trim());

  // Basic category detection
  const textLower = text.toLowerCase();
  if (textLower.includes('restaurant') || textLower.includes('cafe')) {
    details.category = 'Food & Dining';
  } else if (textLower.includes('fuel') || textLower.includes('petrol')) {
    details.category = 'Transport';
  } else if (textLower.includes('medical') || textLower.includes('pharmacy')) {
    details.category = 'Medical';
  } else if (textLower.includes('mall') || textLower.includes('store')) {
    details.category = 'Shopping';
  }

  return details;
};

module.exports = {
  extractTextFromImage,
    scanReceipt,
  parseReceiptText,
};
