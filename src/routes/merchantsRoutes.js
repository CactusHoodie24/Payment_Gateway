// routes/merchantsRoute.js
const express = require('express');
const router = express.Router();
const merchantsController = require('../controllers/merchantsController');
const authMiddleware  = require('../middleware/auth');

router.post('/login', merchantsController.loginMerchant)

// Get all merchants with optional filters
router.get('/', authMiddleware(['admin']), merchantsController.getMerchants);

// Get a single merchant by ID
router.get('/:id', authMiddleware(['admin']), merchantsController.getMerchant);

// Create a new merchant
router.post('/', authMiddleware(['admin']), merchantsController.createMerchant);

// Update a merchant by ID
router.post('/update', authMiddleware(['admin']), merchantsController.updateMerchant);

// Delete a merchant by ID
router.delete('/:id', authMiddleware(['admin']), merchantsController.deleteMerchant);

module.exports = router;