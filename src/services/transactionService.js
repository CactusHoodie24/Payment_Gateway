// src/services/transactionService.js
const TransactionModel = require('../models/Transaction');
const webhookService   = require('./webhookService');
const { v4: uuidv4 }   = require('uuid');

const VALID_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED'];
const VALID_CHANNELS = ['AIRTEL', 'TNM'];

const transactionService = {

  async createTransaction(data) {
    const { merchant_reference, payment_channel, transaction_amount, transaction_fee, transaction_type_id, organization_id } = data;

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

    const transaction = await TransactionModel.create({ ...data, transaction_id });

    // 🔔 Dispatch webhook
    if (organization_id) {
      await webhookService.dispatch(organization_id, 'transaction.created', {
        transaction_id:     transaction.transaction_id,
        merchant_reference: transaction.merchant_reference,
        payment_channel:    transaction.payment_channel,
        phone_number:       transaction.phone_number,
        transaction_amount: transaction.transaction_amount,
        transaction_fee:    transaction.transaction_fee,
        status:             transaction.status,
        transaction_type:   transaction.transaction_type
      });
    }

    return transaction;
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

  async updateTransactionStatus(id, status, organization_id = null) {
    const existing = await TransactionModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Transaction not found.' };
    }
    if (!VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    // Prevent updating an already finalized transaction
    if (['COMPLETED', 'REVERSED', 'CANCELLED'].includes(existing.status)) {
      throw { status: 409, message: `Cannot update a transaction with status "${existing.status}".` };
    }

    const updated = await TransactionModel.updateStatus(id, status);

    // 🔔 Dispatch webhook based on new status
    if (organization_id) {
      const eventMap = {
        COMPLETED: 'transaction.completed',
        FAILED:    'transaction.failed',
      };
      const event = eventMap[status];
      if (event) {
        await webhookService.dispatch(organization_id, event, {
          transaction_id:     updated.transaction_id,
          merchant_reference: updated.merchant_reference,
          payment_channel:    updated.payment_channel,
          transaction_amount: updated.transaction_amount,
          status:             updated.status,
          transaction_type:   updated.transaction_type
        });
      }
    }

    return updated;
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