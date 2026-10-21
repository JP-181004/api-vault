
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createSecret,
  getSecrets,
  revealSecret,
  deleteSecret,
} = require("../controllers/secretController");

const router = express.Router();

router.use(protect);

router.post("/", createSecret);
router.get("/", getSecrets);
router.post("/:id/reveal", revealSecret);
router.delete("/:id", deleteSecret);

module.exports = router;
