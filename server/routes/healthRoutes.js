const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Vault Server is Healthy 🚀",
  });
});

module.exports = router;