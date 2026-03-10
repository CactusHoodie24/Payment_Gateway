// src/routes/accountEntryRoutes.js
const express               = require('express');
const router                = express.Router();
const accountEntryController = require('../controllers/accountEntryController');

router.post('/',      accountEntryController.create);
router.get('/',       accountEntryController.getAll);
router.get('/:id',    accountEntryController.getById);
router.delete('/:id', accountEntryController.remove);

module.exports = router;