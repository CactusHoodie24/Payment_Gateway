const express               = require('express');
const router                = express.Router();
const WithdrawalController  = require('../controllers/withdrawalController');
const { requireAuth }       = require('../middleware/auth');

// All withdrawal routes require authentication

// POST /api/withdrawals              - request a withdrawal
router.post('/', requireAuth, WithdrawalController.requestWithdrawal);

// GET  /api/withdrawals              - get all withdrawals for logged-in user
router.get('/', requireAuth, WithdrawalController.getMyWithdrawals);

// GET  /api/withdrawals/:code        - get withdrawals for a specific campaign
router.get('/:code', requireAuth, WithdrawalController.getCampaignWithdrawals);

module.exports = router;
