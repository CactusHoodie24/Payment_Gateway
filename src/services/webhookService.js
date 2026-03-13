// src/services/webhookService.js
const WebhookModel      = require('../models/Webhook');
const OrganizationModel = require('../models/OrganizationModel');
const crypto            = require('crypto');
const { getConnection } = require('../db');

const VALID_STATUSES = ['ACTIVE', 'INACTIVE'];
const VALID_EVENTS   = [
  'transaction.created',
  'transaction.completed',
  'transaction.failed',
  'payment.initiated',
  'account.credited',
  'account.debited'
];

const webhookService = {

  async createWebhook(data) {
  const { organization_id, url, callback_url, secret, events, description } = data;

  if (!organization_id) throw { status: 400, message: 'organization_id is required.' };
  if (!url)             throw { status: 400, message: 'url is required.' };
  if (!callback_url)    throw { status: 400, message: 'callback_url is required.' };
  if (!secret)          throw { status: 400, message: 'secret is required.' };
  if (!events || !events.length) throw { status: 400, message: 'At least one event is required.' };

  // Validate URLs
  try { new URL(url); }          catch { throw { status: 400, message: 'url must be a valid URL.' }; }
  try { new URL(callback_url); } catch { throw { status: 400, message: 'callback_url must be a valid URL.' }; }

  // Validate events
  const invalidEvents = events.filter(e => !VALID_EVENTS.includes(e));
  if (invalidEvents.length) {
    throw { status: 400, message: `Invalid events: ${invalidEvents.join(', ')}. Valid events are: ${VALID_EVENTS.join(', ')}.` };
  }

  // Verify organization exists
  const org = await OrganizationModel.findById(organization_id);
  if (!org) throw { status: 404, message: 'Organization not found.' };

  // Check for duplicate URL per organization
  const existing = await WebhookModel.findOne({ organization_id, url });
  if (existing) throw { status: 409, message: 'A webhook with this URL already exists for this organization.' };

  // ← use client-provided secret directly
  const webhook = await WebhookModel.create({ organization_id, url, callback_url, secret, events, description });

  return webhook;
},

  async getWebhookById(id) {
    const webhook = await WebhookModel.findByIdWithDetails(id);
    if (!webhook) throw { status: 404, message: 'Webhook not found.' };
    return webhook;
  },

  async getAllWebhooks(filters = {}) {
    if (filters.status && !VALID_STATUSES.includes(filters.status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    return await WebhookModel.find(filters);
  },

  async updateWebhook(id, data) {
    const existing = await WebhookModel.findById(id);
    if (!existing) throw { status: 404, message: 'Webhook not found.' };

    if (data.events) {
      const invalidEvents = data.events.filter(e => !VALID_EVENTS.includes(e));
      if (invalidEvents.length) {
        throw { status: 400, message: `Invalid events: ${invalidEvents.join(', ')}.` };
      }
    }

    return await WebhookModel.findByIdAndUpdate(id, data);
  },

  async updateWebhookStatus(id, status) {
    const existing = await WebhookModel.findById(id);
    if (!existing) throw { status: 404, message: 'Webhook not found.' };

    if (!VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }

    return await WebhookModel.updateStatus(id, status);
  },

  async deleteWebhook(id) {
    const existing = await WebhookModel.findById(id);
    if (!existing) throw { status: 404, message: 'Webhook not found.' };
    await WebhookModel.findByIdAndDelete(id);
    return { message: 'Webhook deleted successfully.' };
  },

  // Used internally to dispatch webhook events
  // In webhookService.js — update dispatch method
async dispatch(organization_id, event, payload) {
  const db = getConnection();

  // ← fetch secret directly, not via find() which strips it
  const [rows] = await db.query(
    `SELECT * FROM webhooks WHERE organization_id = ? AND status = 'ACTIVE'`,
    [organization_id]
  );

  const activeWebhooks = rows.filter(w => {
    const events = JSON.parse(w.events);
    return events.includes(event);
  });

  for (const webhook of activeWebhooks) {
    try {
      const body      = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
      const signature = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');

      await fetch(webhook.url, {
        method:  'POST',
        headers: {
          'Content-Type':        'application/json',
          'X-Webhook-Event':     event,
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Callback-Url':      webhook.callback_url
        },
        body
      });

      console.log(`✅ Webhook dispatched: ${event} → ${webhook.url}`);
    } catch (err) {
      console.error(`❌ Webhook failed: ${event} → ${webhook.url}:`, err.message);
    }
  }
},

};

module.exports = webhookService;