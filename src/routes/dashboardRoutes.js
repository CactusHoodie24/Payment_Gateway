// src/routes/dashboardRoutes.js
const express             = require('express');
const router              = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware      = require('../middleware/auth');

router.get('/summary', authMiddleware(['admin', 'organization']), dashboardController.getSummary);

module.exports = router;