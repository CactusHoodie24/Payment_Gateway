// src/routes/serviceRequestRoutes.js
const express                  = require('express');
const router                   = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const authMiddleware           = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

// ── Service Types — admin only ────────────────────────────────
router.get('/types',  authMiddleware(['admin', 'finance_manager']), serviceRequestController.getAllServiceTypes);
router.post('/types', authMiddleware(['admin', 'finance_manager']), auditLogger, serviceRequestController.createServiceType);

// ── Float Disbursements — admin only ─────────────────────────
router.get('/disbursements',     authMiddleware(['admin', 'finance_manager', 'finance_officer']), serviceRequestController.getAllDisbursements);
router.get('/disbursements/:id', authMiddleware(['admin', 'finance_manager', 'finance_officer']), serviceRequestController.getDisbursementById);

// ── Service Requests ──────────────────────────────────────────
// Finance Officer initiates (finance_officer + super_admin + finance_manager)
router.post('/', authMiddleware(['admin', 'finance_manager', 'finance_officer']), auditLogger, serviceRequestController.createRequest);

// All admins can view
router.get('/',    authMiddleware(['admin', 'finance_manager', 'finance_officer']), serviceRequestController.getAllRequests);
router.get('/:id', authMiddleware(['admin', 'finance_manager', 'finance_officer']), serviceRequestController.getRequestById);

// Finance Manager + Super Admin can approve/deny
router.patch('/:id/approve', authMiddleware(['admin', 'finance_manager']), auditLogger, serviceRequestController.approveRequest);
router.patch('/:id/deny',    authMiddleware(['admin', 'finance_manager']), auditLogger, serviceRequestController.denyRequest);

module.exports = router;