
const { executeRequest } = require("./requestExecutionService");

const VARIABLE_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;

function createCheck(name, status, message, recommendation = "") {
  return {
    name,
    status,
    message,
    recommendation,
  };
}

function findUnresolvedVariables(value) {
  if (typeof value !== "string") {
    return [];
  }

  return [...value.matchAll(VARIABLE_PATTERN)].map((match) =>
    match[1].trim()
  );
}

function diagnoseHttpStatus(status) {
  if (status >= 200 && status < 300) {
    return createCheck(
      "HTTP status",
      "passed",
      `The server returned HTTP ${status}.`
    );
  }

  if (status === 401) {
    return createCheck(
      "HTTP status",
      "failed",
      "The server returned 401 Unauthorized.",
      "Check whether authentication is configured correctly and whether the credential is valid."
    );
  }

  if (status === 403) {
    return createCheck(
      "HTTP status",
      "failed",
      "The server returned 403 Forbidden.",
      "Check account permissions, API scopes, and access policies."
    );
  }

  if (status === 404) {
    return createCheck(
      "HTTP status",
      "failed",
      "The server returned 404 Not Found.",
      "Verify the endpoint path, API version, and resource identifier."
    );
  }

  if (status >= 500) {
    return createCheck(
      "HTTP status",
      "failed",
      `The server returned HTTP ${status}.`,
      "Inspect the API server logs and verify that the upstream service is healthy."
    );
  }

  if (status >= 400) {
    return createCheck(
      "HTTP status",
      "failed",
      `The server returned HTTP ${status}.`,
      "Review the API documentation, request parameters, headers, and body."
    );
  }

  return createCheck(
    "HTTP status",
    "review",
    `The server returned HTTP ${status}.`,
    "Review the endpoint's expected status codes."
  );
}

module.exports = {
  createCheck,
  findUnresolvedVariables,
  diagnoseHttpStatus,
  executeRequest,
};
