// src/controllers/auditLogController.js
const auditService = require('../services/auditService');

const auditLogController = {

  async getAll(req, res) {
    try {
      const filters = {};
      if (req.query.action)        filters.action = req.query.action;
      if (req.query.user_id)       filters.user_id = req.query.user_id;
      if (req.query.operatorId)    filters.user_id = req.query.operatorId;
      if (req.query.resource_type) filters.resource_type = req.query.resource_type;
      if (req.query.entityType)    filters.resource_type = req.query.entityType;
      if (req.query.startDate || req.query.dateFrom) filters.startDate = req.query.startDate || req.query.dateFrom;
      if (req.query.endDate || req.query.dateTo)     filters.endDate = req.query.endDate || req.query.dateTo;
      if (req.query.search)        filters.search = req.query.search;
      if (req.query.page)          filters.page = parseInt(req.query.page, 10);
      if (req.query.size)          filters.size = parseInt(req.query.size, 10);
      if (req.query.limit)         filters.size = parseInt(req.query.limit, 10);

      const result = await auditService.getAuditLogs(filters);
      return res.status(200).json({
        status: 'success',
        count: result.count,
        data: result.data
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  },

  async getById(req, res) {
    try {
      const log = await auditService.getAuditLogById(req.params.id);
      return res.status(200).json({
        status: 'success',
        data: log
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  }

};

module.exports = auditLogController;
