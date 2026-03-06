// src/routes/organizationRoutes.js
const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const validateOrganization = require('../middleware/validateOrganization');

router.post('/',   validateOrganization,                     organizationController.create);
router.get('/',                         organizationController.getAll);
router.get('/:id',                      organizationController.getById);
router.put('/:id',                      organizationController.update);
router.patch('/:id/status',             organizationController.updateStatus);
router.delete('/:id',                   organizationController.remove);

module.exports = router;