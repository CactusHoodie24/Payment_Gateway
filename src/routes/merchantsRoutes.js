// routes/merchantsRoute.js
const express = require('express');
const router = express.Router();
const merchantsController = require('../controllers/merchantsController');

// Get all merchants with optional filters
router.get('/', merchantsController.getMerchants);

// Get a single merchant by ID
router.get('/:id', merchantsController.getMerchant);

// Create a new merchant
router.post('/', merchantsController.createMerchant);

// Update a merchant by ID
router.put('/:id', merchantsController.updateMerchant);

// Delete a merchant by ID
router.delete('/:id', merchantsController.deleteMerchant);

module.exports = router;