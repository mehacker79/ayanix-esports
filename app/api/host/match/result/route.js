// ==========================================
// FILE: app/api/host/match/result/route.js
// Host submits final match results after the game ends.
// Body: { tournamentId, results: [{ squadName, rank, kills, points }] }
// Sets status to COMPLETED and records resultsSubmittedAt.
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

  const { tournamentId, results } = await request.json();

  if (!tournamentId || !Array.isArray(results) || results.length === 0) {
    return NextResponse.json(
      { error: 'Tournament ID and results array are required.' },
      { status: 400 }
    );
  }

  // Validate result entries
  for (const r of results) {
    if (!r.squadName || typeof r.rank !== 'number') {
      return NextResponse.json(
        { error: 'Each result must have squadName and rank.' },
        { status: 400 }
      );
    }
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
    return NextResponse.json({ error: 'Results already submitted for this match.' }, { status: 400 });
  }

  match.results = results.map((r) => ({
    squadName: String(r.squadName).trim(),
    rank: Number(r.rank),
    kills: Number(r.kills) || 0,
    points: Number(r.points) || 0,
  }));
  match.resultsSubmittedAt = new Date();
  match.status = 'COMPLETED';

  await match.save();

  return NextResponse.json({
    ok: true,
    message: 'Match results submitted successfully.',
    resultsSubmittedAt: match.resultsSubmittedAt,
  });
}
