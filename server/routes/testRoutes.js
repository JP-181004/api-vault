const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  sendTestRequest,
} = require("../controllers/testController");

const router = express.Router();

router.post("/", protect, sendTestRequest);

module.exports = router;