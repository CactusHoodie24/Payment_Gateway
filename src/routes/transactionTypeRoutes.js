// src/routes/transactionTypeRoutes.js
const express = require('express');
const router  = express.Router();
const transactionTypeController = require('../controllers/transactionTypeController');
const authMiddleware  = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.post('/',      authMiddleware(['admin']), auditLogger,       transactionTypeController.create);
router.get('/',      authMiddleware(['admin']),        transactionTypeController.getAll);
router.get('/:id',   authMiddleware(['admin']),        transactionTypeController.getById);
router.put('/:id',    authMiddleware(['admin']), auditLogger,       transactionTypeController.update);
router.patch('/:id/status', authMiddleware(['admin']), auditLogger,  transactionTypeController.updateStatus);
router.delete('/:id',   authMiddleware(['admin']), auditLogger,     transactionTypeController.remove);

module.exports = router;