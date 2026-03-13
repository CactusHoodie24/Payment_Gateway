// src/routes/notificationRoutes.js
const express                = require('express');
const router                 = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware         = require('../middleware/auth');

router.post('/',            authMiddleware(['admin']),                 notificationController.send);
router.get('/',             authMiddleware(['organization', 'admin']), notificationController.getAll);
router.get('/:id',          authMiddleware(['organization', 'admin']), notificationController.getById);
router.patch('/:id/status', authMiddleware(['admin']),                 notificationController.updateStatus);
router.delete('/:id',       authMiddleware(['admin']),                 notificationController.remove);

module.exports = router;