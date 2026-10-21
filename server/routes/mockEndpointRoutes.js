const express = require("express");

const {
  createMockEndpoint,
  getMockEndpoints,
  deleteMockEndpoint,
} = require("../controllers/mockEndpointController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All management routes require authentication.
router.use(protect);

// Create a mock endpoint.
router.post("/", createMockEndpoint);

// Get all mock endpoints belonging to the logged-in user.
router.get("/", getMockEndpoints);

// Delete a mock endpoint.
router.delete("/:id", deleteMockEndpoint);

module.exports = router;