// ==========================================
// FILE: app/api/admin/tournaments/route.js
// Admin-only: list all tournaments (any status) so the admin panel
// can show them in the "Assign Host" dropdown.
// ==========================================
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';

function getAdminSession(request) {
  const raw = request.cookies.get('ayanix_admin_session')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function GET(request) {
  const session = getAdminSession(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  await connectToDatabase();

  const tournaments = await Tournament.find({})
    .sort({ matchStartAt: -1 })
    .select('game title mapType matchCode status matchStartAt hostId slotsTotal entryFee prizePool')
    .populate('hostId', 'name email scope')
    .lean();

  return NextResponse.json({ tournaments });
}
