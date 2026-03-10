// src/controllers/accountEntryController.js
const accountEntryService = require('../services/accountEntryService');

const accountEntryController = {

  async create(req, res) {
    try {
      const entry = await accountEntryService.createEntry(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'Account entry created successfully.',
        data:    entry
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
      const entry = await accountEntryService.getEntryById(req.params.id);
      return res.status(200).json({ status: 'success', data: entry });
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
      if (req.query.account_id)     filters.account_id     = req.query.account_id;
      if (req.query.entry_type)     filters.entry_type     = req.query.entry_type;
      if (req.query.transaction_id) filters.transaction_id = req.query.transaction_id;

      const entries = await accountEntryService.getAllEntries(filters);
      return res.status(200).json({
        status: 'success',
        count:  entries.length,
        data:   entries
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
      const result = await accountEntryService.deleteEntry(req.params.id);
      return res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = accountEntryController;