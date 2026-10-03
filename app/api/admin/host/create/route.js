// ==========================================
// FILE: app/api/admin/host/create/route.js
// Super Admin creates a new host account.
// Body: { name, email, password, scope, commissionPct }
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

  const { name, email, password, scope, commissionPct } = await request.json();

  if (!name?.trim() || !email?.trim() || !password || !scope) {
    return NextResponse.json(
      { error: 'name, email, password, and scope (BGMI/FREEFIRE) are required.' },
      { status: 400 }
    );
  }

  if (!['BGMI', 'FREEFIRE'].includes(scope)) {
    return NextResponse.json({ error: 'scope must be BGMI or FREEFIRE.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  await connectToDatabase();

  const exists = await Host.findOne({ email: email.toLowerCase() });
  if (exists) {
    return NextResponse.json({ error: 'A host with this email already exists.' }, { status: 409 });
  }

  const host = await Host.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: Host.hashPassword(password),
    scope,
    commissionPct: Number(commissionPct) || 5,
    isActive: true,
  });

  return NextResponse.json(
    {
      ok: true,
      host: {
        id: host._id,
        name: host.name,
        email: host.email,
        scope: host.scope,
        commissionPct: host.commissionPct,
      },
    },
    { status: 201 }
  );
}
