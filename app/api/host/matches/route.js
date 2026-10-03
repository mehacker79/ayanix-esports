// ==========================================
// FILE: app/api/host/matches/route.js
// Returns all tournaments assigned to the logged-in host.
// Shows upcoming + live matches so they can pre-schedule.
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

export async function GET(request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  await connectToDatabase();

  // Fetch all non-completed matches assigned to this host, most recent first
  const matches = await Tournament.find({
    hostId: session.hostId,
    status: { $in: ['UPCOMING', 'LIVE'] },
  })
    .sort({ matchStartAt: 1 })
    .select(
      'game title mapType matchCode status matchStartAt slotsTotal confirmedSquads ' +
        'roomId roomPassword credentialsPublishedAt results resultsSubmittedAt entryFee prizePool'
    )
    .lean();

  return NextResponse.json({ matches });
}
