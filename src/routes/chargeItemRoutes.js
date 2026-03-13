// src/routes/chargeItemRoutes.js
const express = require('express');
const router  = express.Router();
const chargeItemController = require('../controllers/chargeItemController');
const authMiddleware  = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.post('/', authMiddleware(['admin']), auditLogger,     chargeItemController.create);
router.get('/',   authMiddleware(['admin']),    chargeItemController.getAll);
router.get('/:id', authMiddleware(['admin']),    chargeItemController.getById);
router.put('/:id',  authMiddleware(['admin']), auditLogger,  chargeItemController.update);
router.delete('/:id',authMiddleware(['admin']), auditLogger, chargeItemController.remove);

module.exports = router;