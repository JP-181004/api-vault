const express = require("express");
const {
  createApi,
  getApis,
  getApiById,
  updateApi,
  deleteApi,
} = require("../controllers/apiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createApi);
router.get("/", protect, getApis);
router.get("/:id", protect, getApiById);
router.put("/:id", protect, updateApi);
router.delete("/:id", protect, deleteApi);

module.exports = router;