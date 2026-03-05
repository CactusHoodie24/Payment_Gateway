const DonationService = require('../services/donationService');

const DonationController = {
  async donate(req, res, next) {
    try {
      const result = await DonationService.initiateDonation(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async airtelCallback(req, res, next) {
    try {
      const result = await DonationService.handleCallback('airtel_money', req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async tnmCallback(req, res, next) {
    try {
      const result = await DonationService.handleCallback('tnm_mpamba', req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DonationController;
