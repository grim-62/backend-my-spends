# Quick Start Guide

## Installation & Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages. **Note:** You will need to install packages manually as requested.

### 2. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file and add:
- MongoDB connection string
- JWT secret
- Email credentials
- Google Gemini API key

### 3. Start Development Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com"
  }'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

**Create Transaction** (with JWT token):
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Lunch",
    "amount": 300,
    "category": "Food & Dining",
    "isIncome": false,
    "paymentMethod": "UPI"
  }'
```

### Using Postman

1. Import the API collection (optional, create from scratch)
2. Set variables:
   - `BASE_URL`: http://localhost:5000/api
   - `TOKEN`: Your JWT token (after login)

3. Test endpoints in this order:
   - Register → Verify OTP → Create Transaction → Get Transactions

### Using Thunder Client / REST Client

Create `.rest` file or use Thunder Client GUI to test endpoints.

## Project Structure

```
src/
├── app.js                 # Express server setup
├── configs/               # Configuration
│   └── database.js        # MongoDB connection
├── models/                # Database schemas
│   ├── User.js
│   ├── Transaction.js
│   └── Budget.js
├── controllers/           # Business logic
│   ├── auth.controller.js
│   ├── transaction.controller.js
│   └── ai.controller.js
├── routes/                # API routes
│   ├── auth.routes.js
│   ├── transaction.routes.js
│   └── ai.routes.js
├── services/              # External services
│   ├── email.service.js
│   ├── gemini.service.js
│   └── ocr.service.js
├── middleware/            # Express middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── requestLogger.js
├── utils/                 # Utility functions
│   ├── logger.js
│   ├── jwt.js
│   ├── validators.js
│   └── response.js
└── constants/             # App constants
    └── index.js
```

## Common Development Tasks

### Add New Endpoint

1. **Create controller method** in `src/controllers/`
```javascript
exports.newEndpoint = async (req, res) => {
  try {
    // Business logic
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error' });
  }
};
```

2. **Add route** in appropriate file in `src/routes/`
```javascript
router.post('/new-route', authenticate, newEndpoint);
```

3. **Test the endpoint**

### Update Database Schema

1. Edit model file in `src/models/`
2. MongoDB will auto-migrate on schema change
3. Add validation if needed

### Add New Service

1. Create file in `src/services/`
2. Export functions
3. Import in controller

### Add Middleware

1. Create file in `src/middleware/`
2. Export middleware function
3. Add to `app.js` with `app.use()`

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test -- --coverage
```

## Code Quality

### Linting
```bash
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors
```

### Formatting
```bash
npm run format        # Format all files
```

## Debugging

### Debug with Node Inspector
```bash
node --inspect src/app.js
```

Then open `chrome://inspect` in Chrome

### Using Debugger
```javascript
// Add this in code
debugger;

// Run with:
node --inspect src/app.js
```

### Using VS Code
Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/app.js",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

Then press F5 to start debugging.

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment type | development/production |
| `MONGODB_URI` | MongoDB connection | mongodb://localhost:27017/spendSense |
| `JWT_SECRET` | JWT signing key | your-secret-key-32chars-min |
| `EMAIL_SERVICE` | Email provider | gmail |
| `EMAIL_USER` | Email account | your-email@gmail.com |
| `EMAIL_PASSWORD` | App password | app-specific-password |
| `GEMINI_API_KEY` | Google Gemini key | your-api-key |
| `CORS_ORIGIN` | Allowed CORS origins | * or specific domain |

## Troubleshooting

### MongoDB Connection Error
- Check MongoDB is running
- Verify connection string in .env
- Check credentials if using Atlas

### Email Not Sending
- Verify email credentials
- Check app password (not regular password for Gmail)
- Review email logs in application

### API Returns 401
- Check JWT token is valid
- Verify Authorization header format: `Bearer <token>`
- Ensure token hasn't expired

### Slow Queries
- Check database indexes
- Review query logs
- Use MongoDB Atlas performance advisor

### Memory Leak
- Check for circular references
- Review async operations
- Use `node --inspect` to profile

## Next Steps

1. ✅ Install dependencies
2. ✅ Setup .env file
3. ✅ Start dev server
4. ✅ Test API endpoints
5. ⏭️ Modify for your needs
6. ⏭️ Deploy to production

## Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Google Gemini API](https://ai.google.dev/)
- [Nodemailer Docs](https://nodemailer.com/)

## Getting Help

- Check logs in `logs/` directory
- Review error messages carefully
- Check API_DOCUMENTATION.md for endpoint specs
- Review README.md for overview
