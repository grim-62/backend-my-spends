# AI API Integration Guide for Kotlin App

This document explains how the Android/Kotlin app should send requests to the backend AI endpoints and how to read the response payloads.

Base URL:
- Local: http://localhost:5000
- Production: use your deployed backend URL

All AI endpoints except `/api/ai/categorize` require a valid JWT token in the Authorization header.

---

## 1) Authentication

Add the token to every request after login:

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Example:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2) Categorize Expense

Endpoint:
- POST /api/ai/categorize

Purpose:
- Classify a transaction description and amount using AI.

Request body:
```json
{
  "description": "Coffee at Starbucks",
  "amount": 250
}
```

Success response:
```json
{
  "success": true,
  "category": "Food & Dining",
  "confidence": 0.94
}
```

Error response:
```json
{
  "success": false,
  "message": "Description and amount are required"
}
```

Kotlin model example:
```kotlin
data class CategoryRequest(
    val description: String,
    val amount: Double
)

data class CategoryResponse(
    val success: Boolean,
    val category: String,
    val confidence: Double
)
```

---

## 3) Quick Add from Natural Language

Endpoint:
- POST /api/ai/quick-add

Purpose:
- Convert a natural-language sentence into a transaction.

Request body:
```json
{
  "text": "Paid 450 for groceries at Reliance Fresh on 12-09-2026"
}
```

Success response:
```json
{
  "success": true,
  "message": "Transaction added successfully",
  "transaction": {
    "_id": "64...",
    "userId": "123...",
    "description": "Reliance Fresh",
    "amount": 450,
    "date": "2026-09-12T00:00:00.000Z",
    "isIncome": false,
    "paymentMethod": "Card",
    "category": "Shopping",
    "createdAt": "2026-09-17T10:00:00.000Z"
  }
}
```

Kotlin model example:
```kotlin
data class QuickAddRequest(
    val text: String
)

data class QuickAddResponse(
    val success: Boolean,
    val message: String,
    val transaction: TransactionPayload?
)
```

---

## 4) Scan Receipt / OCR

Endpoint:
- POST /api/ai/scan-receipt
- POST /api/ai/ocr

Purpose:
- Send a receipt image and read OCR text, then parse merchant, amount, date, and category.

Request body:
```json
{
  "base64Image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "createTransaction": false
}
```

Success response:
```json
{
  "success": true,
  "message": "Receipt scanned successfully",
  "receiptDetails": {
    "merchant": "Starbucks",
    "amount": 250,
    "date": "2026-09-17",
    "category": "Food & Dining",
    "items": [
      "CAPPUCCINO 120",
      "SANDWICH 130"
    ]
  }
}
```

If `createTransaction` is true:
```json
{
  "success": true,
  "message": "Receipt scanned and transaction created",
  "transaction": {
    "description": "Starbucks",
    "amount": 250,
    "category": "Food & Dining"
  },
  "receiptDetails": {
    "merchant": "Starbucks",
    "amount": 250,
    "date": "2026-09-17",
    "category": "Food & Dining",
    "items": []
  }
}
```

Kotlin model example:
```kotlin
data class ReceiptScanRequest(
    val base64Image: String,
    val createTransaction: Boolean = false
)

data class ReceiptDetails(
    val merchant: String,
    val amount: Double,
    val date: String,
    val category: String,
    val items: List<String>
)

data class ReceiptScanResponse(
    val success: Boolean,
    val message: String,
    val receiptDetails: ReceiptDetails?
)
```

Notes for Kotlin app:
- convert image to Base64 before sending
- use JPEG/PNG format
- keep request size reasonable
- for large images, compress before encoding

---

## 5) Monthly Summary

Endpoint:
- POST /api/ai/summary

Purpose:
- Generate a monthly spending summary from user transactions.

Request body:
```json
{
  "month": "2026-09"
}
```

Success response:
```json
{
  "success": true,
  "summary": "You spent ₹2,450 this month...",
  "transactionCount": 12
}
```

If no transactions exist:
```json
{
  "success": true,
  "message": "No transactions found for this month",
  "summary": "No transactions recorded this month."
}
```

---

## 6) Kotlin Request Example

Retrofit example:
```kotlin
interface AiApiService {
    @POST("/api/ai/categorize")
    suspend fun categorize(@Body request: CategoryRequest): CategoryResponse

    @POST("/api/ai/quick-add")
    suspend fun quickAdd(
        @Header("Authorization") token: String,
        @Body request: QuickAddRequest
    ): QuickAddResponse

    @POST("/api/ai/scan-receipt")
    suspend fun scanReceipt(
        @Header("Authorization") token: String,
        @Body request: ReceiptScanRequest
    ): ReceiptScanResponse

    @POST("/api/ai/summary")
    suspend fun summary(
        @Header("Authorization") token: String,
        @Body request: SummaryRequest
    ): SummaryResponse
}
```

---

## 7) Recommended Kotlin Flow

1. User logs in and gets JWT token.
2. App sends AI request with token in Authorization header.
3. Backend responds with JSON.
4. App updates UI state based on `success` flag.
5. For receipt scan, handle `receiptDetails.amount`, `merchant`, and `category` to add transactions.

---

## 8) Error Handling Pattern

Always check:
```kotlin
if (!response.success) {
    // show API message
}
```

Common failure cases:
- missing JWT token
- invalid email or request body
- image not sent
- OCR failed
- no transactions for the summary

---

## 9) Important Notes

- `/api/ai/categorize` is public for testing.
- `/api/ai/quick-add`, `/api/ai/scan-receipt`, `/api/ai/ocr`, and `/api/ai/summary` require authentication.
- Receipts should be sent as compressed base64 images for better performance.
- For production, do not send raw huge images without resizing.

This documentation is meant for the Kotlin app to integrate with the backend AI APIs reliably.
