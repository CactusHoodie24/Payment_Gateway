// src/routes/organizationTypeRoutes.js
const express = require('express');
const router  = express.Router();
const organizationTypeController = require('../controllers/organizationTypeController');
const authMiddleware  = require('../middleware/auth');

router.post('/',   authMiddleware(['admin']),   organizationTypeController.create);
router.get('/',    authMiddleware(['admin']),   organizationTypeController.getAll);
router.get('/:id', authMiddleware(['admin']),   organizationTypeController.getById);
router.put('/:id',  authMiddleware(['admin']),  organizationTypeController.update);
router.delete('/:id',authMiddleware(['admin']), organizationTypeController.remove);

module.exports = router;