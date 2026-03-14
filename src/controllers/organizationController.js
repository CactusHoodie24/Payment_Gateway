// src/controllers/organizationController.js
const organizationService = require('../services/organizationService');
const userService         = require('../services/userService');
const camelToSnake        = require('../middleware/camelToSnake');

const organizationController = {

  async create(req, res) {
    try {
      const body = camelToSnake(req.body); // ← normalize once
      console.log(body);

      const { password, ...organizationData } = body;

      const organization = await organizationService.createOrganization(organizationData);

      const user = await userService.createUser({
        email:    body.contact_email,
        password: password
      });

      return res.status(201).json({
        status:  'success',
        message: 'Organization created successfully.',
        data: {
          organization,
          user: { ...user, password }
        }
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
      const organization = await organizationService.getOrganizationById(req.params.id);
      return res.status(200).json({ status: 'success', data: organization });
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
      if (req.query.status)               filters.status               = req.query.status;
      if (req.query.organization_type_id) filters.organization_type_id = req.query.organization_type_id;

      const organizations = await organizationService.getAllOrganizations(filters);
      return res.status(200).json({
        status: 'success',
        count:  organizations.length,
        data:   organizations
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
      const updateData = camelToSnake(req.body); // ← normalize once

      const organization = await organizationService.updateOrganization(req.params.id, updateData);
      return res.status(200).json({
        status:  'success',
        message: 'Organization updated successfully.',
        data:    organization
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
      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DORMANT', 'DELETED', 'PENDING_ACTIVE'];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          status:  'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const organization = await organizationService.updateOrganizationStatus(req.params.id, status);
      return res.status(200).json({
        status:  'success',
        message: 'Organization status updated successfully.',
        data:    organization
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
      const result = await organizationService.deleteOrganization(req.params.id);
      return res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = organizationController;