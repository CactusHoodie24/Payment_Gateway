// src/routes/transactionRoutes.js
const express = require('express');
const router  = express.Router();
const transactionController = require('../controllers/transactionController');
const PaymentController = require('../controllers/paymentController')
const validatePayment = require('../middleware/validatePayment');

router.post('/',            transactionController.create);
router.get('/',             transactionController.getAll);
router.get('/:id',          transactionController.getById);
router.put('/:id',          transactionController.update);
router.patch('/:id/status', transactionController.updateStatus);
router.post('/payment-initiate-request', validatePayment, PaymentController.paymentInitiate)

module.exports = router;