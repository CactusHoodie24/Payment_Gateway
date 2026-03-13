// src/services/auditService.js
const AuditLogModel = require('../models/AuditLog');

const auditService = {

  /**
   * Log an audit event
   * @param {Object} params
   * @param {number} params.userId - ID of the user performing the action
   * @param {string} params.userName - Name/email of the user
   * @param {string} params.action - One of: CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN, LOGOUT, EXPORT, TOGGLE, EMERGENCY_ACTION
   * @param {string} params.resourceType - e.g. 'organization', 'transaction', 'account'
   * @param {string} [params.resourceId] - ID of the affected resource
   * @param {string} [params.description] - Human-readable description
   * @param {Object} [params.previousValue] - State before the change
   * @param {Object} [params.newValue] - State after the change
   * @param {string} [params.ipAddress] - Client IP
   * @param {string} [params.userAgent] - Client User-Agent
   */
  async log({ userId, userName, action, resourceType, resourceId, description, previousValue, newValue, ipAddress, userAgent }) {
    try {
      return await AuditLogModel.create({
        user_id: userId,
        user_name: userName,
        action,
        resource_type: resourceType,
        resource_id: resourceId ? String(resourceId) : null,
        description,
        previous_value: previousValue || null,
        new_value: newValue || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null
      });
    } catch (err) {
      // Audit logging should never break the main request flow
      console.error('⚠️ Audit log write failed:', err.message);
      return null;
    }
  },

  async getAuditLogs(filters = {}) {
    const result = await AuditLogModel.find(filters);
    return result;
  },

  async getAuditLogById(id) {
    const log = await AuditLogModel.findById(id);
    if (!log) {
      throw { status: 404, message: 'Audit log not found' };
    }
    return log;
  }

};

module.exports = auditService;
