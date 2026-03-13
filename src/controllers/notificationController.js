// src/controllers/notificationController.js
const notificationService = require('../services/notificationService');

const notificationController = {

  async send(req, res) {
    try {
      const { type, recipient, subject, message, organization_id } = req.body;

      const notification = await notificationService.send({
        type, recipient, subject, message,
        sent_by:         req.user.id,
        organization_id: organization_id || null
      });

      return res.status(201).json({
        status:  'success',
        message: 'Notification sent successfully.',
        data:    notification
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async getAll(req, res) {
    try {
      const filters = {};
      if (req.query.type)            filters.type            = req.query.type;
      if (req.query.status)          filters.status          = req.query.status;
      if (req.query.organization_id) filters.organization_id = req.query.organization_id;
      if (req.query.sent_by)         filters.sent_by         = req.query.sent_by;

      // Organization can only see their own notifications
      if (req.user.role === 'organization') {
        filters.organization_id = req.user.organization_id;
      }

      const options = {
        limit:  parseInt(req.query.limit)  || 50,
        offset: parseInt(req.query.offset) || 0
      };

      const { notifications, total } = await notificationService.getAllNotifications(filters, options);

      return res.status(200).json({
        status: 'success',
        total,
        count:  notifications.length,
        offset: options.offset,
        limit:  options.limit,
        data:   notifications
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async getById(req, res) {
    try {
      const notification = await notificationService.getNotificationById(req.params.id);

      // Organization can only view their own notifications
      if (req.user.role === 'organization' &&
          notification.organization?.id !== req.user.organization_id) {
        return res.status(403).json({ status: 'error', message: 'Access denied.' });
      }

      return res.status(200).json({ status: 'success', data: notification });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status, provider_response } = req.body;
      const notification = await notificationService.updateStatus(req.params.id, status, provider_response);
      return res.status(200).json({
        status:  'success',
        message: 'Notification status updated.',
        data:    notification
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async remove(req, res) {
    try {
      const result = await notificationService.deleteNotification(req.params.id);
      return res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = notificationController;