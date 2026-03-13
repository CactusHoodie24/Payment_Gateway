// src/routes/accountEntryRoutes.js
const express               = require('express');
const router                = express.Router();
const accountEntryController = require('../controllers/accountEntryController');
const auditLogger           = require('../middleware/auditLogger');

router.post('/',      auditLogger, accountEntryController.create);
router.get('/',       accountEntryController.getAll);
router.get('/:id',    accountEntryController.getById);
router.delete('/:id', auditLogger, accountEntryController.remove);

module.exports = router;