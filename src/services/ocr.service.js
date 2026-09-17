/**
 * OCR Service Module
 * Handles receipt scanning using Tesseract
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const Tesseract = require('tesseract.js');
const logger = require('../utils/logger');

const saveBase64Image = (imageBase64) => {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return null;
  }

  const matches = imageBase64.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i);
  const base64Data = matches ? matches[3] : imageBase64;
  const mimeType = matches ? matches[1] : 'image/png';
  const extension = mimeType.includes('jpeg') ? 'jpg' : mimeType.split('/')[1] || 'png';
  const tempFile = path.join(
    os.tmpdir(),
    `receipt-${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`
  );

  try {
    fs.writeFileSync(tempFile, Buffer.from(base64Data, 'base64'));
    logger.info(`Temporary receipt image saved: ${tempFile}`);
    return tempFile;
  } catch (error) {
    logger.error(`Failed to save base64 receipt image: ${error.message}`);
    return null;
  }
};

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
  let tempImagePath = imagePath || null;

  try {
    if (!tempImagePath && imageBase64) {
      tempImagePath = saveBase64Image(imageBase64);
    }

    if (!tempImagePath) {
      throw new Error('Image data is required. Provide base64Image or imagePath.');
    }

    const extractedText = await extractTextFromImage(tempImagePath);
    const receiptDetails = parseReceiptText(extractedText);

    logger.info(`Receipt scanned: ${receiptDetails.merchant}`);
    return receiptDetails;
  } catch (error) {
    logger.error(`Receipt scanning error: ${error.message}`);
    throw error;
  } finally {
    if (imageBase64 && tempImagePath && !imagePath) {
      try {
        fs.unlinkSync(tempImagePath);
      } catch (cleanupError) {
        logger.warn(`Failed to clean temp OCR file: ${cleanupError.message}`);
      }
    }
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
