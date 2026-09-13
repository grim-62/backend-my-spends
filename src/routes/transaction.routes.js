/**
 * Transaction Routes
 * Handles all transaction-related endpoints
 */

const express = require('express');
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getStats,
} = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * All transaction routes require authentication
 */
router.use(authenticate);

/**
 * Transaction CRUD operations
 */
router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/stats/monthly', getStats);
router.get('/:id', getTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
