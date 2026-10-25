
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "SECRET_CREATED",
        "SECRET_REVEALED",
        "SECRET_COPIED",
        "SECRET_DELETED",
        "TEXT_ENCRYPTED",
        "TEXT_DECRYPTED",
      ],
    },

    // Optional reference; the secret may already be deleted.
    secretId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Safe descriptive metadata only—never store secret values.
    resourceType: {
      type: String,
      enum: ["secret", "crypto_workspace"],
      required: true,
    },

    details: {
      type: String,
      maxlength: 200,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

auditLogSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
