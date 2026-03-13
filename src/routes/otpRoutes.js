// src/routes/otpRoutes.js
const express       = require('express');
const router        = express.Router();
const otpController = require('../controllers/otpController');
const auditLogger   = require('../middleware/auditLogger');

router.post('/generate',    auditLogger, otpController.generate);
router.post('/verify',      auditLogger, otpController.verify);
router.get('/',             otpController.getAll);
router.get('/:id',          otpController.getById);
router.patch('/:id/status', auditLogger, otpController.updateStatus);
router.delete('/cleanup',   auditLogger, otpController.cleanup);
router.delete('/:id',       auditLogger, otpController.remove);

module.exports = router;