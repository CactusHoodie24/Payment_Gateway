const express = require('express');
const router = express.Router();

const CampaignController = require('../controllers/campaignController');
const DonationController = require('../controllers/donationController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');

// ── Public routes ─────────────────────────────────────────

// GET  /api/campaigns
router.get('/', CampaignController.getAll);

// GET  /api/campaigns/featured
router.get('/featured', CampaignController.getFeatured);

// POST /api/campaigns/get-by-code
router.post('/get-by-code', CampaignController.getByCode);

// GET /api/campaigns/get-by-code/:id
router.get('/get-by-code/:id', CampaignController.getByCategory);

// POST /api/campaigns/donate
router.post('/donate', DonationController.donate);


// ── Authenticated routes ──────────────────────────────────

// GET current user's campaigns
router.get('/fetch', authMiddleware(['user','admin']), CampaignController.getUserCampaigns);

// CREATE campaign
router.post(
  '/',
  authMiddleware(['user','admin']),
  upload.array('images', 10),
  CampaignController.create
);

// UPDATE campaign
router.put(
  '/:code',
  authMiddleware(['user','admin']),
  upload.array('images', 10),
  CampaignController.update
);

// PARTIAL UPDATE
router.patch(
  '/:code',
  authMiddleware(['user','admin']),
  upload.array('images', 10),
  CampaignController.update
);

module.exports = router;