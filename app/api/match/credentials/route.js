// ==========================================
// FILE: app/api/match/credentials/route.js
// Time-gated room credentials for registered players.
// A player can only see Room ID + Password if:
//   1. They are a registered member of a PAID squad in this tournament.
//   2. The current time >= matchStartAt - 10 minutes.
//   3. Host has published the credentials (credentialsPublishedAt is set).
// ==========================================
import { NextResponse } from 'next/server';
import { readSessionToken, SESSION_COOKIE_NAME } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';

const REVEAL_MS_BEFORE_START = 10 * 60 * 1000; // 10 minutes

function getPlayerSession(request) {
  const raw = request.cookies.get(SESSION_COOKIE_NAME ?? 'ayanix_session')?.value;
  if (!raw) return null;
  return readSessionToken(raw);
}

export async function GET(request) {
  const session = getPlayerSession(request);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId');
  if (!tournamentId) return NextResponse.json({ error: 'tournamentId required.' }, { status: 400 });

  await connectToDatabase();

  const match = await Tournament.findById(tournamentId).select(
    'game title matchCode matchStartAt status roomId roomPassword credentialsPublishedAt confirmedSquads'
  );

  if (!match) return NextResponse.json({ error: 'Match not found.' }, { status: 404 });

  // Check player is registered (paid squad member)
  const isRegistered = match.confirmedSquads.some(
    (squad) =>
      squad.paymentStatus === 'PAID' &&
      squad.captainEmail === session.email
  );

  if (!isRegistered) {
    return NextResponse.json({ error: 'You are not registered in this match.' }, { status: 403 });
  }

  // Always return matchCode (visible to all registered players immediately)
  const baseInfo = {
    matchCode: match.matchCode,
    game: match.game,
    title: match.title,
    matchStartAt: match.matchStartAt,
    status: match.status,
  };

  // Time-gate: credentials visible 10 min before start
  const now = Date.now();
  const startMs = match.matchStartAt ? new Date(match.matchStartAt).getTime() : null;
  const credentialsRevealed =
    match.credentialsPublishedAt &&
    startMs &&
    now >= startMs - REVEAL_MS_BEFORE_START;

  if (!credentialsRevealed) {
    const revealAt = startMs ? new Date(startMs - REVEAL_MS_BEFORE_START).toISOString() : null;
    return NextResponse.json({
      ...baseInfo,
      credentialsAvailable: false,
      revealAt,
      message: 'Room credentials will appear 10 minutes before match start.',
    });
  }

  return NextResponse.json({
    ...baseInfo,
    credentialsAvailable: true,
    roomId: match.roomId,
    roomPassword: match.roomPassword,
  });
}
