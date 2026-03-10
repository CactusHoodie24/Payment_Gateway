// src/routes/otpRoutes.js
const express       = require('express');
const router        = express.Router();
const otpController = require('../controllers/otpController');

router.post('/generate',    otpController.generate);
router.post('/verify',      otpController.verify);
router.get('/',             otpController.getAll);
router.get('/:id',          otpController.getById);
router.patch('/:id/status', otpController.updateStatus);
router.delete('/cleanup',   otpController.cleanup);
router.delete('/:id',       otpController.remove);

module.exports = router;