// src/routes/transactionTypeRoutes.js
const express = require('express');
const router  = express.Router();
const transactionTypeController = require('../controllers/transactionTypeController');

router.post('/',             transactionTypeController.create);
router.get('/',              transactionTypeController.getAll);
router.get('/:id',           transactionTypeController.getById);
router.put('/:id',           transactionTypeController.update);
router.patch('/:id/status',  transactionTypeController.updateStatus);
router.delete('/:id',        transactionTypeController.remove);

module.exports = router;