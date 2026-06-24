# Payment Gateway

A comprehensive, enterprise-grade fintech backend platform for managing financial transactions, organizations, merchants, and digital payments in Malawi. Built with Node.js, Express, and MySQL, this API gateway powers the complete financial operations ecosystem.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Audit Logging System](#audit-logging-system)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 📖 Overview

The payment gateway is a production-ready backend platform designed to:

- Facilitate secure digital payments through multiple payment channels (Airtel Money, TNM)
- Manage merchant onboarding and account management
- Process financial transactions with comprehensive audit trails
- Provide organization-based multi-tenancy support
- Enable webhook-based integration with external systems
- Track financial activities with immutable audit logs
- Manage API keys, permissions, and access control
- Generate financial dashboards and analytics

**Use Cases:**
- Payment service providers needing transaction processing infrastructure
- Organizations requiring account management and fund transfers
- Merchants needing payment processing capabilities
- Financial institutions managing multi-tenant operations

## 🏗️ Architecture

### Layered Architecture

The application follows a clean, layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     API Routes Layer                        │
│  (Express Routes - HTTP endpoint definitions)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Middleware Layer                          │
│  (Auth, Audit Logging, Rate Limiting, Validation)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 Controllers Layer                           │
│  (Request handling, response formatting, orchestration)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Services Layer                             │
│  (Business logic, validation, workflow orchestration)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Repository/Model Layer                     │
│  (Data access, database queries, persistence)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Database Layer (MySQL)                         │
│  (Persistent data storage and transactions)                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
HTTP Request
    ↓
Routes (Match URL → Controller)
    ↓
Middleware (Auth → Audit → Validation)
    ↓
Controllers (Parse request → Call service)
    ↓
Services (Validate → Process → Return result)
    ↓
Models (Query database → Return data)
    ↓
MySQL Database
    ↓
Response → Audit Log (async) → HTTP Response
```

## 🚀 Core Features

### 1. **User & Admin Management**
- User registration with email verification
- Admin account creation and management
- Role-based access control (Admin, Organization, Finance Manager)
- Password management with secure hashing (bcryptjs)
- Account activation with temporary passwords
- Multi-factor authentication support

### 2. **Organization Management**
- Multi-tenant organization structure
- Organization types and categorization
- Organization details (contact, address, metadata)
- Status management (active, inactive, suspended)
- Organization-specific API keys for secure integrations

### 3. **Merchant Management**
- Merchant registration and onboarding
- Business profile information
- Status tracking and activation
- Merchant login authentication
- Contact person details

### 4. **Account Management**
- Account creation with unique account numbers
- Multi-currency support
- Balance tracking (available, ledger, reserved)
- Daily transaction limits (credit/debit)
- Account entry tracking and history
- Account status management

### 5. **Transaction Processing**
- Transaction creation with unique IDs
- Support for multiple payment channels (Airtel Money, TNM)
- Merchant reference tracking for reconciliation
- Transaction fees calculation
- Status management (PENDING, COMPLETED, FAILED, CANCELLED, REVERSED)
- Transaction history and detailed tracking
- Automatic webhook dispatching on transaction events

### 6. **Charge Management**
- Charge profile creation and configuration
- Charge items for flexible pricing models
- Status tracking for charge profiles
- Integration with transactions

### 7. **Payment Processing**
- Payment initiation requests with validation
- API-based payment channel integration
- Rate limiting to prevent abuse
- Payment status updates
- Webhook notifications on payment completion

### 8. **OTP Authentication**
- One-time password generation and verification
- Email delivery via Resend service
- Time-limited OTP validity (15 minutes)
- Multiple OTP use cases (login, password reset, verification)
- OTP cleanup and expiration handling

### 9. **Webhook Management**
- Webhook registration per organization
- Event-based webhook dispatching
- Webhook retry logic with backoff
- Event history tracking
- Webhook event logging

### 10. **API Key Management**
- API key generation for organizations
- API key validation on requests
- Key status management (active, inactive, revoked)
- Rate limiting per API key
- Secure key storage

### 11. **Audit Logging**
- Comprehensive activity tracking for all mutations
- Automatic logging of all POST, PUT, PATCH, DELETE operations
- User attribution to every action
- Request/response payload logging
- IP address and user-agent tracking
- Search and filtering capabilities
- Audit trail for compliance and security

### 12. **Dashboard & Analytics**
- Summary statistics and KPIs
- Transaction volume metrics
- Financial dashboards
- Organization performance tracking

## 🛠️ Technology Stack

### Backend Framework
- **Express.js** (v4.18.2) - Web framework for Node.js
- **Node.js** - Runtime environment

### Database
- **MySQL** (mysql2 v3.19.0) - Primary relational database
- **Connection pooling** - Optimized database connections

### Authentication & Security
- **JWT** (jsonwebtoken v9.0.3) - Token-based authentication
- **bcryptjs** (v2.4.3) - Password hashing
- **cookie-parser** (v1.4.7) - Cookie management
- **express-rate-limit** (v8.3.0) - Rate limiting

### Validation & Middleware
- **joi** (v18.0.2) - Schema validation
- **express-validator** (v7.0.1) - Request validation
- **cors** (v2.8.5) - Cross-origin resource sharing

### File Handling
- **multer** (v1.4.5-lts.1) - File upload handling
- **http-proxy-middleware** (v3.0.5) - Request proxying

### Email & Notifications
- **Resend** (v6.9.3) - Email delivery service
- **nodemailer** (v6.10.1) - Alternative email service

### Utilities
- **axios** (v1.13.6) - HTTP client
- **uuid** (v9.0.1) - Unique ID generation
- **dotenv** (v16.3.1) - Environment configuration

### Development
- **nodemon** (v3.1.14) - Auto-restart on file changes

## 📁 Project Structure

```
fundme-backend/
├── src/
│   ├── index.js                      # Application entry point
│   ├── db.js                         # Database connection setup
│   │
│   ├── controllers/                  # Request handlers
│   │   ├── accountController.js
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── merchantsController.js
│   │   ├── paymentController.js
│   │   ├── organizationController.js
│   │   ├── dashboardController.js
│   │   ├── webhookController.js
│   │   ├── auditLogController.js
│   │   └── ...
│   │
│   ├── services/                     # Business logic layer
│   │   ├── accountService.js
│   │   ├── authService.js
│   │   ├── transactionService.js
│   │   ├── merchantsService.js
│   │   ├── webhookService.js
│   │   ├── emailService.js
│   │   ├── otpService.js
│   │   └── ...
│   │
│   ├── models/                       # Data access & persistence
│   │   ├── User.js
│   │   ├── Account.js
│   │   ├── Transaction.js
│   │   ├── OrganizationModel.js
│   │   ├── MerchantsModel.js
│   │   ├── AuditLog.js
│   │   ├── Webhook.js
│   │   └── ...
│   │
│   ├── routes/                       # HTTP endpoint definitions
│   │   ├── authRoutes.js
│   │   ├── accountRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── merchantsRoutes.js
│   │   ├── organizationRoutes.js
│   │   ├── webhookRoutes.js
│   │   ├── auditLogRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── ...
│   │
│   ├── middleware/                   # Request processing middleware
│   │   ├── auth.js                   # JWT authentication
│   │   ├── auditLogger.js            # Audit logging
│   │   ├── rateLimiter.js            # Rate limiting
│   │   ├── validateUser.js           # User validation
│   │   ├── validatePayment.js        # Payment validation
│   │   ├── validateApiKey.js         # API key validation
│   │   ├── errorHandler.js           # Error handling
│   │   ├── camelToSnake.js           # Case conversion
│   │   └── ...
│   │
│   ├── config/                       # Configuration files
│   │   └── multer.js                 # File upload configuration
│   │
│   ├── enums/                        # Enum definitions
│   │   └── AuditActivityEnum.js      # Audit action types
│   │
│   ├── repository/                   # Data repository layer
│   │   ├── userRepository.js
│   │   └── MerchantRepository.js
│   │
│   └── utils/                        # Utility functions
│
├── uploads/                          # File storage directory
├── package.json                      # Dependencies & scripts
├── .env                              # Environment variables (not in repo)
├── README.md                         # This file
├── AUDIT_LOGGING.md                  # Audit system documentation
├── IMPLEMENTATION_SUMMARY.md         # Recent changes
└── merchants.json                    # Sample merchant data

```

## 🚀 Getting Started

### Prerequisites

- Node.js 14+ and npm
- MySQL 5.7+ database
- Resend API key for email delivery
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fundme-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=malipo_core
   DB_PORT=3306

   # JWT
   JWT_SECRET=your_super_secret_jwt_key

   # Email
   RESEND_API_KEY=your_resend_api_key

   # Payment Channels
   AIRTEL_API_KEY=your_airtel_key
   TNM_API_KEY=your_tnm_key
   ```

4. **Set up the database**
   ```bash
   # Import the database schema
   mysql -u root -p malipo_core < database/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

6. **Test the API**
   ```bash
   curl http://localhost:5000/hello
   # Expected response: { "message": "Welcome to my Backend" }
   ```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

Two authentication methods are supported:

#### 1. Bearer Token (Authorization Header) - Admin
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/accounts
```

#### 2. Cookie (access_token) - Organization
```bash
curl -b "access_token=YOUR_JWT_TOKEN" \
     http://localhost:5000/api/transactions
```

### Core Endpoints

#### Authentication
```
POST   /auth/signup                      # Register new user
POST   /auth/login                       # Login
POST   /auth/otp/generate                # Generate OTP
POST   /auth/otp/verify                  # Verify OTP
POST   /auth/password-reset              # Initiate password reset
POST   /auth/password-reset-confirm      # Confirm password reset
POST   /auth/token                       # Get JWT token
POST   /auth/refresh                     # Refresh JWT token
```

#### Users
```
POST   /users                            # Create user
GET    /users                            # List users
GET    /users/:id                        # Get user
PUT    /users/:id                        # Update user
POST   /users/:id/activate               # Activate user
DELETE /users/:id                        # Delete user
```

#### Merchants
```
POST   /merchants                        # Create merchant
GET    /merchants                        # List merchants
GET    /merchants/:id                    # Get merchant
POST   /merchants/login                  # Login merchant
POST   /merchants/update                 # Update merchant
DELETE /merchants/:id                    # Delete merchant
```

#### Organizations
```
POST   /organizations                    # Create organization
GET    /organizations                    # List organizations
GET    /organizations/:id                # Get organization
PUT    /organizations/:id                # Update organization
PATCH  /organizations/:id/status         # Update status
DELETE /organizations/:id                # Delete organization
```

#### Accounts
```
POST   /accounts                         # Create account
GET    /accounts                         # List accounts
GET    /accounts/:id                     # Get account
PUT    /accounts/:id                     # Update account
PATCH  /accounts/:id/status              # Update status
PATCH  /accounts/:id/balance             # Update balance
DELETE /accounts/:id                     # Delete account
```

#### Transactions
```
POST   /transactions                     # Create transaction
GET    /transactions                     # List transactions
GET    /transactions/:id                 # Get transaction
PUT    /transactions/:id                 # Update transaction
PATCH  /transactions/:id/status          # Update status
POST   /transactions/payment-initiate-request  # Initiate payment
```

#### Webhooks
```
POST   /webhooks                         # Register webhook
GET    /webhooks                         # List webhooks
GET    /webhooks/:id                     # Get webhook
PUT    /webhooks/:id                     # Update webhook
PATCH  /webhooks/:id/status              # Update status
DELETE /webhooks/:id                     # Delete webhook
```

#### API Keys
```
POST   /api-keys/generate                # Generate API key
GET    /api-keys                         # List API keys
PATCH  /api-keys/:id/status              # Update status
DELETE /api-keys/:id                     # Revoke API key
```

#### Audit Logs
```
GET    /audit-logs                       # List audit logs
GET    /audit-logs/:id                   # Get audit log
GET    /audit-logs/search                # Search audit logs
```

#### Dashboard
```
GET    /dashboard/summary                # Get dashboard summary
```

### Example Requests

#### Create Organization
```bash
POST /api/organizations HTTP/1.1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Acme Trading Co.",
  "contactEmail": "contact@acme.com",
  "contactPhone": "+265991234567",
  "organizationTypeId": 1,
  "shortCode": "ACME",
  "description": "Leading trading company",
  "address_line1": "123 Main Street",
  "city": "Lilongwe"
}
```

#### Create Transaction
```bash
POST /api/transactions HTTP/1.1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "merchant_reference": "MER123456",
  "payment_channel": "AIRTEL",
  "phone_number": "+265991234567",
  "transaction_amount": 10000,
  "transaction_fee": 250,
  "transaction_type_id": 1
}
```

#### Initialize Payment
```bash
POST /api/transactions/payment-initiate-request HTTP/1.1
Authorization: Bearer YOUR_TOKEN
x-api-key: YOUR_API_KEY
Content-Type: application/json

{
  "merchant_reference": "MER123456",
  "payment_channel": "TNM",
  "phone_number": "+265991234567",
  "amount": 10000,
  "callback_url": "https://yourapp.com/webhook"
}
```

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)

The system supports multiple user roles with hierarchical permissions:

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | System administrator | Full access to all resources |
| `organization` | Organization account | Access to own organization data |
| `finance_manager` | Finance operations | Account and transaction management |
| `merchant` | Merchant account | Payment processing |
| `user` | Regular user | Limited organization access |

### JWT Token Structure

```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "phone": "+265991234567",
  "iat": 1678600000,
  "exp": 1679200000
}
```

### Access Control Example

```javascript
// Only admin users
router.get('/resource', authMiddleware(['admin']), controller.handler);

// Admin or organization users
router.get('/resource', 
  authMiddleware(['admin', 'organization']), 
  controller.handler);

// Multiple roles
router.post('/resource',
  authMiddleware(['admin', 'finance_manager', 'merchant']),
  controller.handler);
```

## 📋 Audit Logging System

The system implements comprehensive audit logging for compliance, security, and accountability.

### Features

✅ **Automatic Activity Tracking** - All mutations are logged without code changes
✅ **Enum-Based Classification** - Standardized action types (CREATE, UPDATE, DELETE, etc.)
✅ **User Attribution** - Every action linked to the user who performed it
✅ **Request/Response Logging** - Full payload tracking for debugging and compliance
✅ **IP & User-Agent Tracking** - Client information for security audits
✅ **Non-Blocking** - Async logging doesn't impact request performance

### Audit Log Schema

```javascript
{
  _id: ObjectId,
  userId: 123,
  userEmail: "user@example.com",
  action: "CREATE",              // from AuditAction enum
  resourceType: "account",        // from AuditResourceType enum
  resourceId: "ACC123",
  method: "POST",
  endpoint: "/api/accounts",
  statusCode: 201,
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  requestBody: { ... },
  responseData: { ... },
  timestamp: "2026-03-13T10:30:00Z",
  organizationId: 456
}
```

### Searching Audit Logs

```bash
# Get all audit logs
GET /api/audit-logs

# Filter by user
GET /api/audit-logs?userId=123

# Filter by action
GET /api/audit-logs?action=CREATE

# Filter by resource type
GET /api/audit-logs?resourceType=account

# Filter by date range
GET /api/audit-logs?startDate=2026-03-01&endDate=2026-03-31
```

For detailed audit system documentation, see [AUDIT_LOGGING.md](AUDIT_LOGGING.md).

## 🗄️ Database Schema

### Key Tables

#### users
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (admin, organization, etc.)
- `organization_id` - Foreign key to organizations
- `is_activated` - Account activation status
- `created_at`, `updated_at` - Timestamps

#### organizations
- `id` - Primary key
- `name` - Organization name
- `short_code` - Unique short code
- `contact_email`, `contact_phone` - Contact info
- `organization_type_id` - Foreign key
- `status` - active/inactive/suspended
- `created_at`, `updated_at` - Timestamps

#### accounts
- `id` - Primary key
- `account_number` - Unique account identifier
- `account_name`, `account_mnemonics` - Account details
- `organization_id` - Foreign key
- `available_balance`, `ledger_balance`, `reserved_balance` - Balance tracking
- `daily_credit_limit`, `daily_debit_limit` - Transaction limits
- `account_status` - active/inactive/suspended
- `created_at`, `last_modified_at` - Timestamps

#### transactions
- `transaction_id` - Unique transaction ID
- `merchant_reference` - External reference
- `organization_id` - Foreign key
- `payment_channel` - AIRTEL, TNM, etc.
- `phone_number` - Phone for transaction
- `transaction_amount` - Amount in base currency
- `transaction_fee` - Transaction fee
- `status` - PENDING/COMPLETED/FAILED/CANCELLED/REVERSED
- `created_at`, `last_modified_at` - Timestamps

#### audit_logs
- `_id` - MongoDB ObjectId
- `userId` - Foreign key to users
- `action` - Audit action type
- `resourceType` - Resource being acted upon
- `resourceId` - ID of resource
- `requestBody` - Request payload
- `responseData` - Response payload
- `timestamp` - When action occurred
- `ipAddress`, `userAgent` - Client info

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
NODE_ENV=production npm start
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 5000
CMD ["node", "src/index.js"]
```

Build and run:
```bash
docker build -t payment-backend:1.0 .
docker run -p 5000:5000 --env-file .env payment-backend:1.0
```

### Environment Configuration for Production

```env
NODE_ENV=production
PORT=5000

# Database with production credentials
DB_HOST=prod-db.example.com
DB_USER=prod_user
DB_PASSWORD=<secure_password>
DB_NAME=malipo_core_prod
DB_PORT=3306

# JWT with strong secret
JWT_SECRET=<long_random_secure_string>

# Email service
RESEND_API_KEY=<production_key>

# Payment channel credentials
AIRTEL_API_KEY=<production_airtel_key>
TNM_API_KEY=<production_tnm_key>
```

### Monitoring & Logging

- Monitor application logs: `tail -f logs/app.log`
- Monitor database connections: Check MySQL connection pool
- Set up alerts for error rates and transaction failures
- Use centralized logging service (ELK, Datadog, etc.)

## 🔄 Webhook System

### Webhook Registration

Organizations can register webhooks to receive events:

```bash
POST /api/webhooks
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "organization_id": 123,
  "event_type": "transaction.created",
  "webhook_url": "https://yourapp.com/webhook",
  "headers": {
    "Authorization": "Bearer YOUR_SECRET"
  }
}
```

### Supported Events

- `transaction.created` - New transaction created
- `transaction.status_updated` - Transaction status changed
- `account.created` - Account created
- `payment.completed` - Payment completed
- `payment.failed` - Payment failed

### Webhook Retry Logic

- Failed webhooks are retried up to 3 times
- Exponential backoff: 1s, 5s, 15s
- Failed delivery is logged in webhook_events table

## 📊 Rate Limiting

API requests are rate-limited to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **API Key**: 1000 requests per 15 minutes per key
- **Payment Endpoints**: 50 requests per minute

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1678687200
```

## 🐛 Error Handling

### Error Response Format

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| INVALID_TOKEN | 401 | JWT token invalid or expired |
| INSUFFICIENT_ROLE | 403 | User role lacks permission |
| RESOURCE_NOT_FOUND | 404 | Resource doesn't exist |
| DUPLICATE_RESOURCE | 409 | Resource already exists |
| VALIDATION_FAILED | 422 | Input validation failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

## 📝 Logging

Application logs include:

- **Authentication events** - Logins, token generation, failures
- **Audit events** - All mutations with user attribution
- **API errors** - Error stack traces and context
- **Database queries** - Query execution times (debug mode)

Access logs location: `logs/` directory

## 🔒 Security Features

- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **JWT Authentication** - Stateless token-based auth
- ✅ **CORS Protection** - Configurable allowed origins
- ✅ **Rate Limiting** - Request throttling per IP/key
- ✅ **Input Validation** - Request payload validation
- ✅ **API Key Management** - Secure key generation and rotation
- ✅ **Audit Logging** - Immutable activity tracking
- ✅ **Error Handling** - Safe error messages without leaking info
- ✅ **SQL Injection Prevention** - Parameterized queries

## 🤝 Contributing

### Code Standards

- Use consistent naming: camelCase for variables/functions, snake_case for database columns
- Add error handling for all async operations
- Write comments for complex business logic
- Follow the layered architecture pattern

### Adding New Features

1. Create model (data access) in `src/models/`
2. Create service (business logic) in `src/services/`
3. Create controller (request handling) in `src/controllers/`
4. Create routes (endpoint definitions) in `src/routes/`
5. Add middleware if needed in `src/middleware/`
6. Test all endpoints
7. Update this README

### Commit Message Format

```
[FEATURE|FIX|REFACTOR] Description of change

Detailed explanation of what changed and why.
```

## 📜 Recent Changes

See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for detailed changelog of recent updates.

## 📞 Support

For issues, questions, or contributions:
- Create an issue on the repository
- Check existing documentation in `/AUDIT_LOGGING.md`
- Review error logs for debugging

## 📄 License

[Add your license here]

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
