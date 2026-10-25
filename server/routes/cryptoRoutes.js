
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  encryptText,
  decryptText,
} = require("../controllers/cryptoController");

const router = express.Router();

router.use(protect);

router.post("/encrypt", encryptText);
router.post("/decrypt", decryptText);

module.exports = router;
