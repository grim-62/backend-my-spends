/**
 * Logger Utility Module
 * Centralized logging for the application
 */

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');
const errorFile = path.join(logDir, 'error.log');

/**
 * Get timestamp in ISO format
 */
const getTimestamp = () => new Date().toISOString();

/**
 * Write to log file
 */
const writeLog = (level, message, file = logFile) => {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  try {
    fs.appendFileSync(file, logMessage);
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
  }

  // Also log to console
  const colorCode = {
    INFO: '\x1b[36m',
    WARN: '\x1b[33m',
    ERROR: '\x1b[31m',
    DEBUG: '\x1b[35m',
  };

  const reset = '\x1b[0m';
  const color = colorCode[level] || '';
  console.log(`${color}[${timestamp}] [${level}] ${message}${reset}`);
};

const logger = {
  info: (message) => writeLog('INFO', message),
  warn: (message) => writeLog('WARN', message),
  error: (message) => writeLog('ERROR', message, errorFile),
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      writeLog('DEBUG', message);
    }
  },
};

module.exports = logger;
