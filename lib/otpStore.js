// ==========================================
// FILE: lib/otpStore.js
// Server-side OTP storage. Kept in-memory for simplicity — this works fine
// for a single Node process (e.g. `next start` on one server / a VM).
//
// LIMITATION: if you deploy on a serverless platform (Vercel functions) or
// run multiple instances behind a load balancer, each instance has its own
// memory, so a "send" on instance A and a "verify" on instance B would fail.
// For that setup, swap this Map for a MongoDB collection (you already have
// lib/db.js + mongoose) or Redis with a TTL index. The function signatures
// below are written so that swap only touches this one file.
// ==========================================

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const store = new Map(); // email -> { otp, expiresAt, attempts }

export function saveOtp(email, otp) {
  store.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
}

export function verifyOtp(email, submittedOtp) {
  const key = email.toLowerCase();
  const record = store.get(key);

  if (!record) return { ok: false, reason: "No OTP was requested for this email." };
  if (Date.now() > record.expiresAt) {
    store.delete(key);
    return { ok: false, reason: "This code has expired. Request a new one." };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    store.delete(key);
    return { ok: false, reason: "Too many attempts. Request a new code." };
  }

  if (record.otp !== submittedOtp) {
    return { ok: false, reason: "Incorrect code." };
  }

  store.delete(key); // one-time use
  return { ok: true };
}
