// src/routes/chargeProfileRoutes.js
const express = require('express');
const router  = express.Router();
const chargeProfileController = require('../controllers/chargeProfileController');
const authMiddleware  = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.post('/', authMiddleware(['admin']), auditLogger,    chargeProfileController.create);
router.get('/',   authMiddleware(['admin', 'finance_manager']),   chargeProfileController.getAll);
router.get('/:id', authMiddleware(['admin', 'finance_manager']),  chargeProfileController.getById);
router.put('/:id', authMiddleware(['admin', 'finance_manager']), auditLogger,  chargeProfileController.update);
router.delete('/:id', authMiddleware(['admin', 'finance_manager']), auditLogger, chargeProfileController.remove);

module.exports = router;