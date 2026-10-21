
const ApiEndpoint = require("../models/ApiEndpoint");
const ApiTroubleshootReport = require("../models/ApiTroubleshootReport");

const {
  createCheck,
  findUnresolvedVariables,
  diagnoseHttpStatus,
  executeRequest,
} = require("../services/apiTroubleshooterService");

async function troubleshootApi(req, res) {
  const checks = [];

  try {
    const endpoint = await ApiEndpoint.findOne({
      _id: req.params.apiId,
      owner: req.user.id,
    });

    if (!endpoint) {
      return res.status(404).json({
        message: "Saved API not found.",
      });
    }

    // 1. Check unresolved variables.
    const unresolved = [
      ...findUnresolvedVariables(endpoint.url),
      ...findUnresolvedVariables(endpoint.headers),
      ...findUnresolvedVariables(endpoint.requestBody),
    ];

    if (unresolved.length > 0) {
      checks.push(
        createCheck(
          "Environment variables",
          "failed",
          `Unresolved variables found: ${[
            ...new Set(unresolved),
          ]
            .map((name) => `{{${name}}}`)
            .join(", ")}.`,
          "Configure the required variables before running this request."
        )
      );
    } else {
      checks.push(
        createCheck(
          "Environment variables",
          "passed",
          "No unresolved template variables were detected."
        )
      );
    }

    // 2. Validate saved headers.
    let headers = {};

    try {
      if (endpoint.headers && endpoint.headers.trim()) {
        headers = JSON.parse(endpoint.headers);
      }

      if (
        !headers ||
        typeof headers !== "object" ||
        Array.isArray(headers)
      ) {
        throw new Error("Headers must be a JSON object.");
      }

      checks.push(
        createCheck(
          "Request headers",
          "passed",
          "Request headers contain valid JSON."
        )
      );
    } catch {
      checks.push(
        createCheck(
          "Request headers",
          "failed",
          "Request headers are not valid JSON.",
          'Use a JSON object, for example: {"Content-Type":"application/json"}.'
        )
      );

      const report = await saveReport({
        owner: req.user.id,
        endpoint,
        checks,
        overallStatus: "issues_found",
      });

      return res.status(200).json({ report });
    }

    // Do not send requests with unresolved variables.
    if (unresolved.length > 0) {
      const report = await saveReport({
        owner: req.user.id,
        endpoint,
        checks,
        overallStatus: "issues_found",
      });

      return res.status(200).json({ report });
    }

    // 3. Execute the request.
    const result = await executeRequest({
      method: endpoint.method,
      url: endpoint.url,
      headers,
      body: endpoint.requestBody || "",
    });

    // executeRequest returns status, body, size and headers.
    checks.push(diagnoseHttpStatus(result.status));

    // 4. Parse the actual response body.
    let parsedBody = result.body;
    let isValidJson = false;

    if (typeof result.body === "string") {
      try {
        parsedBody = JSON.parse(result.body);
        isValidJson = true;
      } catch {
        isValidJson = false;
      }
    } else if (
      result.body !== null &&
      typeof result.body === "object"
    ) {
      isValidJson = true;
    }

    if (isValidJson) {
      checks.push(
        createCheck(
          "Response format",
          "passed",
          "The API returned valid JSON data."
        )
      );
    } else {
      checks.push(
        createCheck(
          "Response format",
          "review",
          "The response was not recognized as valid JSON.",
          "Check the API documentation to confirm the expected response format."
        )
      );
    }

    // 5. Calculate the overall status.
    const overallStatus = checks.some(
      (check) => check.status === "failed"
    )
      ? "issues_found"
      : checks.some((check) => check.status === "review")
        ? "review"
        : "passed";

    // 6. Save the report using the actual timing measurement.
    const report = await saveReport({
      owner: req.user.id,
      endpoint,
      checks,
      overallStatus,
      responseStatus: result.status,
      durationMs: result.durationMs,
    });

    return res.status(200).json({
      message: "Diagnostics completed.",
      report,
    });
  } catch (error) {
    console.error("Troubleshooter error:", {
      name: error.name,
      code: error.code,
      message: error.message,
    });

    let message = "The API request could not be completed.";
    let recommendation =
      "Verify the endpoint URL and check whether the API server is reachable.";

    if (error.code === "ECONNREFUSED") {
      message = "The connection was refused.";
      recommendation =
        "Check that the target API server is running and accepting connections.";
    } else if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") {
      message = "The API hostname could not be resolved.";
      recommendation =
        "Check the hostname and DNS configuration.";
    } else if (error.code === "ECONNRESET") {
      message = "The connection was reset by the remote server.";
      recommendation =
        "Check whether the remote API service is available.";
    } else if (/timed out/i.test(error.message || "")) {
      message = "The API request timed out.";
      recommendation =
        "Check the remote server's availability and network latency.";
    } else if (
      /private|localhost|loopback|blocked|reserved address|internal hostnames/i.test(
        error.message || ""
      )
    ) {
      message = "The request was blocked by URL security checks.";
      recommendation =
        "Use a permitted public HTTP or HTTPS endpoint.";
    }

    checks.push(
      createCheck("Connectivity", "failed", message, recommendation)
    );

    try {
      const endpoint = await ApiEndpoint.findOne({
        _id: req.params.apiId,
        owner: req.user.id,
      });

      if (endpoint) {
        const report = await saveReport({
          owner: req.user.id,
          endpoint,
          checks,
          overallStatus: "issues_found",
        });

        return res.status(200).json({ report });
      }
    } catch (saveError) {
      console.error("Report save failed:", saveError.message);
    }

    return res.status(500).json({
      message: "Unable to complete troubleshooting.",
    });
  }
}

async function saveReport({
  owner,
  endpoint,
  checks,
  overallStatus,
  responseStatus = null,
  durationMs = null,
}) {
  return ApiTroubleshootReport.create({
    owner,
    apiEndpoint: endpoint._id,
    requestTitle: endpoint.title,
    environment: "Not specified",
    checks,
    overallStatus,
    responseStatus,
    durationMs,
  });
}

module.exports = { troubleshootApi };
