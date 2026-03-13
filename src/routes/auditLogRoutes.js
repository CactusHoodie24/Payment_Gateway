// src/routes/auditLogRoutes.js
const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const authMiddleware = require('../middleware/auth');

// Audit logs are read-only — only admin can view
router.get('/',    authMiddleware(['admin']), auditLogController.getAll);
router.get('/:id', authMiddleware(['admin']), auditLogController.getById);

module.exports = router;
