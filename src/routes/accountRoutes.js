// src/routes/accountRoutes.js
const express = require('express');
const router  = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware  = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.post('/',  authMiddleware(['admin']), auditLogger,             accountController.create);
router.get('/',     authMiddleware(['admin']),           accountController.getAll);
router.get('/:id',   authMiddleware(['admin', 'organization']),          accountController.getById);
router.put('/:id',     authMiddleware(['admin']), auditLogger,        accountController.update);
router.patch('/:id/status', authMiddleware(['admin']), auditLogger,   accountController.updateStatus);
router.patch('/:id/balance', authMiddleware(['admin']), auditLogger,  accountController.updateBalance);
router.delete('/:id',     authMiddleware(['admin']), auditLogger, accountController.remove);

module.exports = router;

module.exports = router;uditLogger