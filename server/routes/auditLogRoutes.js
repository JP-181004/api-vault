
const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getAuditLogs } = require("../controllers/auditLogController");

const router = express.Router();

router.use(protect);
router.get("/", getAuditLogs);

module.exports = router;
