const MockEndpoint = require("../models/MockEndpoint");

// Create a mock endpoint
const createMockEndpoint = async (req, res) => {
  try {
    const { name, method, path, statusCode, responseBody } = req.body;

    if (
      !name?.trim() ||
      !method ||
      !path ||
      typeof path !== "string" ||
      !path.startsWith("/")
    ) {
      return res.status(400).json({
        message: "Name, method, and a valid endpoint path are required.",
      });
    }

    const normalizedMethod = method.toUpperCase();
    const normalizedPath = path.trim();

    if (normalizedPath.includes("?") || normalizedPath.includes("#")) {
      return res.status(400).json({
        message: "Path must not contain query parameters or fragments.",
      });
    }

    const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

    if (!allowedMethods.includes(normalizedMethod)) {
      return res.status(400).json({
        message: "Unsupported HTTP method.",
      });
    }

    const code = Number(statusCode ?? 200);

    if (!Number.isInteger(code) || code < 200 || code > 599) {
      return res.status(400).json({
        message: "Status code must be an integer between 200 and 599.",
      });
    }

    const mockEndpoint = await MockEndpoint.create({
      name: name.trim(),
      method: normalizedMethod,
      path: normalizedPath,
      statusCode: code,
      responseBody: responseBody ?? {},
      owner: req.user._id,
    });

    return res.status(201).json({
      message: "Mock endpoint created successfully.",
      mockEndpoint,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have an endpoint with this method and path.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Create mock endpoint error:", error.message);

    return res.status(500).json({
      message: "Failed to create mock endpoint.",
    });
  }
};

// Get all mock endpoints belonging to the logged-in user
const getMockEndpoints = async (req, res) => {
  try {
    const mockEndpoints = await MockEndpoint.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(mockEndpoints);
  } catch (error) {
    console.error("Get mock endpoints error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve mock endpoints.",
    });
  }
};

// Delete a mock endpoint belonging to the logged-in user
const deleteMockEndpoint = async (req, res) => {
  try {
    const mockEndpoint = await MockEndpoint.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!mockEndpoint) {
      return res.status(404).json({
        message: "Mock endpoint not found.",
      });
    }

    return res.status(200).json({
      message: "Mock endpoint deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid mock endpoint ID.",
      });
    }

    console.error("Delete mock endpoint error:", error.message);

    return res.status(500).json({
      message: "Failed to delete mock endpoint.",
    });
  }
};

module.exports = {
  createMockEndpoint,
  getMockEndpoints,
  deleteMockEndpoint,
};