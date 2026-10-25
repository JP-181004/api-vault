
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

// Existing routes
const dashboardRoutes = require("./routes/dashboardRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const testRoutes = require("./routes/testRoutes");
const secretRoutes = require("./routes/secretRoutes");
const cryptoRoutes = require("./routes/cryptoRoutes");
const mockEndpointRoutes = require("./routes/mockEndpointRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
// API Troubleshooter route
const apiTroubleshooterRoutes = require("./routes/apiTroubleshooterRoutes");

// Public Mock Server controller
const {
  handlePublicMockRequest,
} = require("./controllers/publicMockController");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Existing API routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/apis", apiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/test", testRoutes);
app.use("/api/secrets", secretRoutes);

// Authenticated encryption workspace routes
app.use("/api/crypto", cryptoRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// Authenticated Mock Server management routes
app.use("/api/mock-endpoints", mockEndpointRoutes);

// API Troubleshooter routes
app.use("/api/troubleshooter", apiTroubleshooterRoutes);

// Public Mock Server route
app.all("/mock/:publicId/{*path}", handlePublicMockRequest);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to API Vault 🚀");
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    message:
      err.status === 400
        ? "Invalid request body"
        : "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
