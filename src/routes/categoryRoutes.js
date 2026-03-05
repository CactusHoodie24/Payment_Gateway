const express            = require('express');
const router             = express.Router();
const CampaignController = require('../controllers/campaignController');

// GET /api/campaign-categories
router.get('/', CampaignController.getCategories);

module.exports = router;
