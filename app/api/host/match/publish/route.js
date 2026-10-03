// ==========================================
// FILE: app/api/host/match/publish/route.js
// Host enters the game Room ID and Password and clicks "Publish".
// This sets credentialsPublishedAt. Players will automatically see
// the credentials 10 minutes before matchStartAt (enforced client-side
// and in /api/match/credentials).
// ==========================================
import { NextResponse } from 'next/server';
import { readHostSessionToken, HOST_SESSION_COOKIE_NAME } from '@/lib/hostSession';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';

function getSession(request) {
  const raw = request.cookies.get(HOST_SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return readHostSessionToken(raw);
}

export async function POST(request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { tournamentId, roomId, roomPassword } = await request.json();

  if (!tournamentId || !roomId?.trim() || !roomPassword?.trim()) {
    return NextResponse.json(
      { error: 'Tournament ID, Room ID, and Room Password are required.' },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const match = await Tournament.findOne({
    _id: tournamentId,
    hostId: session.hostId,
  });

  if (!match) {
    return NextResponse.json(
      { error: 'Match not found or not assigned to you.' },
      { status: 404 }
    );
  }

  if (match.status === 'COMPLETED') {
    return NextResponse.json({ error: 'This match is already completed.' }, { status: 400 });
  }

  match.roomId = roomId.trim();
  match.roomPassword = roomPassword.trim();
  match.credentialsPublishedAt = new Date();
  // Auto-set status to LIVE when credentials are published
  if (match.status === 'UPCOMING') match.status = 'LIVE';

  await match.save();

  return NextResponse.json({
    ok: true,
    message: `Room credentials published. Players will see them 10 min before match start.`,
    credentialsPublishedAt: match.credentialsPublishedAt,
  });
}
