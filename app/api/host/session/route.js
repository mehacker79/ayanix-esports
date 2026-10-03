// ==========================================
// FILE: app/api/host/session/route.js
// Returns the currently logged-in host's identity from the cookie.
// ==========================================
import { NextResponse } from 'next/server';
import { readHostSessionToken, HOST_SESSION_COOKIE_NAME } from '@/lib/hostSession';
import connectToDatabase from '@/lib/db';
import Host from '@/lib/models/Host';

export async function GET(request) {
  const raw = request.cookies.get(HOST_SESSION_COOKIE_NAME)?.value;
  if (!raw) return NextResponse.json({ loggedIn: false });

  const session = readHostSessionToken(raw);
  if (!session) return NextResponse.json({ loggedIn: false });

  await connectToDatabase();
  const host = await Host.findById(session.hostId).select('name email scope isActive');
  if (!host || !host.isActive) return NextResponse.json({ loggedIn: false });

  return NextResponse.json({
    loggedIn: true,
    host: { id: host._id, name: host.name, email: host.email, scope: host.scope },
  });
}
