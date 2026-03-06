const express = require('express');
const router = express.Router();

const WithdrawalController = require('../controllers/withdrawalController');
const authMiddleware = require('../middleware/auth');

// POST /api/withdrawals - request withdrawal
router.post('/', authMiddleware(['user', 'admin']), WithdrawalController.requestWithdrawal);

// GET /api/withdrawals - get withdrawals for logged-in user
router.get('/', authMiddleware(['user', 'admin']), WithdrawalController.getMyWithdrawals);

// GET /api/withdrawals/:code - withdrawals for campaign
router.get('/:code', authMiddleware(['user', 'admin']), WithdrawalController.getCampaignWithdrawals);

module.exports = router;