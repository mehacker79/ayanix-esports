// ==========================================
// FILE: app/api/host/auth/route.js
// Host login — email + password (hosts are created by super admin).
// Sets a separate httpOnly cookie from the player and admin sessions.
// ==========================================
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Host from '@/lib/models/Host';
import {
  createHostSessionToken,
  HOST_SESSION_COOKIE_NAME,
  HOST_SESSION_MAX_AGE,
} from '@/lib/hostSession';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  await connectToDatabase();
  const host = await Host.findOne({ email: email.toLowerCase() });

  if (!host || !host.verifyPassword(password)) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  if (!host.isActive) {
    return NextResponse.json(
      { error: 'Your host account has been suspended. Contact the admin.' },
      { status: 403 }
    );
  }

  const token = createHostSessionToken(host._id.toString(), host.email, host.scope);

  const response = NextResponse.json({
    ok: true,
    host: {
      id: host._id,
      name: host.name,
      email: host.email,
      scope: host.scope,
    },
  });

  response.cookies.set(HOST_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: HOST_SESSION_MAX_AGE,
  });

  return response;
}
