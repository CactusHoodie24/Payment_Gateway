// src/controllers/accountController.js
const accountService = require('../services/accountService');

const accountController = {

  async create(req, res) {
    try {
      const account = await accountService.createAccount(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'Account created successfully.',
        data:    account
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
      const account = await accountService.getAccountById(req.params.id);
      return res.status(200).json({
        status: 'success',
        data:   account
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

    // Organization can only see their own accounts
    if (req.user.role === 'organization') {
      filters.organization_id = req.user.organization_id;
    } else {
      // Admin can filter by org or see all
      if (req.query.organization_id) filters.organization_id = req.query.organization_id;
    }

    if (req.query.account_status) filters.account_status = req.query.account_status;
    if (req.query.account_type)   filters.account_type   = req.query.account_type;
    if (req.query.currency)       filters.currency       = req.query.currency;

    const accounts = await accountService.getAllAccounts(filters);
    return res.status(200).json({
      status: 'success',
      count:  accounts.length,
      data:   accounts
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
      const account = await accountService.updateAccount(req.params.id, req.body);
      return res.status(200).json({
        status:  'success',
        message: 'Account updated successfully.',
        data:    account
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
      const account = await accountService.updateAccountStatus(req.params.id, status);
      return res.status(200).json({
        status:  'success',
        message: 'Account status updated successfully.',
        data:    account
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async updateBalance(req, res) {
    try {
      const { available_balance, ledger_balance, reserved_balance } = req.body;
      const account = await accountService.updateAccountBalance(req.params.id, {
        available_balance,
        ledger_balance,
        reserved_balance
      });
      return res.status(200).json({
        status:  'success',
        message: 'Account balance updated successfully.',
        data:    account
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
      const result = await accountService.deleteAccount(req.params.id);
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

module.exports = accountController;