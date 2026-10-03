// ==========================================
// FILE: app/api/match/chat/route.js
// In-match live chat — player side.
// GET: fetch messages for a match (player must be registered).
// POST: player sends a message (can flag as cheat report).
// ==========================================
import { NextResponse } from 'next/server';
import { readSessionToken } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import ChatMessage from '@/lib/models/ChatMessage';
import Tournament from '@/lib/models/Tournament';

const SESSION_COOKIE = 'ayanix_session';

function getPlayerSession(request) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return readSessionToken(raw);
}

async function getRegisteredMatch(tournamentId, email) {
  const match = await Tournament.findById(tournamentId).select(
    '_id status confirmedSquads'
  );
  if (!match) return null;

  const isRegistered = match.confirmedSquads.some(
    (s) => s.paymentStatus === 'PAID' && s.captainEmail === email
  );
  return isRegistered ? match : null;
}

export async function GET(request) {
  const session = getPlayerSession(request);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId');
  if (!tournamentId) return NextResponse.json({ error: 'tournamentId required.' }, { status: 400 });

  await connectToDatabase();
  const match = await getRegisteredMatch(tournamentId, session.email);
  if (!match) return NextResponse.json({ error: 'Not registered in this match.' }, { status: 403 });

  const messages = await ChatMessage.find({ tournamentId })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();

  return NextResponse.json({ messages });
}

export async function POST(request) {
  const session = getPlayerSession(request);
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const { tournamentId, text, isCheatReport } = await request.json();
  if (!tournamentId || !text?.trim()) {
    return NextResponse.json({ error: 'tournamentId and text are required.' }, { status: 400 });
  }

  await connectToDatabase();
  const match = await getRegisteredMatch(tournamentId, session.email);
  if (!match) return NextResponse.json({ error: 'Not registered in this match.' }, { status: 403 });

  // Find squad name for display
  const squad = match.confirmedSquads.find(
    (s) => s.paymentStatus === 'PAID' && s.captainEmail === session.email
  );
  const label = squad ? `⚡ ${squad.squadName}` : `⚡ ${session.email}`;

  const msg = await ChatMessage.create({
    tournamentId,
    senderRole: 'player',
    senderLabel: label,
    text: text.trim().slice(0, 500),
    isCheatReport: Boolean(isCheatReport),
  });

  return NextResponse.json({ ok: true, message: msg });
}
