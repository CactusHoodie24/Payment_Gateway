// src/controllers/organizationApiKeyController.js
const organizationApiKeyService = require('../services/organizationApiKeyService');

const organizationApiKeyController = {

  // POST /api/api-keys/generate  { organization_id }
  async generate(req, res) {
    try {
      const { organization_id } = req.body;
      if (!organization_id) {
        return res.status(400).json({
          status:  'error',
          message: 'organization_id is required.'
        });
      }

      const result = await organizationApiKeyService.generateApiKey(organization_id);
      return res.status(201).json({
        status:  'success',
        message: 'API key generated successfully.',
        data:    result
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
      const key = await organizationApiKeyService.getApiKeyById(req.params.id);
      return res.status(200).json({
        status: 'success',
        data:   key
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
      if (req.query.status)          filters.status          = req.query.status;
      if (req.query.organization_id) filters.organization_id = req.query.organization_id;

      const keys = await organizationApiKeyService.getAllApiKeys(filters);
      return res.status(200).json({
        status: 'success',
        count:  keys.length,
        data:   keys
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async getByOrganization(req, res) {
    try {
      const keys = await organizationApiKeyService.getApiKeysByOrganization(req.params.organization_id);
      return res.status(200).json({
        status: 'success',
        count:  keys.length,
        data:   keys
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
      const key = await organizationApiKeyService.updateApiKeyStatus(req.params.id, status);
      return res.status(200).json({
        status:  'success',
        message: 'API key status updated successfully.',
        data:    key
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async revoke(req, res) {
    try {
      const key = await organizationApiKeyService.revokeApiKey(req.params.id);
      return res.status(200).json({
        status:  'success',
        message: 'API key revoked successfully.',
        data:    key
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
      const result = await organizationApiKeyService.deleteApiKey(req.params.id);
      return res.status(200).json({
        status:  'success',
        message: result.message
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = organizationApiKeyController;