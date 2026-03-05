const WithdrawalService = require('../services/withdrawalService');

const WithdrawalController = {
  async requestWithdrawal(req, res, next) {
    try {
      const result = await WithdrawalService.requestWithdrawal(req.user.id, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getMyWithdrawals(req, res, next) {
    try {
      const result = await WithdrawalService.getUserWithdrawals(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getCampaignWithdrawals(req, res, next) {
    try {
      const result = await WithdrawalService.getCampaignWithdrawals(req.params.code, req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = WithdrawalController;
