# Audit Logging System Documentation

## Overview

The audit logging system automatically tracks all API calls (mutations) across the Malipo API Gateway. Each request is logged with comprehensive activity data including user information, action type, resource type, IP address, and request/response data.

## Features

✅ **Automatic Activity Tracking** - All POST, PUT, PATCH, DELETE requests are automatically logged
✅ **Enum-Based Activity Classification** - Structured activity types for better reporting
✅ **Resource Type Mapping** - Automatic resource identification from URL paths
✅ **User Attribution** - Associates every action with the user who performed it
✅ **Request/Response Logging** - Captures request body and response data for change tracking
✅ **IP & User-Agent Tracking** - Captures client information for security audits
✅ **Non-Blocking** - Fire-and-forget logging that doesn't impact request performance

## Architecture

### Core Components

1. **Enums** (`src/enums/AuditActivityEnum.js`)
   - `AuditAction` - Types of activities (CREATE, UPDATE, DELETE, LOGIN, etc.)
   - `AuditResourceType` - Resource entities being acted upon
   - `HTTPMethodToAction` - Maps HTTP verbs to audit actions
   - `URLPathToResourceType` - Maps URL paths to resource types

2. **Middleware** (`src/middleware/auditLogger.js`)
   - Intercepts requests and responses
   - Extracts relevant audit information
   - Passes to audit service for persistence

3. **Service** (`src/services/auditService.js`)
   - Logs events to the database
   - Retrieves and queries audit history

4. **Model** (`src/models/AuditLog.js`)
   - Database schema for audit records

## Audit Actions (AuditAction Enum)

### Data Mutations
- `CREATE` - New resource created
- `UPDATE` - Resource updated
- `DELETE` - Resource deleted
- `RESTORE` - Resource restored from backup
- `BULK_CREATE` - Multiple resources created at once
- `BULK_UPDATE` - Multiple resources updated
- `BULK_DELETE` - Multiple resources deleted at once

### Status Changes
- `ACTIVATE` - Resource activated
- `DEACTIVATE` - Resource deactivated
- `APPROVE` - Resource approved
- `REJECT` - Resource rejected
- `SUSPEND` - Resource suspended
- `REACTIVATE` - Resource reactivated

### Account Operations
- `DEPOSIT` - Money deposited
- `WITHDRAW` - Money withdrawn
- `TRANSFER` - Money transferred
- `BALANCE_UPDATE` - Account balance adjusted

### Authentication
- `LOGIN` - User logged in
- `LOGOUT` - User logged out
- `PASSWORD_CHANGE` - Password changed by user
- `PASSWORD_RESET` - Password reset via OTP
- `MFA_ENABLE` - Multi-factor authentication enabled
- `MFA_DISABLE` - Multi-factor authentication disabled
- `VERIFY_OTP` - OTP verified

### Permission & Access
- `GRANT_PERMISSION` - Permission granted to user
- `REVOKE_PERMISSION` - Permission revoked from user
- `ASSIGN_ROLE` - Role assigned to user
- `CHANGE_ROLE` - User's role changed

### Data Access & Export
- `EXPORT` - Data exported
- `IMPORT` - Data imported
- `DOWNLOAD` - File downloaded
- `VIEW` - Resource viewed (read-only, rare cases)

### System Operations
- `WEBHOOK_TRIGGER` - Webhook triggered
- `WEBHOOK_RETRY` - Webhook retry attempted
- `TOGGLE` - Feature toggle activated/deactivated
- `CONFIG_CHANGE` - System configuration changed
- `EMERGENCY_ACTION` - Emergency action taken
- `SYSTEM_MAINTENANCE` - Maintenance performed

## Audit Resource Types (AuditResourceType Enum)

- `account` - User or organizational account
- `user` - User profile
- `merchant` - Merchant entity
- `organization` - Organization entity
- `transaction` - Financial transaction
- `charge_profile` - Charge configuration profile
- `charge_item` - Individual charge item
- `account_entry` - Account ledger entry
- `payment` - Payment record
- `api_key` - API key credential
- `organization_type` - Organization type classification
- `transaction_type` - Transaction type classification
- `webhook` - Webhook configuration
- `webhook_event` - Webhook event definition
- `audit_log` - Audit log record (meta)
- `validation` - Validation request
- `otp` - One-time password
- `admin` - Admin user
- `role` - User role
- `permission` - User permission

## Usage Guide

### For API Developers

Adding audit logging to a new route is simple:

```javascript
const auditLogger = require('../middleware/auditLogger');

// Apply to mutation endpoints
router.post('/', authMiddleware, auditLogger, controller.create);
router.put('/:id', authMiddleware, auditLogger, controller.update);
router.patch('/:id/status', authMiddleware, auditLogger, controller.updateStatus);
router.delete('/:id', authMiddleware, auditLogger, controller.remove);

// Read-only endpoints don't need auditLogger
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
```

**Important:** The auditLogger middleware must be placed **AFTER** authentication middleware so that `req.user` is available.

### For Custom Audit Logging

For actions that don't map to standard HTTP methods, manually call the audit service:

```javascript
const auditService = require('../services/auditService');
const { AuditAction, AuditResourceType } = require('../enums/AuditActivityEnum');

// In your controller
await auditService.log({
  userId: req.user.id,
  userName: req.user.email,
  action: AuditAction.APPROVE,           // Custom action
  resourceType: AuditResourceType.PAYMENT,
  resourceId: payment.id,
  description: `Approved payment #${payment.id} for $${payment.amount}`,
  previousValue: { status: 'PENDING' },
  newValue: { status: 'APPROVED' },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

## Audit Log Schema

Each audit record contains:

```javascript
{
  _id: ObjectId,
  user_id: Number,           // ID of the user who performed the action
  user_name: String,         // Email or name of the user
  action: String,            // One of the AuditAction enum values
  resource_type: String,     // One of the AuditResourceType enum values
  resource_id: String,       // ID of the affected resource (if applicable)
  description: String,       // Human-readable description of the action
  previous_value: Object,    // State before the change (if available)
  new_value: Object,         // State after the change (if available)
  ip_address: String,        // Client IP address
  user_agent: String,        // Client browser/application info
  created_at: Date,          // Timestamp of when the action occurred
  updated_at: Date           // Timestamp of last update to the record
}
```

## Routes with Audit Logging

All the following routes now have automatic audit logging on their mutation endpoints:

- ✅ `/api/accounts` - Account management
- ✅ `/api/account-entries` - Account ledger entries
- ✅ `/api/users` - User management
- ✅ `/api/merchants` - Merchant management
- ✅ `/api/organizations` - Organization management
- ✅ `/api/transactions` - Transaction management
- ✅ `/api/charge-profiles` - Charge profile configuration
- ✅ `/api/charge-items` - Charge item management
- ✅ `/api/payment` - Payment processing
- ✅ `/api/api-keys` - API key management
- ✅ `/api/organization-types` - Organization type management
- ✅ `/api/transaction-types` - Transaction type management
- ✅ `/api/webhooks` - Webhook configuration
- ✅ `/api/webhook-events` - Webhook event management
- ✅ `/api/otps` - OTP generation and verification
- ✅ `/api/auth` - Authentication and password operations

## Accessing Audit Logs

### Via API

```bash
GET /api/audit-logs                    # Get all audit logs
GET /api/audit-logs/:id                # Get specific audit log
GET /api/audit-logs?userId=123         # Filter by user
GET /api/audit-logs?resourceType=user  # Filter by resource type
GET /api/audit-logs?action=DELETE      # Filter by action
```

### Building Queries

Use the audit controller/service to query logs by various criteria:

```javascript
const logs = await auditService.getAuditLogs({
  user_id: 42,
  action: 'DELETE',
  resource_type: 'account',
  created_at: { $gte: new Date('2024-01-01') }
});
```

## Best Practices

1. **Always place auditLogger after auth middleware** - The middleware needs `req.user` to work properly

2. **Use descriptive resource IDs** - Make sure your API returns resource IDs in the response so they can be captured

3. **Avoid logging sensitive data** - The middleware logs request bodies; be mindful of passwords or tokens

4. **Update enums when adding features** - When creating new resource types or actions, add them to the enums

5. **Review audit logs regularly** - Monitor for suspicious activity patterns

6. **Archive old logs** - Implement a retention policy to manage database growth

## Audited Actions by Route

### Authentication Routes (`/api/auth`)
- **POST /register-user** → CREATE action, user resource
- **POST /login-admin** → LOGIN action, admin resource
- **POST /generate-otp** → CREATE action, otp resource
- **POST /verify-otp** → VERIFY_OTP action, otp resource
- **POST /reset-password** → PASSWORD_RESET action, user resource
- **POST /reset-password-confirm** → PASSWORD_CHANGE action, user resource
- **POST /auth/token** → LOGIN action, user resource
- **POST /auth/verifyUser-otp** → VERIFY_OTP action, user resource
- **POST /auth/refresh** → UPDATE action, user resource

### User Management (`/api/users`)
- **POST /** → CREATE action, user resource
- **PUT /:id** → UPDATE action, user resource
- **POST /activate** → ACTIVATE action, user resource
- **DELETE /:id** → DELETE action, user resource

### Merchant Management (`/api/merchants`)
- **POST /login** → LOGIN action, merchant resource
- **POST /** → CREATE action, merchant resource
- **POST /update** → UPDATE action, merchant resource
- **DELETE /:id** → DELETE action, merchant resource

### OTP Management (`/api/otps`)
- **POST /generate** → CREATE action, otp resource
- **POST /verify** → VERIFY_OTP action, otp resource
- **PATCH /:id/status** → UPDATE action, otp resource
- **DELETE /:id** → DELETE action, otp resource
- **DELETE /cleanup** → DELETE action, otp resource

*...and all other routes follow similar patterns*

## Troubleshooting

### Logs not appearing?

1. Check that auditLogger is applied to the correct routes
2. Verify the middleware is placed AFTER auth middleware
3. Ensure the user is authenticated (`req.user.id` exists)
4. Check that the HTTP request resulted in a 2xx status code (only successful operations are logged)

### Resource IDs not captured?

1. Verify that your controller's response includes the resource ID
2. Check that the response structure matches one of these:
   - `{ data: { id: 123 } }`
   - `{ data: { organization: { id: 456 } } }`
3. If using a different structure, update `getResourceId()` in auditLogger.js

### Cannot find audit logs?

Use the audit log API endpoints or directly query the AuditLog model:

```javascript
const AuditLog = require('../models/AuditLog');
const logs = await AuditLog.find({ resource_id: 'your-resource-id' });
```

## Future Enhancements

Potential improvements to consider:

- [ ] Real-time audit log streaming via WebSocket
- [ ] Advanced filtering and search UI
- [ ] Automated alerts for suspicious activities
- [ ] Audit log retention policies
- [ ] Encrypted storage of sensitive audit data
- [ ] Integration with external security systems (SIEM)
- [ ] Audit log export to external services
- [ ] Compliance reporting (GDPR, PCI-DSS, etc.)
