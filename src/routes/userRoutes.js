// src/routes/userRoutes.js
const express        = require('express');
const router         = express.Router();
const userController = require('../controllers/userController');
const validateActivation = require('../middleware/validateActivation');



router.post('/',               userController.create);
router.get('/',                userController.getAll);
router.get('/:id',             userController.getById);
router.post('/activate', validateActivation, userController.activate);
router.put('/:id',             userController.update);
router.delete('/:id',          userController.remove);

module.exports = router;