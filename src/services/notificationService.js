// src/services/notificationService.js
const NotificationModel   = require('../models/Notification');
const OrganizationModel   = require('../models/OrganizationModel');

const VALID_TYPES    = ['SMS', 'EMAIL', 'PUSH', 'IN_APP'];
const VALID_STATUSES = ['PENDING', 'SENT', 'DELIVERED', 'FAILED'];

const notificationService = {

  // ── Called internally to log a notification ───────────────
  async send({ type, recipient, subject, message, sent_by = null, organization_id = null }) {
    try {
      if (!VALID_TYPES.includes(type)) throw { status: 400, message: `type must be one of: ${VALID_TYPES.join(', ')}.` };
      if (!recipient) throw { status: 400, message: 'recipient is required.' };
      if (!message)   throw { status: 400, message: 'message is required.' };

      const notification = await NotificationModel.create({
        type, recipient, subject, message,
        status: 'PENDING', sent_by, organization_id
      });

      // TODO: integrate actual email/SMS provider here
      // e.g. sendgrid, twilio, etc.
      // For now mark as SENT immediately
      return await NotificationModel.updateStatus(notification.id, 'SENT');

    } catch (err) {
      console.error('❌ Notification failed:', err.message);
      if (err.status) throw err;
      throw { status: 500, message: 'Failed to send notification.' };
    }
  },

  async getAllNotifications(filters = {}, options = {}) {
    if (filters.type && !VALID_TYPES.includes(filters.type)) {
      throw { status: 400, message: `type must be one of: ${VALID_TYPES.join(', ')}.` };
    }
    if (filters.status && !VALID_STATUSES.includes(filters.status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    if (filters.organization_id) {
      const org = await OrganizationModel.findById(filters.organization_id);
      if (!org) throw { status: 404, message: 'Organization not found.' };
    }

    const notifications = await NotificationModel.find(filters, options);
    const total         = await NotificationModel.count(filters);
    return { notifications, total };
  },

  async getNotificationById(id) {
    const notification = await NotificationModel.findByIdWithDetails(id);
    if (!notification) throw { status: 404, message: 'Notification not found.' };
    return notification;
  },

  async updateStatus(id, status, provider_response = null) {
    const existing = await NotificationModel.findById(id);
    if (!existing) throw { status: 404, message: 'Notification not found.' };
    if (!VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    return await NotificationModel.updateStatus(id, status, provider_response);
  },

  async deleteNotification(id) {
    const existing = await NotificationModel.findById(id);
    if (!existing) throw { status: 404, message: 'Notification not found.' };
    await NotificationModel.findByIdAndDelete(id);
    return { message: 'Notification deleted successfully.' };
  }

};

module.exports = notificationService;