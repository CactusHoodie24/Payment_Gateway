// src/services/accountService.js
const AccountModel = require('../models/Account');

const VALID_ACCOUNT_TYPES   = ['CLEARING', 'COLLECTION', 'DISBURSEMENT', 'SETTLEMENT'];
const VALID_ACCOUNT_STATUSES = ['ACTIVE', 'CLOSED', 'DORMANT', 'INACTIVE', 'SUSPENDED'];

const accountService = {

  async createAccount(data) {
    const { account_number, account_type, organization_id } = data;

    if (!account_number) throw { status: 400, message: 'account_number is required.' };

    if (!account_type || !VALID_ACCOUNT_TYPES.includes(account_type)) {
      throw { status: 400, message: `account_type must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}.` };
    }

    const duplicate = await AccountModel.findOne({ account_number });
    if (duplicate) {
      throw { status: 409, message: `An account with number "${account_number}" already exists.` };
    }

    return await AccountModel.create(data);
  },

  async getAccountById(id) {
    const account = await AccountModel.findByIdWithDetails(id);
    if (!account) throw { status: 404, message: 'Account not found.' };
    return account;
  },

  async getAllAccounts(filters = {}) {
    if (filters.account_status && !VALID_ACCOUNT_STATUSES.includes(filters.account_status)) {
      throw { status: 400, message: `account_status must be one of: ${VALID_ACCOUNT_STATUSES.join(', ')}.` };
    }
    if (filters.account_type && !VALID_ACCOUNT_TYPES.includes(filters.account_type)) {
      throw { status: 400, message: `account_type must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}.` };
    }

    // If organization_id is provided verify it exists
    if (filters.organization_id) {
      const org = await OrganizationModel.findById(filters.organization_id);
      if (!org) throw { status: 404, message: 'Organization not found.' };
    }

    return await AccountModel.find(filters);
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



  async updateAccount(id, data) {
    const existing = await AccountModel.findById(id);
    if (!existing) throw { status: 404, message: 'Account not found.' };

    if (data.account_type && !VALID_ACCOUNT_TYPES.includes(data.account_type)) {
      throw { status: 400, message: `account_type must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}.` };
    }

    return await AccountModel.findByIdAndUpdate(id, data);
  },

  async updateAccountStatus(id, status) {
    const existing = await AccountModel.findById(id);
    if (!existing) throw { status: 404, message: 'Account not found.' };

    if (!VALID_ACCOUNT_STATUSES.includes(status)) {
      throw { status: 400, message: `status must be one of: ${VALID_ACCOUNT_STATUSES.join(', ')}.` };
    }

    // Prevent reopening a closed account
    if (existing.account_status === 'CLOSED') {
      throw { status: 409, message: 'Cannot update status of a closed account.' };
    }

    return await AccountModel.updateStatus(id, status);
  },

  async updateAccountBalance(id, balances) {
    const existing = await AccountModel.findById(id);
    if (!existing) throw { status: 404, message: 'Account not found.' };

    if (existing.account_status !== 'ACTIVE') {
      throw { status: 409, message: 'Cannot update balance of an inactive account.' };
    }

    return await AccountModel.updateBalance(id, balances);
  },

  async deleteAccount(id) {
    const existing = await AccountModel.findById(id);
    if (!existing) throw { status: 404, message: 'Account not found.' };

    if (existing.available_balance > 0) {
      throw { status: 409, message: 'Cannot delete an account with a non-zero balance.' };
    }

    await AccountModel.findByIdAndDelete(id);
    return { message: 'Account deleted successfully.' };
  }

};

module.exports = accountService;