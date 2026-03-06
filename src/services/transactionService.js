// src/services/transactionService.js
const TransactionModel = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

const VALID_STATUSES   = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED'];
const VALID_CHANNELS   = ['AIRTEL', 'TNM'];

const transactionService = {

  async createTransaction(data) {
    const { merchant_reference, payment_channel, transaction_amount, transaction_fee, transaction_type_id } = data;

    if (!merchant_reference) throw { status: 400, message: 'merchant_reference is required.' };
    if (!payment_channel || !VALID_CHANNELS.includes(payment_channel)) {
      throw { status: 400, message: `payment_channel must be one of: ${VALID_CHANNELS.join(', ')}.` };
    }
    if (!transaction_amount || isNaN(transaction_amount) || transaction_amount <= 0) {
      throw { status: 400, message: 'transaction_amount must be a positive number.' };
    }
    if (transaction_fee === undefined || isNaN(transaction_fee) || transaction_fee < 0) {
      throw { status: 400, message: 'transaction_fee must be a non-negative number.' };
    }
    if (!transaction_type_id) throw { status: 400, message: 'transaction_type_id is required.' };

    // Check for duplicate merchant_reference
    const duplicate = await TransactionModel.findOne({ merchant_reference });
    if (duplicate) {
      throw { status: 409, message: `A transaction with merchant_reference "${merchant_reference}" already exists.` };
    }

    // Auto-generate a unique transaction_id
    const transaction_id = `TXN-${Date.now()}-${uuidv4().split('-')[0].toUpperCase()}`;

    return await TransactionModel.create({ ...data, transaction_id });
  },

  async getTransactionById(id) {
    const transaction = await TransactionModel.findByIdWithDetails(id);
    if (!transaction) {
      throw { status: 404, message: 'Transaction not found.' };
    }
    return transaction;
  },

  async getAllTransactions(filters = {}) {
    if (filters.status && !VALID_STATUSES.includes(filters.status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    if (filters.payment_channel && !VALID_CHANNELS.includes(filters.payment_channel)) {
      throw { status: 400, message: `payment_channel must be one of: ${VALID_CHANNELS.join(', ')}.` };
    }
    return await TransactionModel.find(filters);
  },

  async updateTransactionStatus(id, status) {
    const existing = await TransactionModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Transaction not found.' };
    }
    if (!VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    // Prevent updating a already finalized transaction
    if (['COMPLETED', 'REVERSED', 'CANCELLED'].includes(existing.status)) {
      throw { status: 409, message: `Cannot update a transaction with status "${existing.status}".` };
    }
    return await TransactionModel.updateStatus(id, status);
  },

  async updateTransaction(id, data) {
    const existing = await TransactionModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Transaction not found.' };
    }
    if (data.status && !VALID_STATUSES.includes(data.status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    return await TransactionModel.findByIdAndUpdate(id, data);
  }

};

module.exports = transactionService;