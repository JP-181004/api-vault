
const {
  encryptSecret,
  decryptSecret,
} = require("../utils/encryption");

const MAX_TEXT_LENGTH = 64 * 1024;

function isValidEncoding(encoding) {
  return encoding === "base64" || encoding === "hex";
}

function isValidHex(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length % 2 === 0 &&
    /^[0-9a-f]+$/i.test(value)
  );
}

function isValidBase64(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
  ) {
    return false;
  }

  return Buffer.from(value, "base64").toString("base64") === value;
}

// Encrypt arbitrary text using the existing AES-256-GCM service.
const encryptText = async (req, res) => {
  try {
    const { plaintext, encoding = "base64" } = req.body || {};

    if (
      typeof plaintext !== "string" ||
      plaintext.length === 0 ||
      plaintext.length > MAX_TEXT_LENGTH
    ) {
      return res.status(400).json({
        message: "Provide text between 1 byte and 64 KB.",
      });
    }

    if (!isValidEncoding(encoding)) {
      return res.status(400).json({
        message: "Encoding must be base64 or hex.",
      });
    }

    const encrypted = encryptSecret(plaintext);

    const encryptedBytes = Buffer.from(
      encrypted.encryptedKey,
      "hex"
    );

    const ciphertext =
      encoding === "base64"
        ? encryptedBytes.toString("base64")
        : encrypted.encryptedKey;

    // The complete payload is required for authenticated decryption.
    const payload = JSON.stringify({
      version: 1,
      algorithm: "aes-256-gcm",
      encoding,
      ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
    });

    return res.status(200).json({
      message: "Text encrypted successfully.",
      payload,
    });
  } catch (error) {
    // Do not log plaintext or encryption material.
    console.error("Text encryption failed.");

    return res.status(500).json({
      message: "Unable to encrypt text.",
    });
  }
};

// Decrypt a payload produced by this workspace.
const decryptText = async (req, res) => {
  try {
    const { payload, encoding } = req.body || {};

    if (
      typeof payload !== "string" ||
      payload.length === 0 ||
      payload.length > MAX_TEXT_LENGTH * 2
    ) {
      return res.status(400).json({
        message: "Provide a valid encrypted payload.",
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(payload);
    } catch {
      return res.status(400).json({
        message:
          "Invalid payload. Paste the complete encrypted output JSON.",
      });
    }

    if (
      !parsed ||
      parsed.version !== 1 ||
      parsed.algorithm !== "aes-256-gcm" ||
      typeof parsed.ciphertext !== "string" ||
      typeof parsed.iv !== "string" ||
      typeof parsed.authTag !== "string" ||
      !/^[0-9a-f]{24}$/i.test(parsed.iv) ||
      !/^[0-9a-f]{32}$/i.test(parsed.authTag)
    ) {
      return res.status(400).json({
        message: "Encrypted payload format is invalid.",
      });
    }

    const selectedEncoding = parsed.encoding || encoding;

    if (!isValidEncoding(selectedEncoding)) {
      return res.status(400).json({
        message: "Encoding must be base64 or hex.",
      });
    }

    let ciphertextHex;

    if (selectedEncoding === "hex") {
      if (!isValidHex(parsed.ciphertext)) {
        return res.status(400).json({
          message: "Ciphertext hexadecimal encoding is invalid.",
        });
      }

      ciphertextHex = parsed.ciphertext;
    } else {
      if (!isValidBase64(parsed.ciphertext)) {
        return res.status(400).json({
          message: "Ciphertext Base64 encoding is invalid.",
        });
      }

      ciphertextHex = Buffer.from(
        parsed.ciphertext,
        "base64"
      ).toString("hex");
    }

    const plaintext = decryptSecret({
      encryptedKey: ciphertextHex,
      iv: parsed.iv,
      authTag: parsed.authTag,
    });

    return res.status(200).json({
      message: "Text decrypted successfully.",
      plaintext,
    });
  } catch (error) {
    // Authentication-tag failure and other decryption errors
    // must not disclose ciphertext, plaintext, or key material.
    console.error("Text decryption failed.");

    return res.status(400).json({
      message:
        "Unable to decrypt payload. It may be invalid, modified, or encrypted with a different key.",
    });
  }
};

module.exports = {
  encryptText,
  decryptText,
};
