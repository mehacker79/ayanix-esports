// ==========================================
// FILE: app/api/admin/tournament/assign-host/route.js
// Super Admin assigns a host to a tournament.
// Body: { tournamentId, hostId }
// A host can only be assigned if the tournament's game matches their scope.
// ==========================================
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';
import Host from '@/lib/models/Host';

function getAdminSession(request) {
  const raw = request.cookies.get('ayanix_admin_session')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function POST(request) {
  const session = getAdminSession(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { tournamentId, hostId } = await request.json();
  if (!tournamentId || !hostId) {
    return NextResponse.json({ error: 'tournamentId and hostId are required.' }, { status: 400 });
  }

  await connectToDatabase();

  const [tournament, host] = await Promise.all([
    Tournament.findById(tournamentId).select('game status hostId title'),
    Host.findById(hostId).select('name scope isActive'),
  ]);

  if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 });
  if (!host) return NextResponse.json({ error: 'Host not found.' }, { status: 404 });

  if (!host.isActive) {
    return NextResponse.json({ error: 'This host account is currently banned.' }, { status: 400 });
  }

  if (host.scope !== tournament.game) {
    return NextResponse.json(
      { error: `Host scope (${host.scope}) does not match tournament game (${tournament.game}).` },
      { status: 400 }
    );
  }

  // Check: this host isn't already managing a LIVE match
  const liveMatch = await Tournament.findOne({
    hostId: host._id,
    status: 'LIVE',
    _id: { $ne: tournamentId },
  });
  if (liveMatch) {
    return NextResponse.json(
      { error: `${host.name} is already managing a LIVE match. A host can only run one live match at a time.` },
      { status: 400 }
    );
  }

  tournament.hostId = host._id;
  await tournament.save();

  return NextResponse.json({
    ok: true,
    message: `${host.name} assigned to "${tournament.title}".`,
  });
}
