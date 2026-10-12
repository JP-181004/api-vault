const dns = require("node:dns").promises;
const net = require("node:net");
const http = require("node:http");
const https = require("node:https");
const ipaddr = require("ipaddr.js");

const ALLOWED_METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
]);

const MAX_BODY_SIZE = 1024 * 1024;
const MAX_RESPONSE_SIZE = 2 * 1024 * 1024;
const TIMEOUT_MS = 15000;

function isPublicIP(address) {
  if (!net.isIP(address)) return false;

  try {
    const parsed = ipaddr.parse(address);

    // Only globally routable unicast addresses are allowed.
    // This rejects loopback, private, link-local, multicast,
    // reserved, and other special-purpose address ranges.
    if (parsed.kind() === "ipv6") {
      // IPv4-mapped IPv6 addresses are rejected to avoid ambiguity.
      if (parsed.isIPv4MappedAddress()) return false;
    }

    return parsed.range() === "unicast";
  } catch {
    return false;
  }
}

async function resolvePublicTarget(target) {
  const hostname = target.hostname.toLowerCase();

  if (
    !hostname ||
    hostname.endsWith(".") ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".test")
  ) {
    throw new Error("Requests to local or internal hostnames are blocked.");
  }

  if (net.isIP(hostname)) {
    if (!isPublicIP(hostname)) {
      throw new Error("Requests to private or reserved IP addresses are blocked.");
    }

    return { address: hostname, family: net.isIP(hostname) };
  }

  let addresses;

  try {
    addresses = await dns.lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new Error("The target hostname could not be resolved.");
  }

  if (
    !addresses.length ||
    addresses.some(({ address }) => !isPublicIP(address))
  ) {
    throw new Error(
      "The target resolves to a private, reserved, or otherwise blocked IP address."
    );
  }

  // Pin the connection to an IP address already validated above.
  return addresses[0];
}

async function validateTarget(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    throw new Error("Enter a valid absolute URL.");
  }

  let target;

  try {
    target = new URL(rawUrl);
  } catch {
    throw new Error("Enter a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }

  if (target.username || target.password) {
    throw new Error("Credentials embedded in URLs are not allowed.");
  }

  const resolvedAddress = await resolvePublicTarget(target);

  return { target, resolvedAddress };
}

function executeHttpRequest(target, resolvedAddress, method, headers, body) {
  return new Promise((resolve, reject) => {
    const transport = target.protocol === "https:" ? https : http;
    let settled = false;
    let timer;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      callback(value);
    };

    const requestOptions = {
      method,
      headers,
      maxHeaderSize: 16 * 1024,

      // Use only the IP address that passed validation.
     lookup: (_hostname, options, callback) => {
  const address = resolvedAddress.address;
  const family = net.isIP(address);

  if (!family) {
    return callback(new Error("Resolved IP address is invalid."));
  }

  if (options?.all) {
    return callback(null, [{ address, family }]);
  }

  return callback(null, address, family);
},};

    // Preserve TLS certificate validation and SNI for HTTPS hostnames.
    if (target.protocol === "https:" && !net.isIP(target.hostname)) {
      requestOptions.servername = target.hostname;
    }

    const request = transport.request(target, requestOptions, (response) => {
      const chunks = [];
      let total = 0;

      response.on("data", (chunk) => {
        total += chunk.length;

        if (total > MAX_RESPONSE_SIZE) {
          request.destroy(new Error("Response exceeded the 2 MB limit."));
          return;
        }

        chunks.push(chunk);
      });

      response.on("end", () => {
        finish(resolve, {
          status: response.statusCode || 0,
          statusText: response.statusMessage || "",
          headers: response.headers,
          body: Buffer.concat(chunks).toString("utf8"),
          size: total,
        });
      });

      response.on("error", (error) => finish(reject, error));
    });

    timer = setTimeout(() => {
      request.destroy(new Error("Request timed out after 15 seconds."));
    }, TIMEOUT_MS);

    request.on("error", (error) => finish(reject, error));

    if (body) request.write(body);
    request.end();
  });
}

async function executeRequest(input = {}) {
  const method = String(input.method || "GET").toUpperCase();

  if (!ALLOWED_METHODS.has(method)) {
    throw new Error("Unsupported HTTP method.");
  }

  const { target, resolvedAddress } = await validateTarget(input.url);

  const suppliedHeaders = input.headers ?? {};
  const headers = {};

  if (
    typeof suppliedHeaders !== "object" ||
    suppliedHeaders === null ||
    Array.isArray(suppliedHeaders)
  ) {
    throw new Error("Headers must be a key-value object.");
  }

  for (const [key, value] of Object.entries(suppliedHeaders)) {
    if (typeof value !== "string") {
      throw new Error("Header names and values must be strings.");
    }

    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(key)) {
      throw new Error("Invalid HTTP header name.");
    }

    if (/[\r\n]/.test(value)) {
      throw new Error("HTTP header values cannot contain newlines.");
    }

    if (
      [
        "host",
        "connection",
        "content-length",
        "transfer-encoding",
        "proxy-authorization",
      ].includes(key.toLowerCase())
    ) {
      throw new Error(`The ${key} header cannot be set manually.`);
    }

    headers[key] = value;
  }

  let body;

  if (input.body !== undefined && input.body !== null && input.body !== "") {
    if (typeof input.body !== "string") {
      throw new Error("The request body must be a string.");
    }

    if (Buffer.byteLength(input.body, "utf8") > MAX_BODY_SIZE) {
      throw new Error("Request body exceeds the 1 MB limit.");
    }

    if (["GET", "HEAD"].includes(method)) {
      throw new Error(`${method} requests cannot have a body.`);
    }

    body = input.body;
  }

  return executeHttpRequest(
    target,
    resolvedAddress,
    method,
    headers,
    body
  );
}

module.exports = { executeRequest };