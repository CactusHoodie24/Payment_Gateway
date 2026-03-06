// src/controllers/transactionController.js
const transactionService = require('../services/transactionService');

const transactionController = {

  async create(req, res) {
    try {
      const transaction = await transactionService.createTransaction(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'Transaction created successfully.',
        data:    transaction
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
      const transaction = await transactionService.getTransactionById(req.params.id);
      return res.status(200).json({
        status: 'success',
        data:   transaction
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
      if (req.query.status)           filters.status           = req.query.status;
      if (req.query.payment_channel)  filters.payment_channel  = req.query.payment_channel;
      if (req.query.transaction_type_id) filters.transaction_type_id = req.query.transaction_type_id;
      if (req.query.phone_number)     filters.phone_number     = req.query.phone_number;

      const transactions = await transactionService.getAllTransactions(filters);
      return res.status(200).json({
        status: 'success',
        count:  transactions.length,
        data:   transactions
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
      const transaction = await transactionService.updateTransactionStatus(req.params.id, status);
      return res.status(200).json({
        status:  'success',
        message: 'Transaction status updated successfully.',
        data:    transaction
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
      const transaction = await transactionService.updateTransaction(req.params.id, req.body);
      return res.status(200).json({
        status:  'success',
        message: 'Transaction updated successfully.',
        data:    transaction
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = transactionController;