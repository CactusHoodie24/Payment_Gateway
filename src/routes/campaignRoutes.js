const express            = require('express');
const router             = express.Router();
const CampaignController = require('../controllers/campaignController');
const DonationController = require('../controllers/donationController');
const { requireAuth }    = require('../middleware/auth');
const upload             = require('../config/multer');

// ── Public routes ──────────────────────────────────────────────────────────────

// GET  /api/campaigns               - all campaigns (supports ?query=)
router.get('/', CampaignController.getAll);

// GET  /api/campaigns/featured      - featured campaigns
router.get('/featured', CampaignController.getFeatured);

// POST /api/campaigns/get-by-code   - single campaign by code
router.post('/get-by-code', CampaignController.getByCode);

// GET  /api/campaigns/get-by-code/:id - campaigns by category id
router.get('/get-by-code/:id', CampaignController.getByCategory);

// POST /api/campaigns/donate        - initiate donation
router.post('/donate', DonationController.donate);

// ── Authenticated routes ───────────────────────────────────────────────────────

// GET  /api/campaigns/fetch         - current user's campaigns
router.get('/fetch', requireAuth, CampaignController.getUserCampaigns);

// POST /api/campaigns               - create campaign (with image uploads)
router.post('/', requireAuth, upload.array('images', 10), CampaignController.create);

// PUT  /api/campaigns/:code         - update campaign
router.put('/:code', requireAuth, upload.array('images', 10), CampaignController.update);

// PATCH /api/campaigns/:code        - partial update
router.patch('/:code', requireAuth, upload.array('images', 10), CampaignController.update);

module.exports = router;
