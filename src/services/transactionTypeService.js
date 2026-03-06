// src/services/transactionTypeService.js
const TransactionTypeModel = require('../models/TransactionType');

const transactionTypeService = {

  async createTransactionType(data) {
    const { type_name, description, status } = data;

    if (!type_name || type_name.trim() === '') {
      throw { status: 400, message: 'type_name is required.' };
    }

    const existing = await TransactionTypeModel.findOne({ type_name });
    if (existing) {
      throw { status: 409, message: `A transaction type with the name "${type_name}" already exists.` };
    }

    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      throw { status: 400, message: 'status must be either ACTIVE or INACTIVE.' };
    }

    return await TransactionTypeModel.create({ type_name, description, status });
  },

  async getTransactionTypeById(id) {
    const type = await TransactionTypeModel.findByIdWithProfiles(id);
    if (!type) {
      throw { status: 404, message: 'Transaction type not found.' };
    }
    return type;
  },

  async getAllTransactionTypes(filters = {}) {
    if (filters.status && !['ACTIVE', 'INACTIVE'].includes(filters.status)) {
      throw { status: 400, message: 'status must be either ACTIVE or INACTIVE.' };
    }
    return await TransactionTypeModel.find(filters);
  },

  async updateTransactionType(id, data) {
    const existing = await TransactionTypeModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Transaction type not found.' };
    }

    if (data.type_name) {
      const duplicate = await TransactionTypeModel.findOne({ type_name: data.type_name });
      if (duplicate && duplicate.id !== parseInt(id)) {
        throw { status: 409, message: `A transaction type with the name "${data.type_name}" already exists.` };
      }
    }

    if (data.status && !['ACTIVE', 'INACTIVE'].includes(data.status)) {
      throw { status: 400, message: 'status must be either ACTIVE or INACTIVE.' };
    }

    return await TransactionTypeModel.findByIdAndUpdate(id, data);
  },

  async updateTransactionTypeStatus(id, status) {
    const existing = await TransactionTypeModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Transaction type not found.' };
    }

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      throw { status: 400, message: 'status must be either ACTIVE or INACTIVE.' };
    }

    return await TransactionTypeModel.updateStatus(id, status);
  },

  async deleteTransactionType(id) {
    const existing = await TransactionTypeModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Transaction type not found.' };
    }
    await TransactionTypeModel.findByIdAndDelete(id);
    return { message: 'Transaction type deleted successfully.' };
  }

};

module.exports = transactionTypeService;