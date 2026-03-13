// src/routes/webhookRoutes.js
const express           = require('express');
const router            = express.Router();
const webhookController = require('../controllers/webhookController');
const authMiddleware    = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.post('/',            authMiddleware(['organization', 'admin']), auditLogger, webhookController.create);
router.get('/',             authMiddleware(['organization', 'admin']), webhookController.getAll);
router.get('/:id',          authMiddleware(['organization', 'admin']), webhookController.getById);
router.put('/:id',          authMiddleware(['organization', 'admin']), auditLogger, webhookController.update);
router.patch('/:id/status', authMiddleware(['organization', 'admin']), auditLogger, webhookController.updateStatus);
router.delete('/:id',       authMiddleware(['admin']), auditLogger,                webhookController.remove);

module.exports = router;