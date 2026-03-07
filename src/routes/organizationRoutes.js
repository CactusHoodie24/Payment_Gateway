// src/routes/organizationRoutes.js
const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const validateOrganization = require('../middleware/validateOrganization');
const authMiddleware  = require('../middleware/auth');

router.post('/',  authMiddleware(['admin']), validateOrganization,                     organizationController.create);
router.get('/',       authMiddleware(['admin']),                  organizationController.getAll);
router.get('/:id',      authMiddleware(['admin', 'organization']),              organizationController.getById);
router.put('/:id',        authMiddleware(['admin', 'organization']),            organizationController.update);
router.patch('/:id/status',  authMiddleware(['admin', 'organization']),            organizationController.updateStatus);
router.delete('/:id',        authMiddleware(['admin', 'organization']),            organizationController.remove);

module.exports = router;