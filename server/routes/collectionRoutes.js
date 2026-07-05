const express = require("express");

const {
  createCollection,
  getCollections,
  getSingleCollection,
  updateCollection,
  deleteCollection,
} = require("../controllers/collectionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createCollection);
router.get("/", protect, getCollections);
router.get("/:id", protect, getSingleCollection);
router.put("/:id", protect, updateCollection);
router.delete("/:id", protect, deleteCollection);

module.exports = router;