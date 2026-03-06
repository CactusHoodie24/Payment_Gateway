// src/services/organizationApiKeyService.js
const OrganizationApiKeyModel = require('../models/OrganizationApiKey');
const OrganizationModel       = require('../models/OrganizationModel');
const crypto                  = require('crypto');

const VALID_STATUSES = ['ACTIVE', 'EXPPIRED', 'SUSPENDED'];

const organizationApiKeyService = {

  async generateApiKey(organization_id) {
    // Verify organization exists
    const org = await OrganizationModel.findById(organization_id);
    if (!org) {
      throw { status: 404, message: 'Organization not found.' };
    }

    // Check org is active before issuing a key
    if (org.status !== 'ACTIVE') {
      throw { status: 409, message: 'Cannot generate an API key for an inactive organization.' };
    }

    // Revoke any existing active keys for this org first
    const existing = await OrganizationApiKeyModel.find({ organization_id, status: 'ACTIVE' });
    for (const key of existing) {
      await OrganizationApiKeyModel.updateStatus(key.id, 'EXPPIRED');
    }

    // Generate a secure random API key
    const rawApiKey   = `mk_live_${crypto.randomBytes(32).toString('hex')}`;
    const api_key_hash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

    const created = await OrganizationApiKeyModel.create({ api_key_hash, organization_id });

    // Return the raw key ONCE — it is never stored in plain text
    return {
      ...created,
      api_key: rawApiKey,
      note: 'Store this key securely. It will not be shown again.'
    };
  },

  async getApiKeyById(id) {
    const key = await OrganizationApiKeyModel.findByIdWithDetails(id);
    if (!key) throw { status: 404, message: 'API key not found.' };
    return key;
  },

  async getAllApiKeys(filters = {}) {
    if (filters.status && !VALID_STATUSES.includes(filters.status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    return await OrganizationApiKeyModel.find(filters);
  },

  async getApiKeysByOrganization(organization_id) {
    const org = await OrganizationModel.findById(organization_id);
    if (!org) throw { status: 404, message: 'Organization not found.' };
    return await OrganizationApiKeyModel.find({ organization_id });
  },

  async updateApiKeyStatus(id, status) {
    const existing = await OrganizationApiKeyModel.findById(id);
    if (!existing) throw { status: 404, message: 'API key not found.' };

    if (!VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }

    return await OrganizationApiKeyModel.updateStatus(id, status);
  },

  async revokeApiKey(id) {
    const existing = await OrganizationApiKeyModel.findById(id);
    if (!existing) throw { status: 404, message: 'API key not found.' };

    if (existing.status === 'EXPPIRED') {
      throw { status: 409, message: 'API key is already revoked.' };
    }

    return await OrganizationApiKeyModel.updateStatus(id, 'EXPPIRED');
  },

  async deleteApiKey(id) {
    const existing = await OrganizationApiKeyModel.findById(id);
    if (!existing) throw { status: 404, message: 'API key not found.' };
    await OrganizationApiKeyModel.findByIdAndDelete(id);
    return { message: 'API key deleted successfully.' };
  }

};

module.exports = organizationApiKeyService;