// ==========================================
// FILE: app/api/host/match/chat/route.js
// In-match live chat — host side.
// GET: fetch last 50 messages for a match.
// POST: host posts a message.
// ==========================================
import { NextResponse } from 'next/server';
import { readHostSessionToken, HOST_SESSION_COOKIE_NAME } from '@/lib/hostSession';
import connectToDatabase from '@/lib/db';
import ChatMessage from '@/lib/models/ChatMessage';
import Tournament from '@/lib/models/Tournament';

function getSession(request) {
  const raw = request.cookies.get(HOST_SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return readHostSessionToken(raw);
}

export async function GET(request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId');
  if (!tournamentId) return NextResponse.json({ error: 'tournamentId required.' }, { status: 400 });

  await connectToDatabase();

  // Verify this match belongs to this host
  const match = await Tournament.findOne({ _id: tournamentId, hostId: session.hostId }).select('_id');
  if (!match) return NextResponse.json({ error: 'Match not found.' }, { status: 404 });

  const messages = await ChatMessage.find({ tournamentId })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();

  return NextResponse.json({ messages });
}

export async function POST(request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { tournamentId, text } = await request.json();
  if (!tournamentId || !text?.trim()) {
    return NextResponse.json({ error: 'tournamentId and text are required.' }, { status: 400 });
  }

  await connectToDatabase();

  const match = await Tournament.findOne({ _id: tournamentId, hostId: session.hostId }).select('_id');
  if (!match) return NextResponse.json({ error: 'Match not found.' }, { status: 404 });

  const msg = await ChatMessage.create({
    tournamentId,
    senderRole: 'host',
    senderLabel: '🛡️ Host',
    text: text.trim(),
  });

  return NextResponse.json({ ok: true, message: msg });
}
