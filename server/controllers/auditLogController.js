
const AuditLog = require("../models/AuditLog");

// Return only the authenticated user's audit history.
const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const filter = { owner: req.user._id };

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .select("action secretId resourceType details createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Retrieve audit logs failed:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve audit logs.",
    });
  }
};

module.exports = { getAuditLogs };
