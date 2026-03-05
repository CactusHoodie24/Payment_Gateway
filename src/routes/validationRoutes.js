// routes/validation.routes.js
const express = require("express");
const router = express.Router();
const validationController = require("../controllers/validationController");

router.post("/validate", (req, res) =>
  validationController.index(req, res)
);

module.exports = router;