# SpendSense Backend Structure (Node.js + MongoDB)

This document outlines the proposed structure for the SpendSense backend using Node.js, Express, and MongoDB.

## 1. Project Structure
```text
spend-sense-backend/
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── transaction.controller.js
│   │   └── ai.controller.js  # Categorization, Search, Summaries
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── transaction.routes.js
│   │   └── ai.routes.js
│   ├── services/
│   │   ├── email.service.js  # Send OTP via email
│   │   ├── gemini.service.js # Integration with Google Gemini
│   │   └── ocr.service.js    # Tesseract or Vision API for receipts
│   └── app.js
├── .env
└── package.json
```

## 2. Database Models (Mongoose)

### User Model
```javascript
const userSchema = new mongoose.Schema({
  username:{ type:String ,required: true}
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
});
```

### Transaction Model
```javascript
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, default: null },
  isIncome: { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ['Credit/Debit Card', 'UPI', 'Bank Transfer', null], default: null },
  note: { type: String },
  receiptUrl: { type: String }
});
```

## 3. API Specification

### Authentication

| Endpoint | Method | Request Body | Expected Response (200 OK) |
| :--- | :--- | :--- | :--- |
| `/auth/login` | POST | `{ "email": "user@example.com" }` | `{ "message": "OTP sent to email" }` |
| `/auth/register` | POST | `{ "username":"example","email": "user@example.com" }` | `{ "message": "OTP sent to email" }` |
| `/auth/verify-otp` | POST | `{ "email": "user@example.com", "otp": "123456" }` | `{ "token": "jwt_token_here", "user": { ... } }` |

### Transactions

| Endpoint | Method | Request Body | Expected Response (200 OK) |
| :--- | :--- | :--- | :--- |
| `/transactions` | GET | (Auth Header) | `[{ "id": "...", "description": "...", ... }]` |
| `/transactions` | POST | `{ "description": "Coffee", "amount": 150, "date": "...", "category": "Food", "isIncome": false, "paymentMethod": "UPI" }` | `{ "id": "...", "message": "Transaction saved" }` |
| `/transactions/:id`| PUT | `{ "description": "Updated Coffee", ... }` | `{ "message": "Updated successfully" }` |
| `/transactions/:id`| DELETE| (Auth Header) | `{ "message": "Deleted successfully" }` |

### AI Features

| Endpoint | Method | Request Body | Expected Response |
| :--- | :--- | :--- | :--- |
| `/ai/categorize` | POST | `{ "description": "Dinner at Taj", "amount": 2500 }` | `{ "category": "Food & Dining" }` |
| `/ai/quick-add` | POST | `{ "text": "Spent 500 on petrol today using upi" }` | `{ "description": "petrol", "amount": 500, "isIncome": false, "paymentMethod": "UPI", ... }` |
| `/ai/scan-receipt` | POST | `{ "base64Image": "..." }` | `{ "merchant": "Starbucks", "amount": 450, "date": "...", "category": "Food" }` |
| `/ai/summary` | POST | `{ "month": "2023-10" }` | `{ "summary": "You spent 15% more on dining this month..." }` |

## 4. AI Prompting Logic

*   **Categorization**: "Based on the description '{desc}' and amount '{amt}', suggest a category from: [Food, Transport, Bills, Shopping, Medical, Others]."
*   **Quick Add**: "Parse the following natural language into a transaction JSON: '{text}'. Identify description, amount, date, and payment method if mentioned."
