const collectionRoutes = require("./routes/collectionRoutes");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const express = require("express");


const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/collections", collectionRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Welcome to API Vault 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});