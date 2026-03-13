// src/routes/organizationApiKeyRoutes.js
const express = require('express');
const router  = express.Router();
const organizationApiKeyController = require('../controllers/organizationApiKeyController');
const authMiddleware  = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.post('/generate',  authMiddleware(['admin']), auditLogger,                         organizationApiKeyController.generate);
router.get('/',           authMiddleware(['admin']),                         organizationApiKeyController.getAll);
router.get('/:id',        authMiddleware(['admin']),                         organizationApiKeyController.getById);
router.get('/organization/:organization_id', authMiddleware(['admin']),      organizationApiKeyController.getByOrganization);
router.patch('/:id/status',       authMiddleware(['admin']), auditLogger,                 organizationApiKeyController.updateStatus);
router.patch('/:id/revoke',      authMiddleware(['admin']), auditLogger,                  organizationApiKeyController.revoke);
router.delete('/:id',           authMiddleware(['admin']), auditLogger,                   organizationApiKeyController.remove);

module.exports = router;