// src/routes/chargeProfileRoutes.js
const express = require('express');
const router  = express.Router();
const chargeProfileController = require('../controllers/chargeProfileController');
const authMiddleware  = require('../middleware/auth');

router.post('/', authMiddleware(['admin']),    chargeProfileController.create);
router.get('/',   authMiddleware(['admin']),   chargeProfileController.getAll);
router.get('/:id', authMiddleware(['admin']),  chargeProfileController.getById);
router.put('/:id', authMiddleware(['admin']),  chargeProfileController.update);
router.delete('/:id', authMiddleware(['admin']), chargeProfileController.remove);

module.exports = router;