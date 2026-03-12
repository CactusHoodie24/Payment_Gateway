// src/services/webhookEventService.js
const WebhookEventModel = require('../models/WebhookEvent');

const VALID_STATUSES   = ['ACTIVE', 'INACTIVE'];
const VALID_CATEGORIES = ['TRANSACTION', 'PAYMENT', 'ACCOUNT'];

const webhookEventService = {

  async getAllEvents(filters = {}) {
    if (filters.status && !VALID_STATUSES.includes(filters.status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    if (filters.category && !VALID_CATEGORIES.includes(filters.category)) {
      throw { status: 400, message: `category must be one of: ${VALID_CATEGORIES.join(', ')}.` };
    }
    return await WebhookEventModel.find(filters);
  },

  async getGroupedEvents() {
    return await WebhookEventModel.findGroupedByCategory('ACTIVE');
  },

  async getEventById(id) {
    const event = await WebhookEventModel.findById(id);
    if (!event) throw { status: 404, message: 'Webhook event not found.' };
    return event;
  },

  async createEvent(data) {
    const { event_name, category, description } = data;

    if (!event_name) throw { status: 400, message: 'event_name is required.' };
    if (!category)   throw { status: 400, message: 'category is required.' };

    if (!VALID_CATEGORIES.includes(category)) {
      throw { status: 400, message: `category must be one of: ${VALID_CATEGORIES.join(', ')}.` };
    }

    // Check for duplicate event_name
    const existing = await WebhookEventModel.findOne({ event_name });
    if (existing) throw { status: 409, message: `Event "${event_name}" already exists.` };

    return await WebhookEventModel.create({ event_name, category, description });
  },

  async updateEventStatus(id, status) {
    const existing = await WebhookEventModel.findById(id);
    if (!existing) throw { status: 404, message: 'Webhook event not found.' };

    if (!VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }

    return await WebhookEventModel.updateStatus(id, status);
  },

  async deleteEvent(id) {
    const existing = await WebhookEventModel.findById(id);
    if (!existing) throw { status: 404, message: 'Webhook event not found.' };
    await WebhookEventModel.findByIdAndDelete(id);
    return { message: 'Webhook event deleted successfully.' };
  }

};

module.exports = webhookEventService;