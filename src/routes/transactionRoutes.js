// src/routes/transactionRoutes.js
const express = require('express');
const router  = express.Router();
const transactionController = require('../controllers/transactionController');
const PaymentController = require('../controllers/paymentController')
const validatePayment = require('../middleware/validatePayment');
const authMiddleware  = require('../middleware/auth');
const validateApiKey = require('../middleware/validateApiKey');
const apiLimiter = require('../middleware/rateLimiter')

router.post('/',  authMiddleware(['admin']),          transactionController.create);
router.get('/',    authMiddleware(['admin']),         transactionController.getAll);
router.get('/:id',  authMiddleware(['admin']),        transactionController.getById);
router.put('/:id',  authMiddleware(['admin']),        transactionController.update);
router.patch('/:id/status', authMiddleware(['admin']), transactionController.updateStatus);
router.post('/payment-initiate-request', apiLimiter, authMiddleware(['admin', 'organization']), validatePayment, validateApiKey, PaymentController.paymentInitiate)

module.exports = router;