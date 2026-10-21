const mongoose = require("mongoose");
const crypto = require("crypto");

const mockEndpointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },

    path: {
      type: String,
      required: true,
      trim: true,
    },

    statusCode: {
      type: Number,
      required: true,
      default: 200,
      min: 100,
      max: 599,
    },

    responseBody: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Unique identifier used in the public mock URL.
    publicId: {
      type: String,
      default: () => crypto.randomBytes(12).toString("hex"),
      unique: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate method/path combinations for the same owner.
mockEndpointSchema.index(
  { owner: 1, method: 1, path: 1 },
  { unique: true }
);

module.exports = mongoose.model("MockEndpoint", mockEndpointSchema);