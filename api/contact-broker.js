const crypto = require("crypto");

const RATE_LIMIT_MAX = Number(process.env.BROKER_RATE_LIMIT_MAX || 6);
const RATE_LIMIT_WINDOW_MS = Number(process.env.BROKER_RATE_LIMIT_WINDOW_MS || 60000);
const RECEIVER_TIMEOUT_MS = Number(process.env.RECEIVER_TIMEOUT_MS || 7000);

const rateLimitStore = new Map();

function getClientIp(req) {
  const headerValue =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.headers["cf-connecting-ip"] ||
    "";

  if (typeof headerValue === "string" && headerValue.length > 0) {
    return headerValue.split(",")[0].trim();
  }

  return "unknown";
}

function createRequestId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString("hex");
}

function setCommonHeaders(res, requestId) {
  res.setHeader("x-request-id", requestId);
  res.setHeader("cache-control", "no-store");
}

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  if (Buffer.isBuffer(req.body)) {
    return JSON.parse(req.body.toString("utf8"));
  }

  return {};
}

function normalizeOrigin(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return new URL(trimmed).origin.toLowerCase();
  } catch {
    return trimmed.replace(/\/+$/, "").toLowerCase();
  }
}

function getAllowedOrigins() {
  const configured = process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || "";
  if (!configured) {
    return [];
  }

  return configured
    .split(",")
    .map((value) => normalizeOrigin(value))
    .filter(Boolean);
}

function normalizePayload(raw) {
  return {
    name: String(raw.name || "").trim(),
    email: String(raw.email || "").trim(),
    topic: String(raw.topic || raw["project-type"] || "")
      .trim()
      .toLowerCase(),
    message: String(raw.message || "").trim(),
    honeypot: String(raw.honeypot || raw.company || "").trim(),
    client_timestamp: String(raw.client_timestamp || raw.clientTimestamp || "").trim(),
    source: String(raw.source || "website").trim().toLowerCase(),
  };
}

function validatePayload(payload) {
  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const allowedTopics = new Set(["", "project", "collab", "repo", "other"]);

  if (!payload.name || payload.name.length > 120) {
    errors.push("name");
  }

  if (!payload.email || payload.email.length > 255 || !emailPattern.test(payload.email)) {
    errors.push("email");
  }

  if (!allowedTopics.has(payload.topic)) {
    errors.push("topic");
  }

  if (!payload.message || payload.message.length > 5000) {
    errors.push("message");
  }

  if (!payload.client_timestamp) {
    errors.push("client_timestamp");
  }

  if (payload.source.length > 40) {
    errors.push("source");
  }

  return errors;
}

function isRateLimited(clientIp) {
  const now = Date.now();
  const key = clientIp || "unknown";
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

function sweepRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

module.exports = async function handler(req, res) {
  const requestId = createRequestId();
  setCommonHeaders(res, requestId);

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "method_not_allowed",
      message: "Only POST is supported.",
      request_id: requestId,
    });
  }

  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = normalizeOrigin(req.headers.origin || "");
  if (allowedOrigins.length > 0 && !allowedOrigins.includes(requestOrigin)) {
    return res.status(403).json({
      error: "origin_not_allowed",
      message: "Request origin is not allowed.",
      request_id: requestId,
    });
  }

  const receiverUrl = process.env.RECEIVER_CONTACT_URL;
  if (!receiverUrl) {
    return res.status(500).json({
      error: "broker_not_configured",
      message: "Broker is not configured yet.",
      request_id: requestId,
    });
  }

  const clientIp = getClientIp(req);
  sweepRateLimitStore();
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: "rate_limited",
      message: "Too many requests. Please try again shortly.",
      request_id: requestId,
    });
  }

  let rawPayload;
  try {
    rawPayload = parseBody(req);
  } catch {
    return res.status(400).json({
      error: "invalid_json",
      message: "Request payload must be valid JSON.",
      request_id: requestId,
    });
  }

  const payload = normalizePayload(rawPayload);
  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) {
    return res.status(422).json({
      error: "validation_error",
      message: "Submitted fields are invalid.",
      request_id: requestId,
      details: validationErrors,
    });
  }

  if (payload.honeypot) {
    return res.status(202).json({
      accepted: true,
      request_id: requestId,
    });
  }

  const headers = {
    "content-type": "application/json",
    "x-request-id": requestId,
    "x-forwarded-by": "vercel-contact-broker",
  };

  if (process.env.RECEIVER_TOKEN) {
    headers["x-receiver-token"] = process.env.RECEIVER_TOKEN;
  }

  const timeout = AbortSignal.timeout(RECEIVER_TIMEOUT_MS);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(receiverUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: timeout,
    });
  } catch {
    return res.status(502).json({
      error: "upstream_unreachable",
      message: "Unable to reach the receiver service.",
      request_id: requestId,
    });
  }

  if (!upstreamResponse.ok) {
    return res.status(502).json({
      error: "upstream_error",
      message: "Receiver service rejected the request.",
      request_id: requestId,
    });
  }

  return res.status(202).json({
    accepted: true,
    request_id: requestId,
  });
};
