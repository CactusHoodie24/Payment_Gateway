// src/routes/webhookEventRoutes.js
const express                = require('express');
const router                 = express.Router();
const webhookEventController = require('../controllers/webhookEventController');
const authMiddleware         = require('../middleware/auth');

// Public to authenticated users — organizations need this to build their webhook
router.get('/grouped', authMiddleware(['organization', 'admin']), webhookEventController.getGrouped);
router.get('/',        authMiddleware(['organization', 'admin']), webhookEventController.getAll);
router.get('/:id',     authMiddleware(['organization', 'admin']), webhookEventController.getById);

// Admin only — manage predefined events
router.post('/',             authMiddleware(['admin', 'organization']), webhookEventController.create);
router.patch('/:id/status',  authMiddleware(['admin']), webhookEventController.updateStatus);
router.delete('/:id',        authMiddleware(['admin']), webhookEventController.remove);

module.exports = router;