// ==========================================
// FILE: lib/session.js
// Minimal signed-cookie session (HMAC), no external auth library needed.
// Cookie payload: base64("email|expiresAt|signature")
// ==========================================
import crypto from "crypto";

const COOKIE_NAME = "ayanix_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it to .env.local before using auth.");
  }
  return secret;
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(email) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${email.toLowerCase()}|${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}|${signature}`).toString("base64");
}

export function readSessionToken(token) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [email, expiresAtStr, signature] = decoded.split("|");
    const expiresAt = Number(expiresAtStr);
    const expected = sign(`${email}|${expiresAtStr}`);

    const sigMatches =
      Buffer.from(signature).length === Buffer.from(expected).length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

    if (!sigMatches || Date.now() > expiresAt) return null;
    return { email };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
