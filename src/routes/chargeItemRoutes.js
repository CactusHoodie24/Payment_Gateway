// src/routes/chargeItemRoutes.js
const express = require('express');
const router  = express.Router();
const chargeItemController = require('../controllers/chargeItemController');
const authMiddleware  = require('../middleware/auth');

router.post('/', authMiddleware(['admin']),     chargeItemController.create);
router.get('/',   authMiddleware(['admin']),    chargeItemController.getAll);
router.get('/:id', authMiddleware(['admin']),    chargeItemController.getById);
router.put('/:id',  authMiddleware(['admin']),  chargeItemController.update);
router.delete('/:id',authMiddleware(['admin']), chargeItemController.remove);

module.exports = router;