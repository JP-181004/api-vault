
const mongoose = require("mongoose");

const secretSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    project: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    environment: {
      type: String,
      required: true,
      enum: ["Development", "Staging", "Production"],
    },

    encryptedKey: {
      type: String,
      required: true,
      select: false,
    },

    iv: {
      type: String,
      required: true,
      select: false,
    },

    authTag: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Secret", secretSchema);
