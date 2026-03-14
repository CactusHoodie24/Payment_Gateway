// src/routes/organizationRoutes.js
const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const validateOrganization = require('../middleware/validateOrganization');
const authMiddleware  = require('../middleware/auth');
const cookieAuthMiddleware = require('../middleware/cookiemiddleware');
const auditLogger = require('../middleware/auditLogger');

router.post('/register', auditLogger, validateOrganization,         organizationController.create);
router.get('/',       authMiddleware(['admin']),                  organizationController.getAll);
router.get('/:id',      authMiddleware(['admin', 'organization']),     organizationController.getById);
router.put('/:id',        authMiddleware(['admin', 'organization']), auditLogger,  organizationController.update);
router.patch('/:id/status',  authMiddleware(['admin', 'organization']), auditLogger, organizationController.updateStatus);
router.delete('/:id',        authMiddleware(['admin', 'organization']), auditLogger, organizationController.remove);

module.exports = router;