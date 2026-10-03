// ==========================================
// FILE: app/api/admin/host/toggle/route.js
// Super Admin ban / unban a host account.
// Body: { hostId, isActive: boolean }
// ==========================================
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Host from '@/lib/models/Host';

function getAdminSession(request) {
  const raw = request.cookies.get('ayanix_admin_session')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function POST(request) {
  const session = getAdminSession(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Super Admin access required.' }, { status: 403 });
  }

  const { hostId, isActive } = await request.json();
  if (!hostId || typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'hostId and isActive (boolean) are required.' }, { status: 400 });
  }

  await connectToDatabase();

  const host = await Host.findByIdAndUpdate(
    hostId,
    { isActive },
    { new: true, select: 'name email scope isActive' }
  );

  if (!host) return NextResponse.json({ error: 'Host not found.' }, { status: 404 });

  return NextResponse.json({
    ok: true,
    message: `Host ${host.name} has been ${isActive ? 'activated' : 'banned'}.`,
    host: { id: host._id, name: host.name, isActive: host.isActive },
  });
}
