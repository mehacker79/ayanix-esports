// ==========================================
// FILE: app/api/host/logout/route.js
// Clears the host session cookie.
// ==========================================
import { NextResponse } from 'next/server';
import { HOST_SESSION_COOKIE_NAME } from '@/lib/hostSession';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(HOST_SESSION_COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return res;
}
