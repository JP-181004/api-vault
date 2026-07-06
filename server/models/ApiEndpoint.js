const mongoose = require("mongoose");

const apiEndpointSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },

    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    headers: {
      type: String,
      default: "",
    },

    requestBody: {
      type: String,
      default: "",
    },

    responseExample: {
      type: String,
      default: "",
    },

    authentication: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ApiEndpoint", apiEndpointSchema);