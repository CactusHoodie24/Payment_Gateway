/**
 * Enum for audit action types
 * These represent the types of activities that can be logged in the audit trail
 */
const AuditAction = {
  // Data Mutations
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  RESTORE: 'RESTORE',
  BULK_CREATE: 'BULK_CREATE',
  BULK_UPDATE: 'BULK_UPDATE',
  BULK_DELETE: 'BULK_DELETE',

  // Status Changes
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  SUSPEND: 'SUSPEND',
  REACTIVATE: 'REACTIVATE',

  // Account Operations
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  TRANSFER: 'TRANSFER',
  BALANCE_UPDATE: 'BALANCE_UPDATE',

  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  MFA_ENABLE: 'MFA_ENABLE',
  MFA_DISABLE: 'MFA_DISABLE',
  VERIFY_OTP: 'VERIFY_OTP',

  // Permission & Access
  GRANT_PERMISSION: 'GRANT_PERMISSION',
  REVOKE_PERMISSION: 'REVOKE_PERMISSION',
  ASSIGN_ROLE: 'ASSIGN_ROLE',
  CHANGE_ROLE: 'CHANGE_ROLE',

  // Data Access & Export
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  DOWNLOAD: 'DOWNLOAD',
  VIEW: 'VIEW',

  // Webhook Operations
  WEBHOOK_TRIGGER: 'WEBHOOK_TRIGGER',
  WEBHOOK_RETRY: 'WEBHOOK_RETRY',

  // System Operations
  TOGGLE: 'TOGGLE',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  EMERGENCY_ACTION: 'EMERGENCY_ACTION',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE'
};

/**
 * Enum for resource types that can be audited
 * These represent the entities in the system
 */
const AuditResourceType = {
  // Core Resources
  ACCOUNT: 'account',
  USER: 'user',
  MERCHANT: 'merchant',
  ORGANIZATION: 'organization',
  TRANSACTION: 'transaction',
  
  // Financial Resources
  CHARGE_PROFILE: 'charge_profile',
  CHARGE_ITEM: 'charge_item',
  ACCOUNT_ENTRY: 'account_entry',
  PAYMENT: 'payment',
  
  // Configuration
  API_KEY: 'api_key',
  ORGANIZATION_TYPE: 'organization_type',
  TRANSACTION_TYPE: 'transaction_type',
  
  // Webhooks
  WEBHOOK: 'webhook',
  WEBHOOK_EVENT: 'webhook_event',
  
  // Audit & Validation
  AUDIT_LOG: 'audit_log',
  VALIDATION: 'validation',
  OTP: 'otp',
  
  // Admin
  ADMIN: 'admin',
  ROLE: 'role',
  PERMISSION: 'permission'
};

/**
 * HTTP Method to Action mapping
 * Maps HTTP verbs to audit actions
 */
const HTTPMethodToAction = {
  POST: AuditAction.CREATE,
  PUT: AuditAction.UPDATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE
};

/**
 * URL path to resource type mapping
 * Maps route paths to resource types for audit tracking
 */
const URLPathToResourceType = {
  'accounts': AuditResourceType.ACCOUNT,
  'account-entries': AuditResourceType.ACCOUNT_ENTRY,
  'users': AuditResourceType.USER,
  'merchants': AuditResourceType.MERCHANT,
  'organizations': AuditResourceType.ORGANIZATION,
  'transactions': AuditResourceType.TRANSACTION,
  'charge-profiles': AuditResourceType.CHARGE_PROFILE,
  'charge-items': AuditResourceType.CHARGE_ITEM,
  'payments': AuditResourceType.PAYMENT,
  'api-keys': AuditResourceType.API_KEY,
  'organization-types': AuditResourceType.ORGANIZATION_TYPE,
  'transaction-types': AuditResourceType.TRANSACTION_TYPE,
  'webhooks': AuditResourceType.WEBHOOK,
  'webhook-events': AuditResourceType.WEBHOOK_EVENT,
  'audit-logs': AuditResourceType.AUDIT_LOG,
  'validator': AuditResourceType.VALIDATION,
  'otps': AuditResourceType.OTP
};

module.exports = {
  AuditAction,
  AuditResourceType,
  HTTPMethodToAction,
  URLPathToResourceType
};
