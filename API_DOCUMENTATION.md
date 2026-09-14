/**
 * API Documentation
 * Complete API reference for SpendSense Backend
 */

/**
 * BASE URL: http://localhost:5000/api
 * 
 * Authentication: JWT Token in Authorization header
 * Authorization: Bearer <token>
 */

// ============ AUTHENTICATION ENDPOINTS ============

/**
 * 1. REGISTER - Request OTP
 * POST /auth/register
 * 
 * Request Body:
 * {
 *   "username": "john_doe",
 *   "email": "john@example.com"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "OTP sent to your email. Valid for 10 minutes.",
 *   "email": "john@example.com"
 * }
 * 
 * Errors:
 * - 400: Invalid email format or username
 * - 409: Email already registered
 * - 500: Server error
 */

/**
 * 2. LOGIN - Request OTP
 * POST /auth/login
 * 
 * Request Body:
 * {
 *   "email": "john@example.com"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "OTP sent to your email. Valid for 10 minutes.",
 *   "email": "john@example.com"
 * }
 * 
 * Errors:
 * - 400: Invalid email format
 * - 404: User not found
 * - 403: Account deactivated
 * - 500: Server error
 */

/**
 * 3. VERIFY OTP
 * POST /auth/verify-otp
 * 
 * Request Body:
 * {
 *   "email": "john@example.com",
 *   "otp": "123456"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": "507f1f77bcf86cd799439011",
 *     "username": "john_doe",
 *     "email": "john@example.com"
 *   }
 * }
 * 
 * Errors:
 * - 400: Invalid email or OTP format
 * - 401: Invalid OTP or OTP expired
 * - 404: User not found
 * - 500: Server error
 */

/**
 * 4. GET PROFILE
 * GET /auth/me
 * Headers: Authorization: Bearer <token>
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "user": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "username": "john_doe",
 *     "email": "john@example.com",
 *     "isVerified": true,
 *     "isActive": true,
 *     "lastLogin": "2024-01-15T10:30:00.000Z",
 *     "createdAt": "2024-01-14T10:30:00.000Z"
 *   }
 * }
 * 
 * Errors:
 * - 401: Unauthorized
 * - 404: User not found
 * - 500: Server error
 */

/**
 * 5. UPDATE PROFILE
 * PUT /auth/profile
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "username": "john_doe_updated"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "Profile updated successfully",
 *   "user": { ... }
 * }
 * 
 * Errors:
 * - 400: Invalid username
 * - 401: Unauthorized
 * - 500: Server error
 */

// ============ TRANSACTION ENDPOINTS ============

/**
 * 6. GET TRANSACTIONS
 * GET /transactions?month=2024-01&category=Food&limit=50&skip=0
 * Headers: Authorization: Bearer <token>
 * 
 * Query Parameters:
 * - month (string, optional): YYYY-MM format for filtering by month
 * - category (string, optional): Filter by category
 * - limit (number, default: 50): Results per page
 * - skip (number, default: 0): Number of results to skip
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "transactions": [
 *     {
 *       "_id": "507f1f77bcf86cd799439011",
 *       "userId": "507f1f77bcf86cd799439010",
 *       "description": "Dinner at restaurant",
 *       "amount": 450,
 *       "date": "2024-01-15T00:00:00.000Z",
 *       "category": "Food & Dining",
 *       "isIncome": false,
 *       "paymentMethod": "UPI",
 *       "note": null,
 *       "receiptUrl": null,
 *       "tags": [],
 *       "recurring": false,
 *       "createdAt": "2024-01-15T10:30:00.000Z"
 *     }
 *   ],
 *   "pagination": {
 *     "total": 150,
 *     "limit": 50,
 *     "skip": 0
 *   }
 * }
 * 
 * Errors:
 * - 401: Unauthorized
 * - 500: Server error
 */

/**
 * 7. CREATE TRANSACTION
 * POST /transactions
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "description": "Dinner at restaurant",
 *   "amount": 450,
 *   "date": "2024-01-15",
 *   "category": "Food & Dining",
 *   "isIncome": false,
 *   "paymentMethod": "UPI",
 *   "note": "Restaurant XYZ",
 *   "receiptUrl": "https://..."
 * }
 * 
 * Note: If category is not provided, it will be auto-categorized using AI
 * 
 * Response (201):
 * {
 *   "success": true,
 *   "message": "Transaction saved successfully",
 *   "transaction": { ... }
 * }
 * 
 * Errors:
 * - 400: Missing required fields or invalid data
 * - 401: Unauthorized
 * - 500: Server error
 */

/**
 * 8. GET SINGLE TRANSACTION
 * GET /transactions/:id
 * Headers: Authorization: Bearer <token>
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "transaction": { ... }
 * }
 * 
 * Errors:
 * - 401: Unauthorized
 * - 404: Transaction not found
 * - 500: Server error
 */

/**
 * 9. UPDATE TRANSACTION
 * PUT /transactions/:id
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body (all fields optional):
 * {
 *   "description": "Updated description",
 *   "amount": 500,
 *   "category": "Shopping",
 *   "date": "2024-01-16",
 *   "note": "Updated note"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "Transaction updated successfully",
 *   "transaction": { ... }
 * }
 * 
 * Errors:
 * - 400: Invalid data
 * - 401: Unauthorized
 * - 404: Transaction not found
 * - 500: Server error
 */

/**
 * 10. DELETE TRANSACTION
 * DELETE /transactions/:id
 * Headers: Authorization: Bearer <token>
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "Transaction deleted successfully"
 * }
 * 
 * Errors:
 * - 401: Unauthorized
 * - 404: Transaction not found
 * - 500: Server error
 */

/**
 * 11. GET TRANSACTION STATISTICS
 * GET /transactions/stats/monthly?month=2024-01
 * Headers: Authorization: Bearer <token>
 * 
 * Query Parameters:
 * - month (string, optional): YYYY-MM format
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "stats": {
 *     "totalIncome": 50000,
 *     "totalExpense": 12000,
 *     "netSavings": 38000,
 *     "transactionCount": 45,
 *     "categoryBreakdown": {
 *       "Food & Dining": 3000,
 *       "Transport": 2000,
 *       "Shopping": 5000,
 *       "Bills & Utilities": 2000
 *     }
 *   }
 * }
 * 
 * Errors:
 * - 401: Unauthorized
 * - 500: Server error
 */

// ============ AI ENDPOINTS ============

/**
 * 12. CATEGORIZE TRANSACTION
 * POST /ai/categorize
 * 
 * Request Body:
 * {
 *   "description": "Dinner at Taj Hotel",
 *   "amount": 2500
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "category": "Food & Dining",
 *   "confidence": 0.95
 * }
 * 
 * Errors:
 * - 400: Missing required fields
 * - 500: Server error
 */

/**
 * 13. QUICK ADD TRANSACTION
 * POST /ai/quick-add
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "text": "Spent 500 on petrol today using UPI"
 * }
 * 
 * Response (201):
 * {
 *   "success": true,
 *   "message": "Transaction added successfully",
 *   "transaction": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "description": "petrol",
 *     "amount": 500,
 *     "isIncome": false,
 *     "paymentMethod": "UPI",
 *     "category": "Transport",
 *     "date": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 * 
 * Errors:
 * - 400: Missing text
 * - 401: Unauthorized
 * - 500: Server error
 */

/**
 * 14. SCAN RECEIPT
 * POST /ai/scan-receipt
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "base64Image": "data:image/png;base64,...",
 *   "createTransaction": true (optional)
 * }
 * 
 * OR
 * 
 * {
 *   "imagePath": "/path/to/receipt.jpg",
 *   "createTransaction": true (optional)
 * }
 * 
 * Response (200 or 201):
 * {
 *   "success": true,
 *   "message": "Receipt scanned successfully",
 *   "receiptDetails": {
 *     "merchant": "Starbucks",
 *     "amount": 450,
 *     "date": "2024-01-15",
 *     "category": "Food & Dining",
 *     "items": ["Coffee", "Sandwich"]
 *   }
 * }
 * 
 * If createTransaction is true, response includes:
 * {
 *   "transaction": { ... }
 * }
 * 
 * Errors:
 * - 400: Missing image
 * - 401: Unauthorized
 * - 500: Server error
 */

/**
 * 15. GENERATE SUMMARY
 * POST /ai/summary
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "month": "2024-01"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "summary": "You spent ₹12,000 this month, which is 20% more than last month. Your biggest expense was on Food & Dining (₹4,500). Consider reducing dining out to save more.",
 *   "transactionCount": 45
 * }
 * 
 * Errors:
 * - 400: Invalid month format
 * - 401: Unauthorized
 * - 500: Server error
 */


// ============ PAYMENT METHODS ============

/**
 * Valid Payment Methods:
 * - Credit/Debit Card
 * - UPI
 * - Bank Transfer
 * - Cash
 * - Others
 */

// ============ RECURRING FREQUENCIES ============

/**
 * Valid Frequencies:
 * - daily
 * - weekly
 * - monthly
 * - yearly
 */

// ============ ERROR CODES ============

/**
 * 400: Bad Request - Invalid input or missing required fields
 * 401: Unauthorized - Missing or invalid JWT token
 * 403: Forbidden - Account deactivated or insufficient permissions
 * 404: Not Found - Resource not found
 * 409: Conflict - Resource already exists (e.g., duplicate email)
 * 500: Internal Server Error - Server-side error
 */

module.exports = {}; // Placeholder for exports
