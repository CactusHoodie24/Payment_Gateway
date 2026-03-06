// src/routes/accountRoutes.js
const express = require('express');
const router  = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware  = require('../middleware/auth');

router.post('/',  authMiddleware(['admin']),             accountController.create);
router.get('/',     authMiddleware(['admin']),           accountController.getAll);
router.get('/:id',   authMiddleware(['admin']),          accountController.getById);
router.put('/:id',     authMiddleware(['admin']),        accountController.update);
router.patch('/:id/status', authMiddleware(['admin']),   accountController.updateStatus);
router.patch('/:id/balance', authMiddleware(['admin']),  accountController.updateBalance);
router.delete('/:id',     authMiddleware(['admin']),     accountController.remove);

module.exports = router;