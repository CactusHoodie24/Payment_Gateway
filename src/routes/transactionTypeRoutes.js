// src/routes/transactionTypeRoutes.js
const express = require('express');
const router  = express.Router();
const transactionTypeController = require('../controllers/transactionTypeController');
const authMiddleware  = require('../middleware/auth');

router.post('/',      authMiddleware(['admin']),       transactionTypeController.create);
router.get('/',      authMiddleware(['admin']),        transactionTypeController.getAll);
router.get('/:id',   authMiddleware(['admin']),        transactionTypeController.getById);
router.put('/:id',    authMiddleware(['admin']),       transactionTypeController.update);
router.patch('/:id/status', authMiddleware(['admin']),  transactionTypeController.updateStatus);
router.delete('/:id',   authMiddleware(['admin']),     transactionTypeController.remove);

module.exports = router;