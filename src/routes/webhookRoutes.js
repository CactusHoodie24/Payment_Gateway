// src/routes/webhookRoutes.js
const express           = require('express');
const router            = express.Router();
const webhookController = require('../controllers/webhookController');
const authMiddleware    = require('../middleware/auth');

router.post('/',            authMiddleware(['organization', 'admin']), webhookController.create);
router.get('/',             authMiddleware(['organization', 'admin']), webhookController.getAll);
router.get('/:id',          authMiddleware(['organization', 'admin']), webhookController.getById);
router.put('/:id',          authMiddleware(['organization', 'admin']), webhookController.update);
router.patch('/:id/status', authMiddleware(['organization', 'admin']), webhookController.updateStatus);
router.delete('/:id',       authMiddleware(['admin']),                 webhookController.remove);

module.exports = router;