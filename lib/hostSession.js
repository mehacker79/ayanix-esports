// ==========================================
// FILE: lib/hostSession.js
// Minimal signed-cookie session for Host accounts.
// Mirrors lib/session.js but uses a separate cookie name and
// stores { hostId, email, scope } instead of a plain email.
// ==========================================
import crypto from 'crypto';

const COOKIE_NAME = 'ayanix_host_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set.');
  return secret;
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

/** Creates a signed host session token string to store in an httpOnly cookie. */
export function createHostSessionToken(hostId, email, scope) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${hostId}|${email.toLowerCase()}|${scope}|${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}|${signature}`).toString('base64');
}

/** Reads and verifies a host session cookie value. Returns null if invalid/expired. */
export function readHostSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 5) return null;
    const [hostId, email, scope, expiresAtStr, signature] = parts;
    const expiresAt = Number(expiresAtStr);
    const payloadStr = `${hostId}|${email}|${scope}|${expiresAtStr}`;
    const expected = sign(payloadStr);

    const sigBufA = Buffer.from(signature);
    const sigBufB = Buffer.from(expected);
    const sigMatches =
      sigBufA.length === sigBufB.length && crypto.timingSafeEqual(sigBufA, sigBufB);

    if (!sigMatches || Date.now() > expiresAt) return null;
    return { hostId, email, scope };
  } catch {
    return null;
  }
}

export const HOST_SESSION_COOKIE_NAME = COOKIE_NAME;
export const HOST_SESSION_MAX_AGE = SESSION_TTL_MS / 1000;
