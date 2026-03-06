// src/controllers/organizationTypeController.js
const organizationTypeService = require('../services/organizationTypeService');

const organizationTypeController = {

  async create(req, res) {
    try {
      const type = await organizationTypeService.createOrganizationType(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'Organization type created successfully.',
        data:    type
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
      const type = await organizationTypeService.getOrganizationTypeById(req.params.id);
      return res.status(200).json({
        status: 'success',
        data:   type
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
      const types = await organizationTypeService.getAllOrganizationTypes();
      return res.status(200).json({
        status: 'success',
        count:  types.length,
        data:   types
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
      const type = await organizationTypeService.updateOrganizationType(req.params.id, req.body);
      return res.status(200).json({
        status:  'success',
        message: 'Organization type updated successfully.',
        data:    type
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
      const result = await organizationTypeService.deleteOrganizationType(req.params.id);
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

module.exports = organizationTypeController;