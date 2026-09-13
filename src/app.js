/**
 * Main Application File
 * Express server setup and middleware configuration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./configs/database');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transaction.routes');
const aiRoutes = require('./routes/ai.routes');

const logger = require('./utils/logger');
const { transporter } = require('./services/email.service');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Trust proxy configuration
 */
app.set('trust proxy', 1);

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Security Middleware
 */
app.use(helmet()); // Set various HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Rate Limiting Middleware
 * Limit requests to 100 per 15 minutes per IP
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
});

app.use(limiter);

/**
 * Request Logger Middleware
 */
app.use(requestLogger);

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.get('/test-email', async (req, res) => {
  try {
    await transporter.verify();

    res.json({
      success: true,
      message: 'SMTP connection works'
    });
  } catch (error) {
    console.error('SMTP TEST ERROR:', error);

    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      command: error.command
    });
  }
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SpendSense Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      ai: '/api/ai',
      health: '/health',
    },
  });
});

/**
 * Error Handling
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Server Initialization
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
