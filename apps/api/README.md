# PropScholar API

A robust Node.js TypeScript API with JWT authentication, 2-step verification, and comprehensive email functionality.

## Features

- 🔐 **JWT Authentication** with access and refresh tokens
- 📧 **2-Step Email Verification** with OTP
- 🛡️ **Security** with helmet, rate limiting, and CORS
- 📨 **Email Service** with beautiful HTML templates
- 🗄️ **MongoDB** with Mongoose ODM
- ✅ **Input Validation** with express-validator
- 📝 **Comprehensive Logging** with custom logger
- 🚀 **Hot Reload** development with tsx
- 🏗️ **Clean Architecture** with proper separation of concerns

## Project Structure

```
src/
├── config/
│   └── database.ts          # MongoDB connection configuration
├── controllers/
│   └── authController.ts    # Authentication business logic
├── helpers/                 # Helper functions (for future use)
├── middleware/
│   ├── auth.ts             # JWT authentication middleware
│   ├── rateLimiter.ts      # Rate limiting configurations
│   └── validation.ts       # Input validation rules
├── models/
│   └── User.ts             # User Mongoose model
├── routes/
│   ├── authRoutes.ts       # Authentication routes
│   └── index.ts            # Main routes index
├── services/
│   └── emailService.ts     # Email service with templates
├── types/
│   ├── auth.types.ts       # Authentication TypeScript interfaces
│   └── email.types.ts      # Email TypeScript interfaces
├── utils/
│   ├── jwt.ts              # JWT utility functions
│   └── logger.ts           # Custom logging utility
└── app.ts                  # Main application entry point
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/propscholar
MONGODB_TEST_URI=mongodb://localhost:27017/propscholar_test

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-change-in-production
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=PropScholar

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# OTP Configuration
OTP_EXPIRE_MINUTES=10
OTP_LENGTH=6

# Security
BCRYPT_SALT_ROUNDS=12
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/auth/signup` | User registration | 5/15min |
| POST | `/api/auth/login` | User login (sends OTP) | 5/15min |
| POST | `/api/auth/verify-otp` | Verify OTP for login | 3/5min |
| POST | `/api/auth/request-otp` | Request new OTP | 3/5min |
| POST | `/api/auth/verify-email` | Verify email address | 5/hour |
| POST | `/api/auth/forgot-password` | Request password reset | 3/hour |
| POST | `/api/auth/reset-password` | Reset password with token | 3/hour |
| POST | `/api/auth/refresh-token` | Refresh JWT tokens | - |
| GET | `/api/health` | Health check | - |

### Protected Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/profile` | Get user profile | ✅ |
| POST | `/api/auth/change-password` | Change password | ✅ |
| POST | `/api/auth/logout` | Logout (invalidate refresh token) | ✅ |
| POST | `/api/auth/logout-all` | Logout from all devices | ✅ |

## Request/Response Examples

### User Signup

**Request:**
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "isEmailVerified": false,
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### User Login (2-Step Process)

**Step 1 - Submit credentials:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete login.",
  "requiresOTP": true
}
```

**Step 2 - Verify OTP:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

## Email Templates

The API includes beautiful HTML email templates for:

1. **Welcome Email** - Sent after signup with verification link
2. **Email Verification** - Standalone email verification
3. **OTP Email** - Login verification code
4. **Password Reset** - Password reset link
5. **Password Changed** - Confirmation of password change

## Security Features

- **Rate Limiting** - Different limits for various endpoints
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing configuration
- **JWT** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable salt rounds
- **Input Validation** - Comprehensive request validation
- **SQL Injection Protection** - MongoDB native protection
- **XSS Protection** - Express built-in protection

## Development

### Prerequisites

- Node.js 18+
- MongoDB
- pnpm

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB locally or use MongoDB Atlas

4. Start development server:
```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

### Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Testing

Health check endpoint to verify API is running:

```bash
curl http://localhost:3000/api/health
```

## Production Deployment

1. Set environment variables for production
2. Ensure MongoDB is accessible
3. Configure email service (Gmail App Password recommended)
4. Run:
```bash
pnpm build
pnpm start
```

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Logging

- Development: Console logging with detailed information
- Production: File logging to `logs/app.log`
- Different log levels: ERROR, WARN, INFO, DEBUG

## Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Add validation for new endpoints
5. Update this README for new features 