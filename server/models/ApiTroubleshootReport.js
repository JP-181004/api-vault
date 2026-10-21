
const mongoose = require("mongoose");

const diagnosticCheckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["passed", "failed", "review"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    recommendation: {
      type: String,
      default: "",
      maxlength: 1000,
    },
  },
  { _id: false }
);

const apiTroubleshootReportSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    apiEndpoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiEndpoint",
      required: true,
      index: true,
    },

    requestTitle: {
      type: String,
      required: true,
      maxlength: 200,
    },

    environment: {
      type: String,
      default: "Not specified",
      maxlength: 100,
    },

    overallStatus: {
      type: String,
      enum: ["passed", "issues_found", "review"],
      required: true,
    },

    checks: {
      type: [diagnosticCheckSchema],
      default: [],
    },

    responseStatus: {
      type: Number,
      default: null,
    },

    durationMs: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

apiTroubleshootReportSchema.index({
  owner: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "ApiTroubleshootReport",
  apiTroubleshootReportSchema
);
