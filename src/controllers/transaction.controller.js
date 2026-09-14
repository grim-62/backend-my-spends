/**
 * Transaction Controller
 * Handles CRUD operations for transactions and budget management
 */

const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { isValidAmount, isValidPaymentMethod } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * Get all transactions for user
 * GET /transactions?month=YYYY-MM&category=Food
 */
exports.getTransactions = async (req, res) => {
  try {
    const { month, category, limit = 50, skip = 0 } = req.query;
    const userId = req.user.userId;

    // Build filter
    const filter = { userId };

    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, parseInt(monthNum) - 1, 1);
      const endDate = new Date(year, parseInt(monthNum), 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (category) {
      filter.category = category;
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    logger.error(`Get transactions error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
    });
  }
};

/**
 * Create new transaction
 * POST /transactions
 */
exports.createTransaction = async (req, res) => {
  try {
    const { description, amount, date, category, isIncome, paymentMethod, note, receiptUrl } =
      req.body;
    const userId = req.user.userId;

    // Validation
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // Auto-categorize if not provided
    let finalCategory = category || 'Others';

    // Validate payment method
    let finalPaymentMethod = paymentMethod || 'Others';
    if (!isValidPaymentMethod(finalPaymentMethod)) {
      finalPaymentMethod = 'Others';
    }

    // Create transaction
    const transaction = new Transaction({
      userId,
      description: description.trim(),
      amount,
      date: date ? new Date(date) : new Date(),
      category: finalCategory,
      isIncome,
      paymentMethod: finalPaymentMethod,
      note: note || null,
      receiptUrl: receiptUrl || null,
    });

    await transaction.save();

    // Update budget if expense
    if (!isIncome) {
      const transactionMonth = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      const budget = await Budget.findOne({
        userId,
        category: finalCategory,
        month: transactionMonth,
      });

      if (budget) {
        budget.spent += amount;
        await budget.save();

        // Check if budget exceeded
        if (budget.spent > budget.limit) {
          logger.warn(`Budget exceeded for ${finalCategory} in ${transactionMonth}`);
        }
      }
    }

    logger.info(`Transaction created: ${description} - ₹${amount}`);
    res.status(201).json({
      success: true,
      message: 'Transaction saved successfully',
      transaction,
    });
  } catch (error) {
    logger.error(`Create transaction error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
    });
  }
};

/**
 * Get single transaction
 * GET /transactions/:id
 */
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    logger.error(`Get transaction error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
    });
  }
};

/**
 * Update transaction
 * PUT /transactions/:id
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { description, amount, date, category, isIncome, paymentMethod, note, receiptUrl } =
      req.body;
    const userId = req.user.userId;

    // Find transaction
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Store old amount and category for budget update
    const oldAmount = transaction.amount;
    const oldCategory = transaction.category;
    const oldIsIncome = transaction.isIncome;

    // Update fields if provided
    if (description !== undefined) transaction.description = description.trim();
    if (amount !== undefined && isValidAmount(amount)) transaction.amount = amount;
    if (date !== undefined) transaction.date = new Date(date);
    if (category !== undefined) transaction.category = category;
    if (isIncome !== undefined) transaction.isIncome = isIncome;
    if (paymentMethod !== undefined && isValidPaymentMethod(paymentMethod))
      transaction.paymentMethod = paymentMethod;
    if (note !== undefined) transaction.note = note;
    if (receiptUrl !== undefined) transaction.receiptUrl = receiptUrl;

    await transaction.save();

    // Update budgets if amount or category changed
    if ((oldAmount !== amount || oldCategory !== category) && !oldIsIncome) {
      const transactionMonth = transaction.date.toISOString().substring(0, 7);

      // Deduct old amount from old category budget
      const oldBudget = await Budget.findOne({
        userId,
        category: oldCategory,
        month: transactionMonth,
      });
      if (oldBudget) {
        oldBudget.spent = Math.max(0, oldBudget.spent - oldAmount);
        await oldBudget.save();
      }

      // Add new amount to new category budget
      const newBudget = await Budget.findOne({
        userId,
        category: transaction.category,
        month: transactionMonth,
      });
      if (newBudget) {
        newBudget.spent += transaction.amount;
        await newBudget.save();
      }
    }

    logger.info(`Transaction updated: ${req.params.id}`);
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    logger.error(`Update transaction error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
    });
  }
};

/**
 * Delete transaction
 * DELETE /transactions/:id
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Update budget if expense
    if (!transaction.isIncome) {
      const transactionMonth = transaction.date.toISOString().substring(0, 7);
      const budget = await Budget.findOne({
        userId,
        category: transaction.category,
        month: transactionMonth,
      });

      if (budget) {
        budget.spent = Math.max(0, budget.spent - transaction.amount);
        await budget.save();
      }
    }

    await Transaction.deleteOne({ _id: req.params.id });

    logger.info(`Transaction deleted: ${req.params.id}`);
    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete transaction error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
    });
  }
};

/**
 * Get transaction statistics
 * GET /transactions/stats/monthly?month=YYYY-MM
 */
exports.getStats = async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user.userId;

    let filter = { userId };

    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, parseInt(monthNum) - 1, 1);
      const endDate = new Date(year, parseInt(monthNum), 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const transactions = await Transaction.find(filter);

    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      netSavings: 0,
      categoryBreakdown: {},
      transactionCount: transactions.length,
    };

    transactions.forEach((t) => {
      if (t.isIncome) {
        stats.totalIncome += t.amount;
      } else {
        stats.totalExpense += t.amount;
        stats.categoryBreakdown[t.category] = (stats.categoryBreakdown[t.category] || 0) +
          t.amount;
      }
    });

    stats.netSavings = stats.totalIncome - stats.totalExpense;

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error(`Get stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};
