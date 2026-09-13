# SpendSense Backend API

A production-ready Node.js/Express backend for a mobile expense management application with AI-powered features.

## Features

- **Authentication**: OTP-based login and registration via email
- **Transaction Management**: CRUD operations for expense and income tracking
- **AI Features**:
  - Auto-categorization of transactions using Google Gemini
  - Natural language transaction parsing ("Quick Add")
  - Receipt scanning with OCR (Tesseract)
  - Intelligent spending summaries
- **Budget Tracking**: Set and monitor category-based budgets
- **Security**: JWT authentication, rate limiting, input validation
- **Logging**: Comprehensive request and error logging

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **AI**: Google Gemini API
- **OCR**: Tesseract.js
- **Security**: Helmet, express-mongo-sanitize, rate-limiting

## Installation

### Prerequisites
- Node.js >= 14.0.0
- MongoDB (local or Atlas)
- Google Gemini API key
- Email account with app-specific password (for Gmail)

### Setup Steps

1. **Clone and navigate to project**
```bash
cd backend-my-spends
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server**

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user (send OTP) |
| POST | `/api/auth/login` | Login user (send OTP) |
| POST | `/api/auth/verify-otp` | Verify OTP and get JWT token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get single transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/stats/monthly` | Get monthly statistics |

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/categorize` | Auto-categorize transaction |
| POST | `/api/ai/quick-add` | Add transaction from text |
| POST | `/api/ai/scan-receipt` | Scan receipt with OCR |
| POST | `/api/ai/summary` | Generate monthly summary |

## Request/Response Examples

### Register
**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "email": "john@example.com"
}
```

### Verify OTP
**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Create Transaction
**Request:**
```json
{
  "description": "Dinner at restaurant",
  "amount": 450,
  "date": "2024-01-15",
  "category": "Food & Dining",
  "isIncome": false,
  "paymentMethod": "UPI"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction saved successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "description": "Dinner at restaurant",
    "amount": 450,
    "date": "2024-01-15T00:00:00.000Z",
    "category": "Food & Dining",
    "isIncome": false,
    "paymentMethod": "UPI"
  }
}
```

### Quick Add Transaction
**Request:**
```json
{
  "text": "Spent 500 on petrol today using UPI"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction added successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439011",
    "description": "petrol",
    "amount": 500,
    "isIncome": false,
    "paymentMethod": "UPI",
    "category": "Transport"
  }
}
```

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All errors return JSON with `success: false`:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `500`: Server Error

## Project Structure

```
src/
├── configs/           # Configuration files
│   └── database.js    # MongoDB connection
├── controllers/       # Request handlers
│   ├── auth.controller.js
│   ├── transaction.controller.js
│   └── ai.controller.js
├── models/           # Database schemas
│   ├── User.js
│   ├── Transaction.js
│   └── Budget.js
├── routes/           # API endpoints
│   ├── auth.routes.js
│   ├── transaction.routes.js
│   └── ai.routes.js
├── services/         # Business logic
│   ├── email.service.js
│   ├── gemini.service.js
│   └── ocr.service.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── requestLogger.js
├── utils/           # Utility functions
│   ├── logger.js
│   ├── validators.js
│   └── jwt.js
└── app.js           # Main application file
```

## Environment Variables

Required variables in `.env`:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/spendSense
JWT_SECRET=your-secret-key
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
GEMINI_API_KEY=your-api-key
CORS_ORIGIN=*
```

## Production Deployment

### 1. Update Environment Variables
- Change `NODE_ENV` to `production`
- Update `JWT_SECRET` to a strong random string
- Update `MONGODB_URI` to production database
- Use environment-specific values for all services

### 2. Security Checklist
- ✅ Enable HTTPS
- ✅ Use strong JWT secret
- ✅ Implement rate limiting
- ✅ Set up CORS properly
- ✅ Use environment variables
- ✅ Enable MongoDB authentication
- ✅ Set up logging and monitoring

### 3. Deployment Options

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**AWS/DigitalOcean/Azure:**
- Use PM2 for process management
- Set up reverse proxy (Nginx)
- Enable SSL/TLS certificates
- Configure auto-scaling

## Database Indexes

The application automatically creates indexes on:
- `User.email`
- `Transaction.userId`
- `Transaction.date`
- `Transaction.category`
- `Budget.userId`

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Exemptions**: Health check endpoint

## Logging

Logs are stored in `logs/` directory:
- `app.log`: General application logs
- `error.log`: Error-specific logs

## Performance Considerations

1. Database indexing for faster queries
2. Request rate limiting to prevent abuse
3. Input validation to prevent injection attacks
4. JWT caching in memory
5. Efficient pagination for transaction lists

## Contributing

Follow the code style:
```bash
npm run lint
npm run format
```

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
