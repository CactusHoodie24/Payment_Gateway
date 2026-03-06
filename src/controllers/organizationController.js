// src/controllers/organizationController.js
const organizationService = require('../services/organizationService');
const axios = require('axios');

const organizationController = {

async create(req, res) {
    try {
        console.log(req.body)
      const targetUrl = 'http://localhost:4000/users';

      const response = await axios.post(targetUrl, req.body, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return res.status(201).json({
        status:  'success',
        message: 'Organization created successfully.',
        data:    response.data
      });
    } catch (error) {
      // axios wraps HTTP errors in error.response
      if (error.response) {
        return res.status(error.response.status).json({
          status:  'error',
          message: error.response.data?.message || 'Upstream service error.'
        });
      }
      return res.status(500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async getById(req, res) {
    try {
      const organization = await organizationService.getOrganizationById(req.params.id);
      return res.status(200).json({
        status: 'success',
        data: organization
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  },

  async getAll(req, res) {
    try {
      // Allow filtering by status or organization_type_id via query params
      // e.g. GET /api/organizations?status=ACTIVE
      const filters = {};
      if (req.query.status)               filters.status = req.query.status;
      if (req.query.organization_type_id) filters.organization_type_id = req.query.organization_type_id;

      const organizations = await organizationService.getAllOrganizations(filters);
      return res.status(200).json({
        status: 'success',
        count: organizations.length,
        data: organizations
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  },

  async update(req, res) {
    try {
      const organization = await organizationService.updateOrganization(req.params.id, req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Organization updated successfully',
        data: organization
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DORMANT', 'DELETED', 'PENDING_ACTIVE'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      const organization = await organizationService.updateOrganizationStatus(req.params.id, status);
      return res.status(200).json({
        status: 'success',
        message: 'Organization status updated successfully',
        data: organization
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  },

  async remove(req, res) {
    try {
      const result = await organizationService.deleteOrganization(req.params.id);
      return res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  }

};

module.exports = organizationController;