// src/routes/accountRoutes.js
const express = require('express');
const router  = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware  = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.post('/',  authMiddleware(['admin']), auditLogger,             accountController.create);
router.get('/',     authMiddleware(['admin', 'finance_manager']),           accountController.getAll);
router.get('/:id',   authMiddleware(['admin', 'organization', 'finance_manager']),          accountController.getById);
router.put('/:id',     authMiddleware(['admin', 'finance_manager']), auditLogger,        accountController.update);
router.patch('/:id/status', authMiddleware(['admin', 'finance_manager']), auditLogger,   accountController.updateStatus);
router.patch('/:id/balance', authMiddleware(['admin', 'finance_manager']), auditLogger,  accountController.updateBalance);
router.delete('/:id',     authMiddleware(['admin', 'finance_manager']), auditLogger, accountController.remove);

module.exports = router;

