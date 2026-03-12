// src/controllers/webhookController.js
const webhookService = require('../services/webhookService');

const webhookController = {

  async create(req, res) {
    try {
      // If organization role — force their own organization_id
      const organization_id = req.user.role === 'organization'
        ? req.user.organization_id
        : req.body.organization_id;

      const webhook = await webhookService.createWebhook({ ...req.body, organization_id });
      return res.status(201).json({
        status:  'success',
        message: 'Webhook created successfully.',
        data:    webhook
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
      const webhook = await webhookService.getWebhookById(req.params.id);

      // Organization can only view their own webhooks
      if (req.user.role === 'organization' &&
          webhook.organization.id !== req.user.organization_id) {
        return res.status(403).json({ status: 'error', message: 'Access denied.' });
      }

      return res.status(200).json({ status: 'success', data: webhook });
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

      // Organization can only see their own webhooks
      if (req.user.role === 'organization') {
        filters.organization_id = req.user.organization_id;
      } else {
        if (req.query.organization_id) filters.organization_id = req.query.organization_id;
      }

      if (req.query.status) filters.status = req.query.status;

      const webhooks = await webhookService.getAllWebhooks(filters);
      return res.status(200).json({
        status: 'success',
        count:  webhooks.length,
        data:   webhooks
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async update(req, res) {
    try {
      const webhook = await webhookService.updateWebhook(req.params.id, req.body);
      return res.status(200).json({
        status:  'success',
        message: 'Webhook updated successfully.',
        data:    webhook
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const webhook = await webhookService.updateWebhookStatus(req.params.id, status);
      return res.status(200).json({
        status:  'success',
        message: 'Webhook status updated successfully.',
        data:    webhook
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
      const result = await webhookService.deleteWebhook(req.params.id);
      return res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = webhookController;