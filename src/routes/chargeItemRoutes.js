// src/routes/chargeItemRoutes.js
const express = require('express');
const router  = express.Router();
const chargeItemController = require('../controllers/chargeItemController');

router.post('/',      chargeItemController.create);
router.get('/',       chargeItemController.getAll);
router.get('/:id',    chargeItemController.getById);
router.put('/:id',    chargeItemController.update);
router.delete('/:id', chargeItemController.remove);

module.exports = router;