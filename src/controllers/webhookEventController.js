// src/controllers/webhookEventController.js
const webhookEventService = require('../services/webhookEventService');

const webhookEventController = {

  // GET /api/webhook-events — flat list (with optional ?category=TRANSACTION&status=ACTIVE)
  async getAll(req, res) {
    try {
      const filters = {};
      if (req.query.category) filters.category = req.query.category;
      if (req.query.status)   filters.status   = req.query.status;

      const events = await webhookEventService.getAllEvents(filters);
      return res.status(200).json({
        status: 'success',
        count:  events.length,
        data:   events
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  // GET /api/webhook-events/grouped — grouped by category (for UI dropdowns/checkboxes)
  async getGrouped(req, res) {
    try {
      const data = await webhookEventService.getGroupedEvents();
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  // GET /api/webhook-events/:id
  async getById(req, res) {
    try {
      const event = await webhookEventService.getEventById(req.params.id);
      return res.status(200).json({ status: 'success', data: event });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  // POST /api/webhook-events — admin only
  async create(req, res) {
    try {
      const event = await webhookEventService.createEvent(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'Webhook event created successfully.',
        data:    event
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  // PATCH /api/webhook-events/:id/status — admin only
  async updateStatus(req, res) {
    try {
      const event = await webhookEventService.updateEventStatus(req.params.id, req.body.status);
      return res.status(200).json({
        status:  'success',
        message: 'Webhook event status updated.',
        data:    event
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  // DELETE /api/webhook-events/:id — admin only
  async remove(req, res) {
    try {
      const result = await webhookEventService.deleteEvent(req.params.id);
      return res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = webhookEventController;