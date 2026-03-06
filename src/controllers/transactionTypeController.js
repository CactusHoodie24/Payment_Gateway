// src/controllers/transactionTypeController.js
const transactionTypeService = require('../services/transactionTypeService');

const transactionTypeController = {

  async create(req, res) {
    try {
      const type = await transactionTypeService.createTransactionType(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'Transaction type created successfully.',
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
      const type = await transactionTypeService.getTransactionTypeById(req.params.id);
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
      const filters = {};
      if (req.query.status) filters.status = req.query.status;

      const types = await transactionTypeService.getAllTransactionTypes(filters);
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
      const type = await transactionTypeService.updateTransactionType(req.params.id, req.body);
      return res.status(200).json({
        status:  'success',
        message: 'Transaction type updated successfully.',
        data:    type
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
      const type = await transactionTypeService.updateTransactionTypeStatus(req.params.id, status);
      return res.status(200).json({
        status:  'success',
        message: 'Transaction type status updated successfully.',
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
      const result = await transactionTypeService.deleteTransactionType(req.params.id);
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

module.exports = transactionTypeController;