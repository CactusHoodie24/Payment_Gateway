// src/routes/organizationApiKeyRoutes.js
const express = require('express');
const router  = express.Router();
const organizationApiKeyController = require('../controllers/organizationApiKeyController');

router.post('/generate',                          organizationApiKeyController.generate);
router.get('/',                                   organizationApiKeyController.getAll);
router.get('/:id',                                organizationApiKeyController.getById);
router.get('/organization/:organization_id',      organizationApiKeyController.getByOrganization);
router.patch('/:id/status',                       organizationApiKeyController.updateStatus);
router.patch('/:id/revoke',                       organizationApiKeyController.revoke);
router.delete('/:id',                             organizationApiKeyController.remove);

module.exports = router;