// src/services/serviceRequestService.js
const ServiceRequestModel    = require('../models/ServiceRequest');
const ServiceTypeModel       = require('../models/ServiceType');
const FloatDisbursementModel = require('../models/FloatDisbursement');
const AccountModel           = require('../models/Account');

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
  // Called when Finance Officer clicks "Add Funds" button
  async createRequest(data) {
    const { service_type_id, initiator_id, account_id, amount, description } = data;

    if (!service_type_id) throw { status: 400, message: 'service_type_id is required.' };
    if (!initiator_id)    throw { status: 400, message: 'initiator_id is required.' };
    if (!account_id)      throw { status: 400, message: 'account_id is required.' };
    if (!amount || amount <= 0) throw { status: 400, message: 'amount must be a positive number.' };

    const type = await ServiceTypeModel.findById(service_type_id);
    if (!type)                    throw { status: 404, message: 'Service type not found.' };
    if (type.status !== 'ACTIVE') throw { status: 409, message: 'Service type is inactive.' };

    const account = await AccountModel.findById(account_id);
    if (!account) throw { status: 404, message: 'Account not found.' };

    return await ServiceRequestModel.create({
      service_type_id,
      initiator_id,
      account_id,
      amount,
      description
    });
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

  // Called by Finance Manager — approve and auto-disburse
 async approveRequest(id, approver_id) {
  const existing = await ServiceRequestModel.findByIdWithDetails(id);
  if (!existing)                    throw { status: 404, message: 'Service request not found.' };
  if (existing.state !== 'PENDING') throw { status: 409, message: `Request is already ${existing.state}.` };

  const approved = await ServiceRequestModel.approve(id, approver_id);

  // ← use existing.account.id not existing.account_id
  const disbursement = await FloatDisbursementModel.create({
    service_request_id: id,
    account_id_from:    null,
    account_id_to:      existing.account.id,  // ← nested object
    amount:             existing.amount,
    description:        existing.description
  });

  // Update account balance
  await AccountModel.updateBalance(existing.account.id, existing.amount);

  // Mark disbursement complete
  await FloatDisbursementModel.complete(disbursement.id);

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