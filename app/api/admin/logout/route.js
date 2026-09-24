// ==========================================
// FILE: app/api/admin/logout/route.js
// ==========================================
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("ayanix_admin_session", "", { path: "/", maxAge: 0 });
  return response;
}
