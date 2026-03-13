// src/routes/userRoutes.js
const express        = require('express');
const router         = express.Router();
const userController = require('../controllers/userController');
const validateActivation = require('../middleware/validateActivation');
const auditLogger    = require('../middleware/auditLogger');

router.post('/',               auditLogger, userController.create);
router.get('/',                userController.getAll);
router.get('/:id',             userController.getById);
router.post('/activate', validateActivation, auditLogger, userController.activate);
router.put('/:id',             auditLogger, userController.update);
router.delete('/:id',          auditLogger, userController.remove);

module.exports = router;