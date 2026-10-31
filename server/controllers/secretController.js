
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");
const Secret = require("../models/Secret");

const {
  encryptSecret,
  decryptSecret,
} = require("../utils/encryption");

// Write audit logs without ever recording plaintext credentials.
async function writeAuditLog({
  owner,
  action,
  secretId = null,
  resourceType = "secret",
  details = "",
}) {
  try {
    await AuditLog.create({
      owner,
      action,
      secretId,
      resourceType,
      details,
    });
  } catch (error) {
    console.error("Audit log write failed:", error.message);
  }
}

// Create and encrypt a secret before saving it.
const createSecret = async (req, res) => {
  try {
    const {
      serviceName,
      project,
      environment,
      apiKey,
      expiresAt,
      rotationReminderDays,
    } = req.body;

    if (
      typeof serviceName !== "string" ||
      !serviceName.trim() ||
      typeof project !== "string" ||
      !project.trim() ||
      typeof apiKey !== "string" ||
      !apiKey.trim() ||
      !["Development", "Staging", "Production"].includes(environment)
    ) {
      return res.status(400).json({
        message: "Provide a service, project, valid environment and API key.",
      });
    }

    const reminderDays =
      rotationReminderDays === undefined ? 90 : rotationReminderDays;

    if (
      !Number.isInteger(reminderDays) ||
      reminderDays < 1 ||
      reminderDays > 365
    ) {
      return res.status(400).json({
        message: "Rotation reminder must be between 1 and 365 days.",
      });
    }

    let expiryDate = null;

    if (expiresAt) {
      expiryDate = new Date(expiresAt);

      if (
        Number.isNaN(expiryDate.getTime()) ||
        expiryDate.getTime() <= Date.now()
      ) {
        return res.status(400).json({
          message: "Expiry date must be a valid future date.",
        });
      }
    }

    const encrypted = encryptSecret(apiKey);

    const secret = await Secret.create({
      serviceName: serviceName.trim(),
      project: project.trim(),
      environment,

      encryptedKey: encrypted.encryptedKey,
      iv: encrypted.iv,
      authTag: encrypted.authTag,

      expiresAt: expiryDate,
      rotationReminderDays: reminderDays,
      lastRotatedAt: null,
      lastAccessedAt: null,
      status: "active",

      owner: req.user._id,
    });

    await writeAuditLog({
      owner: req.user._id,
      action: "SECRET_CREATED",
      secretId: secret._id,
      resourceType: "secret",
      details: `Created a ${environment} credential`,
    });

    return res.status(201).json({
      message: "Secret encrypted and saved successfully.",
      secret: {
        _id: secret._id,
        serviceName: secret.serviceName,
        project: secret.project,
        environment: secret.environment,
        expiresAt: secret.expiresAt,
        createdAt: secret.createdAt,
        lastRotatedAt: secret.lastRotatedAt,
        lastAccessedAt: secret.lastAccessedAt,
        rotationReminderDays: secret.rotationReminderDays,
        status: secret.status,
      },
    });
  } catch (error) {
    console.error("Create secret failed:", error.message);

    return res.status(500).json({
      message: "Unable to save secret.",
    });
  }
};

// List only the authenticated user's secret metadata.
const getSecrets = async (req, res) => {
  try {
    const secrets = await Secret.find({
      owner: req.user._id,
    })
      .select("-encryptedKey -iv -authTag")
      .sort({ createdAt: -1 })
      .lean();

    const safeSecrets = secrets.map((secret) => ({
      ...secret,
      status: secret.status || "active",
      rotationReminderDays: secret.rotationReminderDays ?? 90,
      lastRotatedAt: secret.lastRotatedAt ?? null,
      lastAccessedAt: secret.lastAccessedAt ?? null,
    }));

    return res.json({
      secrets: safeSecrets,
    });
  } catch (error) {
    console.error("List secrets failed:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve secrets.",
    });
  }
};

// Reveal a credential and record its last access time.
const revealSecret = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        message: "Secret not found.",
      });
    }

    const secret = await Secret.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).select("+encryptedKey +iv +authTag");

    if (!secret) {
      return res.status(404).json({
        message: "Secret not found.",
      });
    }

    if (secret.status !== "active") {
      return res.status(403).json({
        message: "This credential is not active and cannot be revealed.",
      });
    }

    const apiKey = decryptSecret({
      encryptedKey: secret.encryptedKey,
      iv: secret.iv,
      authTag: secret.authTag,
    });

    await Secret.updateOne(
      {
        _id: secret._id,
        owner: req.user._id,
      },
      {
        $set: {
          lastAccessedAt: new Date(),
        },
      }
    );

    await writeAuditLog({
      owner: req.user._id,
      action: "SECRET_REVEALED",
      secretId: secret._id,
      resourceType: "secret",
      details: "Credential revealed",
    });

    return res.json({
      apiKey,
    });
  } catch (error) {
    console.error("Reveal secret failed.");

    return res.status(500).json({
      message: "Unable to reveal secret.",
    });
  }
};

// Delete only a secret owned by the authenticated user.
const deleteSecret = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        message: "Secret not found.",
      });
    }

    const deleted = await Secret.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Secret not found.",
      });
    }

    await writeAuditLog({
      owner: req.user._id,
      action: "SECRET_DELETED",
      secretId: deleted._id,
      resourceType: "secret",
      details: "Credential deleted",
    });

    return res.json({
      message: "Secret deleted successfully.",
    });
  } catch (error) {
    console.error("Delete secret failed:", error.message);

    return res.status(500).json({
      message: "Unable to delete secret.",
    });
  }
};

module.exports = {
  createSecret,
  getSecrets,
  revealSecret,
  deleteSecret,
};
