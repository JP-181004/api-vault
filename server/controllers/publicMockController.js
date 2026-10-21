const MockEndpoint = require("../models/MockEndpoint");

const handlePublicMockRequest = async (req, res) => {
  try {
    const publicId = req.params.publicId;

    // Express 5 wildcard parameters are arrays of path segments.
    const pathSegments = req.params.path || [];
    const requestedPath = "/" + pathSegments.join("/");

    const mockEndpoint = await MockEndpoint.findOne({
      publicId,
      method: req.method,
      path: requestedPath,
      isActive: true,
    });

    if (!mockEndpoint) {
      return res.status(404).json({
        message: "Mock endpoint not found or inactive.",
      });
    }

    return res
      .status(mockEndpoint.statusCode)
      .json(mockEndpoint.responseBody);
  } catch (error) {
    console.error("Public mock request error:", error.message);

    return res.status(500).json({
      message: "Failed to process mock request.",
    });
  }
};

module.exports = { handlePublicMockRequest };