// ==========================================
// FILE: app/api/admin/auth/route.js
// Server-only credential check. The master email/password never ship to the
// browser — they live in process.env and are compared here, on the server.
// ==========================================
import { NextResponse } from "next/server";
import crypto from "crypto";

// Sub-hosts are seeded here for the demo. In production, swap this for a
// Mongoose model (see lib/models/User.js pattern) so an admin can create/revoke
// sub-hosts from the dashboard instead of editing code.
const SUB_HOSTS = [
  { id: "SUBHOST-1", email: "bgmi.host1@ayanix.local", scope: "BGMI" },
  { id: "SUBHOST-2", email: "bgmi.host2@ayanix.local", scope: "BGMI" },
  { id: "SUBHOST-3", email: "ff.host3@ayanix.local", scope: "FREEFIRE" },
  { id: "SUBHOST-4", email: "ff.host4@ayanix.local", scope: "FREEFIRE" },
];

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request) {
  const { email, password } = await request.json();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Admin credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const isSuperAdmin =
    typeof email === "string" &&
    typeof password === "string" &&
    timingSafeEqual(email.toLowerCase(), adminEmail.toLowerCase()) &&
    timingSafeEqual(password, adminPassword);

  const subHost = SUB_HOSTS.find((h) => h.email === email);

  if (!isSuperAdmin && !subHost) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const session = isSuperAdmin
    ? { role: "SUPER_ADMIN", scope: "ALL" }
    : { role: "SUB_HOST", scope: subHost.scope, id: subHost.id };

  const response = NextResponse.json({ ok: true, session });
  // httpOnly cookie so the session token never touches client JS either.
  response.cookies.set("ayanix_admin_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return response;
}

export async function GET() {
  return NextResponse.json({ subHosts: SUB_HOSTS.map(({ id, scope }) => ({ id, scope })) });
}
