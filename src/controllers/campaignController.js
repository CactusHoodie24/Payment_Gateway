const CampaignService  = require('../services/campaignService');
const CategoryModel    = require('../models/CategoryModel');

const CampaignController = {
  async getAll(req, res, next) {
    try {
      const result = await CampaignService.getAll(req.query.query || null);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getFeatured(req, res, next) {
    try {
      const result = await CampaignService.getFeatured();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/campaigns/get-by-code  { campaign_code }
  async getByCode(req, res, next) {
    try {
      const { campaign_code } = req.body;
      if (!campaign_code) {
        return res.status(422).json({ message: 'campaign_code is required.' });
      }
      const result = await CampaignService.getByCode(campaign_code);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/campaigns/get-by-code/:id  (by category id)
  async getByCategory(req, res, next) {
    try {
      const result = await CampaignService.getByCategory(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/campaigns/fetch  (authenticated user's campaigns)
  async getUserCampaigns(req, res, next) {
    try {
      const result = await CampaignService.getUserCampaigns(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const result = await CampaignService.create(req.user.id, req.body, req.files);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const result = await CampaignService.update(req.params.code, req.user.id, req.body, req.files);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await CategoryModel.getAll();
      res.status(200).json(categories);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = CampaignController;
