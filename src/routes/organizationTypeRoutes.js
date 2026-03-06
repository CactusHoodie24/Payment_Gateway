// src/routes/organizationTypeRoutes.js
const express = require('express');
const router  = express.Router();
const organizationTypeController = require('../controllers/organizationTypeController');

router.post('/',      organizationTypeController.create);
router.get('/',       organizationTypeController.getAll);
router.get('/:id',    organizationTypeController.getById);
router.put('/:id',    organizationTypeController.update);
router.delete('/:id', organizationTypeController.remove);

module.exports = router;