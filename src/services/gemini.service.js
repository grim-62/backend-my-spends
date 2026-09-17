/**
 * Gemini Service Module
 * Handles integration with Google Gemini AI for categorization and summaries
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const VALID_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Bills & Utilities',
  'Shopping',
  'Medical',
  'Entertainment',
  'Education',
  'Personal Care',
  'Home & Living',
  'Investment',
  'Salary',
  'Freelance',
  'Bonus',
  'Refund',
  'Others',
];

/**
 * Categorize a transaction using Gemini AI
 * @param {string} description - Transaction description
 * @param {number} amount - Transaction amount
 * @returns {Promise<{category: string, confidence: number}>}
 */
const categorizeTransaction = async (description, amount) => {
  try {
    const prompt = `
    Based on the description "${description}" and amount "${amount}", suggest a single transaction category from the following list:
    ${VALID_CATEGORIES.join(', ')}
    
    Return ONLY a JSON response with the format:
    {"category": "category_name", "confidence": 0.95}
    
    Where confidence is a number between 0 and 1 indicating how confident you are about this categorization.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate category
    if (!VALID_CATEGORIES.includes(parsed.category)) {
      parsed.category = 'Others';
    }

    logger.info(`Transaction categorized: ${description} -> ${parsed.category}`);
    return parsed;
  } catch (error) {
    logger.error(`Gemini categorization error: ${error.message}`);
    return { category: 'Others', confidence: 0 };
  }
};

/**
 * Parse natural language into transaction details using Gemini
 * @param {string} text - Natural language text describing a transaction
 * @returns {Promise<{description: string, amount: number, isIncome: boolean, paymentMethod: string, date: Date}>}
 */
const parseQuickAdd = async (text) => {
  try {
    const prompt = `
    Parse the following natural language text into a transaction details JSON:
    "${text}"
    
    Extract: description, amount (as number), isIncome (boolean), paymentMethod (if mentioned), and date (if mentioned).
    
    Payment methods can be: "Credit/Debit Card", "UPI", "Bank Transfer", "Cash", "Others"
    If no payment method is mentioned, use "Others".
    
    Return ONLY valid JSON with this exact format:
    {
      "description": "item description",
      "amount": 500,
      "isIncome": false,
      "paymentMethod": "UPI",
      "date": "2024-01-15"
    }
    
    If you cannot determine a field, use reasonable defaults (amount: 0, date: today, paymentMethod: "Others").
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    parsed.amount = Math.max(0, Number(parsed.amount) || 0);
    parsed.isIncome = Boolean(parsed.isIncome);
    parsed.date = new Date(parsed.date || Date.now());

    logger.info(`Quick add parsed: ${text}`);
    return parsed;
  } catch (error) {
    logger.error(`Gemini quick add parsing error: ${error.message}`);
    throw error;
  }
};

/**
 * Generate expense summary using Gemini
 * @param {Array<Object>} transactions - Array of transaction objects
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<string>} Summary text
 */
const generateSummary = async (transactions, month) => {
  try {
    const totalExpense = transactions
      .filter((t) => !t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter((t) => t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = transactions.reduce((acc, t) => {
      if (!t.isIncome) {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {});

    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    const prompt = `
    Generate a concise, insightful spending summary for the month ${month}:
    - Total Income: ₹${totalIncome}
    - Total Expenses: ₹${totalExpense}
    - Net Savings: ₹${totalIncome - totalExpense}
    - Top spending category: ${topCategory ? topCategory[0] + ' (₹' + topCategory[1] + ')' : 'None'}
    - Number of transactions: ${transactions.length}
    
    Category breakdown:
    ${Object.entries(categoryBreakdown)
      .map(([cat, amt]) => `- ${cat}: ₹${amt}`)
      .join('\n')}
    
    Provide a brief, friendly summary with insights and suggestions. Keep it under 150 words.
    `;

    const result = await model.generateContent(prompt);
    const summary = await result.response.text();

    logger.info(`Summary generated for ${month}`);
    return summary;
  } catch (error) {
    logger.error(`Gemini summary generation error: ${error.message}`);
    throw error;
  }
};

const buildCashflowContext = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      netCashflow: 0,
      averageMonthlyExpense: 0,
      topCategories: [],
      recentTransactions: [],
      monthsTracked: 0,
    };
  }

  const totalIncome = transactions
    .filter((t) => t.isIncome)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => !t.isIncome)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const categoryMap = {};
  transactions
    .filter((t) => !t.isIncome)
    .forEach((t) => {
      const category = t.category || 'Others';
      categoryMap[category] = (categoryMap[category] || 0) + Number(t.amount || 0);
    });

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  const dates = transactions
    .map((t) => new Date(t.date))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b);

  const earliest = dates[0];
  const latest = dates[dates.length - 1];
  const monthsTracked = earliest && latest
    ? Math.max(1, (latest.getFullYear() - earliest.getFullYear()) * 12 + (latest.getMonth() - earliest.getMonth()) + 1)
    : 1;

  const averageMonthlyExpense = monthsTracked > 0 ? totalExpense / monthsTracked : totalExpense;

  const recentTransactions = transactions
    .slice(0, 10)
    .map((t) => ({
      description: t.description || 'Unnamed',
      amount: Number(t.amount || 0),
      category: t.category || 'Others',
      isIncome: Boolean(t.isIncome),
      date: new Date(t.date).toISOString().slice(0, 10),
    }));

  return {
    totalIncome,
    totalExpense,
    netCashflow: totalIncome - totalExpense,
    averageMonthlyExpense,
    topCategories,
    recentTransactions,
    monthsTracked,
  };
};

const askCashflowQuestion = async (transactions, question) => {
  try {
    const cashflow = buildCashflowContext(transactions);
    const prompt = `
    You are a helpful personal finance assistant.
    Answer the user's cashflow question using only the transaction data provided below.
    Be practical, honest, and concise. If there is not enough data, say so clearly.

    User question: "${question}"

    Transaction data summary:
    - Total income: ₹${cashflow.totalIncome}
    - Total expenses: ₹${cashflow.totalExpense}
    - Net cashflow: ₹${cashflow.netCashflow}
    - Average monthly expense: ₹${cashflow.averageMonthlyExpense.toFixed(2)}
    - Months tracked: ${cashflow.monthsTracked}
    - Top spending categories:
      ${cashflow.topCategories.length > 0
        ? cashflow.topCategories.map((item) => `- ${item.category}: ₹${item.amount}`).join('\n')
        : '- No spending categories yet'}
    - Recent transactions:
      ${cashflow.recentTransactions.length > 0
        ? cashflow.recentTransactions
            .map((item) => `- ${item.date} | ${item.description} | ${item.isIncome ? 'Income' : 'Expense'} | ₹${item.amount} | ${item.category}`)
            .join('\n')
        : '- No recent transactions'}

    Instructions:
    1. Give a direct answer to the user question.
    2. If the question is about affordability, compare the planned amount to the monthly budget and cashflow.
    3. If needed, mention a rough monthly runway or savings cushion.
    4. Keep it friendly and easy to read, like a finance coach.
    5. Do not invent transactions or numbers.
    6. Return only the answer text, no JSON.
    `;

    const result = await model.generateContent(prompt);
    const answer = await result.response.text();

    logger.info(`Cashflow question answered: ${question}`);
    return answer.trim() || 'I cannot answer that with the current transaction data.';
  } catch (error) {
    logger.error(`Gemini cashflow question error: ${error.message}`);

    const cashflow = buildCashflowContext(transactions);
    if (!transactions || transactions.length === 0) {
      return 'I do not have enough transaction data yet to answer that confidently. Add a few transactions first and ask again.';
    }

    const net = cashflow.netCashflow;
    return `Based on your current data, your net cashflow is ₹${net}. I suggest checking your monthly expenses and savings cushion before making a big purchase. If you need a more tailored answer, share the exact amount and timeline.`;
  }
};

module.exports = {
  categorizeTransaction,
  parseQuickAdd,
  generateSummary,
  askCashflowQuestion,
};
