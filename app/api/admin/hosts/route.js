// ==========================================
// FILE: app/api/admin/hosts/route.js
// GET: list all host accounts (for admin panel host management table).
// ==========================================
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Host from '@/lib/models/Host';

function getAdminSession(request) {
  const raw = request.cookies.get('ayanix_admin_session')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function GET(request) {
  const session = getAdminSession(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  await connectToDatabase();

  const hosts = await Host.find({})
    .select('name email scope commissionPct isActive totalEarned createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ hosts });
}
