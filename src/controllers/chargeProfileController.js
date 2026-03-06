// src/controllers/chargeProfileController.js
const chargeProfileService = require('../services/chargeProfileService');

const chargeProfileController = {

  async create(req, res) {
    try {
      const profile = await chargeProfileService.createChargeProfile(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'Charge profile created successfully.',
        data:    profile
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
      const profile = await chargeProfileService.getChargeProfileById(req.params.id);
      return res.status(200).json({
        status: 'success',
        data:   profile
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
      // Filter by query params e.g. ?charge_type=FIXED&transaction_type_id=1
      const filters = {};
      if (req.query.charge_type)         filters.charge_type         = req.query.charge_type;
      if (req.query.transaction_type_id) filters.transaction_type_id = req.query.transaction_type_id;
      if (req.query.organization_type_id) filters.organization_type_id = req.query.organization_type_id;
      if (req.query.charge_item_id)      filters.charge_item_id      = req.query.charge_item_id;

      const profiles = await chargeProfileService.getAllChargeProfiles(filters);
      return res.status(200).json({
        status: 'success',
        count:  profiles.length,
        data:   profiles
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
      const profile = await chargeProfileService.updateChargeProfile(req.params.id, req.body);
      return res.status(200).json({
        status:  'success',
        message: 'Charge profile updated successfully.',
        data:    profile
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
      const result = await chargeProfileService.deleteChargeProfile(req.params.id);
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

module.exports = chargeProfileController;