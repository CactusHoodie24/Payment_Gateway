// src/routes/organizationApiKeyRoutes.js
const express = require('express');
const router  = express.Router();
const organizationApiKeyController = require('../controllers/organizationApiKeyController');
const authMiddleware  = require('../middleware/auth');

router.post('/generate',  authMiddleware(['admin']),                         organizationApiKeyController.generate);
router.get('/',           authMiddleware(['admin']),                         organizationApiKeyController.getAll);
router.get('/:id',        authMiddleware(['admin']),                         organizationApiKeyController.getById);
router.get('/organization/:organization_id', authMiddleware(['admin']),      organizationApiKeyController.getByOrganization);
router.patch('/:id/status',       authMiddleware(['admin']),                 organizationApiKeyController.updateStatus);
router.patch('/:id/revoke',      authMiddleware(['admin']),                  organizationApiKeyController.revoke);
router.delete('/:id',           authMiddleware(['admin']),                   organizationApiKeyController.remove);

module.exports = router;