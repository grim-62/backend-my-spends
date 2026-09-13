# Dependency Guide - What Each Package Does

## Core Framework & Server

### express (4.18.2)
**Purpose**: Web framework for building REST APIs  
**Why**: Industry standard, minimal, flexible, has huge ecosystem  
**Used in**: Every route, middleware, server setup

```bash
npm install express
```

### dotenv (16.3.1)
**Purpose**: Load environment variables from .env file  
**Why**: Keep secrets out of code, different configs per environment  
**Used in**: src/app.js (first line: `require('dotenv').config()`)

```bash
npm install dotenv
```

---

## Database

### mongoose (7.5.0)
**Purpose**: MongoDB object modeling & validation  
**Why**: Schemas, validation, indexing, easy querying  
**Used in**: All model files, database operations  

**Key Features**:
- Schema validation
- Automatic migrations
- Query building
- Population (joins)
- Hooks (pre/post operations)

```bash
npm install mongoose
```

---

## Authentication & Security

### jsonwebtoken (9.1.0)
**Purpose**: Generate & verify JWT tokens  
**Why**: Stateless authentication, mobile-friendly  
**Used in**: 
- src/utils/jwt.js (generateToken, verifyToken)
- src/middleware/auth.js (token verification)

```bash
npm install jsonwebtoken
```

### bcryptjs (2.4.3)
**Purpose**: Hash passwords securely  
**Why**: One-way hashing, salt-based, resistant to attacks  
**Note**: Currently prepared for future password storage needs  

```bash
npm install bcryptjs
```

### helmet (7.0.0)
**Purpose**: Set HTTP security headers  
**Why**: Prevent common web vulnerabilities  
**Headers set**:
- X-Frame-Options (clickjacking)
- X-Content-Type-Options (MIME sniffing)
- X-XSS-Protection (XSS attacks)
- Strict-Transport-Security (HTTPS)
- CSP (Content Security Policy)

```bash
npm install helmet
```

### express-rate-limit (7.0.0)
**Purpose**: Limit repeated requests from same IP  
**Why**: Prevent brute force, DoS attacks, API abuse  
**Config**: 100 requests per 15 minutes  
**Used in**: src/app.js

```bash
npm install express-rate-limit
```

### express-mongo-sanitize (2.2.0)
**Purpose**: Prevent NoSQL injection attacks  
**Why**: Sanitize user input, remove $ and . characters  
**Used in**: src/app.js (middleware)

```bash
npm install express-mongo-sanitize
```

---

## HTTP & Network

### cors (2.8.5)
**Purpose**: Enable Cross-Origin Resource Sharing  
**Why**: Allow requests from different domains (Android app)  
**Config**: Can restrict to specific domains in production  
**Used in**: src/app.js (middleware)

```bash
npm install cors
```

### axios (1.6.0)
**Purpose**: HTTP client for making requests  
**Why**: Better than fetch, built-in interceptors, timeout support  
**Used in**: Optional for future API integrations  

```bash
npm install axios
```

---

## Email

### nodemailer (6.9.6)
**Purpose**: Send emails via SMTP  
**Why**: Industry standard, supports Gmail, SendGrid, custom SMTP  
**Used in**: src/services/email.service.js

**Features**:
- Send OTP emails
- HTML templates
- Attachment support
- Custom SMTP servers

```bash
npm install nodemailer
```

**Gmail Setup**:
1. Enable 2FA on Gmail account
2. Generate app-specific password
3. Use in EMAIL_PASSWORD

---

## AI & ML

### @google/generative-ai (0.3.0)
**Purpose**: Google Gemini AI API client  
**Why**: State-of-the-art language model, good free tier  
**Used in**: src/services/gemini.service.js

**Features**:
- Transaction categorization
- Natural language parsing
- Expense summaries
- Graceful fallbacks

```bash
npm install @google/generative-ai
```

**Setup**:
1. Create Google account
2. Get API key from [AI Studio](https://aistudio.google.com)
3. Enable Generative Language API
4. Add to .env as GEMINI_API_KEY

---

## Image Processing & OCR

### tesseract.js (5.0.0)
**Purpose**: Optical Character Recognition (OCR) for images  
**Why**: Extract text from receipt images without server-side processing  
**Used in**: src/services/ocr.service.js

**Features**:
- Extract text from images
- Identify receipt details
- Recognize handwriting
- Multiple language support

```bash
npm install tesseract.js
```

**Note**: Can be replaced with:
- Google Vision API (cloud-based, paid)
- AWS Rekognition (cloud-based, paid)
- AWS Textract (cloud-based, paid)

---

## Development Dependencies

### nodemon (3.0.1)
**Purpose**: Auto-restart server on file changes  
**Why**: Better development experience, faster iteration  
**Usage**: `npm run dev`  

```bash
npm install --save-dev nodemon
```

### jest (29.7.0)
**Purpose**: Testing framework  
**Why**: Comprehensive, fast, supports mocking  
**Usage**: `npm run test`  

```bash
npm install --save-dev jest
```

### supertest (6.3.3)
**Purpose**: HTTP assertion library for testing APIs  
**Why**: Easy API endpoint testing  
**Used with**: Jest for testing routes

```bash
npm install --save-dev supertest
```

### eslint (8.50.0)
**Purpose**: Code linting & quality checking  
**Why**: Catch errors early, enforce code style  
**Usage**: `npm run lint`  

```bash
npm install --save-dev eslint
```

### eslint-config-airbnb-base (15.0.0)
**Purpose**: Airbnb's ESLint config (popular standard)  
**Why**: Consistent, battle-tested, widely used  

```bash
npm install --save-dev eslint-config-airbnb-base eslint-plugin-import
```

### prettier (3.0.3)
**Purpose**: Code formatter  
**Why**: Automatic formatting, no debates, saves time  
**Usage**: `npm run format`  

```bash
npm install --save-dev prettier
```

---

## Installation Script

All dependencies are in `package.json`. Install with:

```bash
npm install
```

This installs:
- 11 production dependencies
- 7 development dependencies
- Total ~50 packages (with nested dependencies)

---

## Dependency Tree (Simplified)

```
backend-my-spends
├── express
│   ├── cors
│   ├── helmet
│   ├── express-rate-limit
│   └── express-mongo-sanitize
│
├── mongoose
│   └── (MongoDB driver)
│
├── jsonwebtoken
│   └── (crypto libraries)
│
├── nodemailer
│   └── (SMTP libraries)
│
├── @google/generative-ai
│   └── (HTTP client)
│
├── tesseract.js
│   └── (WASM OCR engine)
│
└── Development Tools
    ├── nodemon
    ├── jest
    ├── supertest
    ├── eslint
    └── prettier
```

---

## Size & Performance

| Package | Size | Purpose |
|---------|------|---------|
| express | 50KB | Framework |
| mongoose | 2MB | Database |
| tesseract.js | 100MB+ | OCR |
| @google/generative-ai | 200KB | AI |
| nodemailer | 300KB | Email |
| jsonwebtoken | 100KB | Auth |
| Others | 1MB | Various |

**Total node_modules**: ~400-500 MB

---

## Version Strategy

All versions use **caret ranges** (^X.Y.Z):
- Installs compatible minor/patch updates
- Security updates included automatically
- Major version changes require manual update

---

## Common Issues & Solutions

### Email not sending
- Check EMAIL_USER and EMAIL_PASSWORD
- Verify app-specific password (not regular password)
- Check Gmail security settings

### Gemini API errors
- Verify API key is valid
- Check API is enabled
- Verify account has free quota
- Fallback to 'Others' category

### OCR not working
- Tesseract.js is large (~100MB)
- First run downloads WASM engine
- Can use image path or base64

### MongoDB connection
- Check MONGODB_URI format
- Verify MongoDB is running
- Check credentials if using Atlas

---

## Updating Dependencies

Check for updates:
```bash
npm outdated
```

Update all:
```bash
npm update
```

Update specific:
```bash
npm install package-name@latest
```

---

## Removing Unused Dependencies

If you don't use OCR:
```bash
npm remove tesseract.js
```

If you use different AI:
```bash
npm remove @google/generative-ai
npm install openai  # for example
```

---

## Alternative Packages

### Database
- **PostgreSQL** - `pg` + `sequelize`
- **Firebase** - `firebase-admin`
- **Supabase** - `@supabase/supabase-js`

### Email
- **SendGrid** - `@sendgrid/mail`
- **Mailgun** - `mailgun.js`
- **AWS SES** - `@aws-sdk/client-ses`

### AI
- **OpenAI** - `openai`
- **Hugging Face** - `@huggingface/inference`
- **Claude** - `@anthropic-ai/sdk`

### OCR
- **Google Vision** - `@google-cloud/vision`
- **AWS Textract** - `aws-sdk`
- **Azure Computer Vision** - `@azure/cognitiveservices-vision-computervision`

---

## Dependency Security

Check for vulnerabilities:
```bash
npm audit
```

Fix automatically:
```bash
npm audit fix
```

---

**All dependencies are production-tested and widely used in enterprise applications.**
