// src/services/serviceRequestService.js
const ServiceRequestModel    = require('../models/ServiceRequest');
const ServiceTypeModel       = require('../models/ServiceType');
const FloatDisbursementModel = require('../models/FloatDisbursement');
const AccountModel           = require('../models/Account');
const AccountEntryModel      = require('../models/AccountEntry');
const { getConnection }      = require('../db');
const { v4: uuidv4 }         = require('uuid');

const VALID_STATES = ['PENDING', 'APPROVED', 'DENIED'];

const serviceRequestService = {

  // ── Service Types ─────────────────────────────────────────
  async getAllServiceTypes(filters = {}) {
    return await ServiceTypeModel.find(filters);
  },

  async createServiceType(data) {
    const { name, description } = data;
    if (!name) throw { status: 400, message: 'name is required.' };
    const existing = await ServiceTypeModel.findOne({ name });
    if (existing) throw { status: 409, message: `Service type "${name}" already exists.` };
    return await ServiceTypeModel.create({ name, description });
  },

  // ── Service Requests ──────────────────────────────────────
  async createRequest(data) {
    const { service_type_id, initiator_id, account_id, amount, description } = data;

    if (!service_type_id)       throw { status: 400, message: 'service_type_id is required.' };
    if (!initiator_id)          throw { status: 400, message: 'initiator_id is required.' };
    if (!account_id)            throw { status: 400, message: 'account_id is required.' };
    if (!amount || amount <= 0) throw { status: 400, message: 'amount must be a positive number.' };

    const type = await ServiceTypeModel.findById(service_type_id);
    if (!type)                    throw { status: 404, message: 'Service type not found.' };
    if (type.status !== 'ACTIVE') throw { status: 409, message: 'Service type is inactive.' };

    const account = await AccountModel.findById(account_id);
    if (!account) throw { status: 404, message: 'Account not found.' };

    return await ServiceRequestModel.create({ service_type_id, initiator_id, account_id, amount, description });
  },

  async getRequestById(id) {
    const request = await ServiceRequestModel.findByIdWithDetails(id);
    if (!request) throw { status: 404, message: 'Service request not found.' };
    return request;
  },

  async getAllRequests(filters = {}) {
    if (filters.state && !VALID_STATES.includes(filters.state)) {
      throw { status: 400, message: `state must be one of: ${VALID_STATES.join(', ')}.` };
    }
    return await ServiceRequestModel.find(filters);
  },

  // ── Approve — updates balance + creates account entry ─────
  async approveRequest(id, approver_id) {
    const existing = await ServiceRequestModel.findByIdWithDetails(id);
    if (!existing)                    throw { status: 404, message: 'Service request not found.' };
    if (existing.state !== 'PENDING') throw { status: 409, message: `Request is already ${existing.state}.` };
    if (!existing.account)            throw { status: 400, message: 'No account linked to this service request.' };

    // Approve the request
    const approved = await ServiceRequestModel.approve(id, approver_id);

    // Get balance before update
    const account        = await AccountModel.findById(existing.account.id);
    const balance_before = account.available_balance;
    const balance_after  = balance_before + existing.amount;

    // Update account balance
   await AccountModel.updateBalance(existing.account.id, {
  available_balance: balance_after,
  ledger_balance:    account.ledger_balance + existing.amount,
  reserved_balance:  account.reserved_balance
});

    // Create float disbursement
    const disbursement = await FloatDisbursementModel.create({
      service_request_id: id,
      account_id_from:    null,
      account_id_to:      existing.account.id,
      amount:             existing.amount,
      description:        existing.description
    });
    await FloatDisbursementModel.complete(disbursement.id);

    // Generate entry_reference
    const db      = getConnection();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [seqRows] = await db.query(
      `SELECT COUNT(*) AS count FROM account_entries WHERE entry_reference LIKE ?`,
      [`ENT-${dateStr}-%`]
    );
    const seq             = String(parseInt(seqRows[0].count) + 1).padStart(4, '0');
    const entry_reference = `ENT-${dateStr}-${seq}`;

    // Create account entry — CREDIT
    await AccountEntryModel.create({
      entry_reference,
      account_id:     existing.account.id,
      transaction_id: null,
      entry_type:     'CREDIT',
      amount:         existing.amount,
      balance_before,
      balance_after,
      description:    existing.description || `Float top up — Service Request #${id}`
    });

    console.log(`✅ Account entry: ${entry_reference} — CREDIT ${existing.amount}`);
    console.log(`💰 Balance: ${balance_before} → ${balance_after}`);

    return approved;
  },

  async denyRequest(id, approver_id, denial_reason) {
    const existing = await ServiceRequestModel.findById(id);
    if (!existing)                    throw { status: 404, message: 'Service request not found.' };
    if (existing.state !== 'PENDING') throw { status: 409, message: `Request is already ${existing.state}.` };
    if (!denial_reason)               throw { status: 400, message: 'denial_reason is required when denying a request.' };
    return await ServiceRequestModel.deny(id, approver_id, denial_reason);
  },

  // ── Float Disbursements ───────────────────────────────────
  async getDisbursementById(id) {
    const disbursement = await FloatDisbursementModel.findByIdWithDetails(id);
    if (!disbursement) throw { status: 404, message: 'Float disbursement not found.' };
    return disbursement;
  },

  async getAllDisbursements(filters = {}) {
    return await FloatDisbursementModel.find(filters);
  }
};

module.exports = serviceRequestService;