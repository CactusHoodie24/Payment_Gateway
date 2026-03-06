// src/routes/chargeProfileRoutes.js
const express = require('express');
const router  = express.Router();
const chargeProfileController = require('../controllers/chargeProfileController');

router.post('/',     chargeProfileController.create);
router.get('/',      chargeProfileController.getAll);
router.get('/:id',   chargeProfileController.getById);
router.put('/:id',   chargeProfileController.update);
router.delete('/:id', chargeProfileController.remove);

module.exports = router;