// src/controllers/chargeItemController.js
const chargeItemService = require('../services/chargeItemService');

const chargeItemController = {

  async create(req, res) {
    try {
      const item = await chargeItemService.createChargeItem(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'Charge item created successfully.',
        data:    item
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
      const item = await chargeItemService.getChargeItemById(req.params.id);
      return res.status(200).json({
        status: 'success',
        data:   item
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
      const items = await chargeItemService.getAllChargeItems();
      return res.status(200).json({
        status: 'success',
        count:  items.length,
        data:   items
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
      const item = await chargeItemService.updateChargeItem(req.params.id, req.body);
      return res.status(200).json({
        status:  'success',
        message: 'Charge item updated successfully.',
        data:    item
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
      const result = await chargeItemService.deleteChargeItem(req.params.id);
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

module.exports = chargeItemController;