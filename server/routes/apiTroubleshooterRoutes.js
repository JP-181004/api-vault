
const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  troubleshootApi,
} = require("../controllers/apiTroubleshooterController");

const router = express.Router();

// Run diagnostics on a saved API endpoint.
router.post("/:apiId", protect, troubleshootApi);

module.exports = router;
