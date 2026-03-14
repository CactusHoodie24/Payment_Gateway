// src/controllers/serviceRequestController.js
const serviceRequestService = require('../services/serviceRequestService');
const camelToSnake          = require('../middleware/camelToSnake');

const serviceRequestController = {

  // ── Service Types ─────────────────────────────────────────
  async getAllServiceTypes(req, res) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      const types = await serviceRequestService.getAllServiceTypes(filters);
      return res.status(200).json({ status: 'success', count: types.length, data: types });
    } catch (error) {
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal server error.' });
    }
  },

  async createServiceType(req, res) {
    try {
      const type = await serviceRequestService.createServiceType(camelToSnake(req.body));
      return res.status(201).json({ status: 'success', message: 'Service type created.', data: type });
    } catch (error) {
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal server error.' });
    }
  },

  // ── Service Requests ──────────────────────────────────────

  // Finance Officer clicks "Add Funds" → POST /api/service-requests
  async createRequest(req, res) {
    try {
      const body = camelToSnake(req.body);

      const request = await serviceRequestService.createRequest({
        service_type_id: body.service_type_id,
        initiator_id:    req.user.id,   // ← always from token
        account_id:      body.account_id,
        amount:          body.amount,
        description:     body.description
      });

      return res.status(201).json({
        status:  'success',
        message: 'Service request submitted. Awaiting approval.',
        data:    request
      });
    } catch (error) {
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal server error.' });
    }
  },

  async getRequestById(req, res) {
    try {
      const request = await serviceRequestService.getRequestById(req.params.id);
      return res.status(200).json({ status: 'success', data: request });
    } catch (error) {
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal server error.' });
    }
  },

  async getAllRequests(req, res) {
    try {
      const filters = {};
      if (req.query.state)           filters.state           = req.query.state;
      if (req.query.service_type_id) filters.service_type_id = req.query.service_type_id;
      if (req.query.initiator_id)    filters.initiator_id    = req.query.initiator_id;

      const requests = await serviceRequestService.getAllRequests(filters);
      return res.status(200).json({ status: 'success', count: requests.length, data: requests });
    } catch (error) {
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal server error.' });
    }
  },

  // Finance Manager approves → auto-disburses float
  async approveRequest(req, res) {
    try {
      const request = await serviceRequestService.approveRequest(req.params.id, req.user.id);
      return res.status(200).json({
        status:  'success',
        message: 'Request approved and funds disbursed.',
        data:    request
      });
    } catch (error) {
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal server error.' });
    }
  },

  // Finance Manager denies
  async denyRequest(req, res) {
    try {
      const { denial_reason } = camelToSnake(req.body);
      const request = await serviceRequestService.denyRequest(req.params.id, req.user.id, denial_reason);
      return res.status(200).json({
        status:  'success',
        message: 'Request denied.',
        data:    request
      });
    } catch (error) {
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal server error.' });
    }
  },

  // ── Float Disbursements ───────────────────────────────────
  async getDisbursementById(req, res) {
    try {
      const disbursement = await serviceRequestService.getDisbursementById(req.params.id);
      return res.status(200).json({ status: 'success', data: disbursement });
    } catch (error) {
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal server error.' });
    }
  },

  async getAllDisbursements(req, res) {
    try {
      const filters = {};
      if (req.query.service_request_id) filters.service_request_id = req.query.service_request_id;
      if (req.query.account_id_to)      filters.account_id_to      = req.query.account_id_to;

      const disbursements = await serviceRequestService.getAllDisbursements(filters);
      return res.status(200).json({ status: 'success', count: disbursements.length, data: disbursements });
    } catch (error) {
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal server error.' });
    }
  }
};

module.exports = serviceRequestController;