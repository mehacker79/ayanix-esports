import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';

// Public, read-only summary of the currently open tournament.
// Deliberately excludes confirmedSquads / room details — this powers
// the landing page hero (slot counter, countdown, prize pool) and
// nothing here should be sensitive.
export async function GET() {
  try {
    await connectToDatabase();

    const tournament = await Tournament.findOne({
      status: { $in: ['UPCOMING', 'LIVE'] },
    }).sort({ matchStartAt: 1 });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'No active tournament found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      title: tournament.title,
      mapType: tournament.mapType,
      entryFee: tournament.entryFee,
      prizePool: tournament.prizePool,
      slotsTotal: tournament.slotsTotal,
      slotsFilled: tournament.slotsFilled,
      status: tournament.status,
      matchStartAt: tournament.matchStartAt,
    });
  } catch (error) {
    console.error('Tournament status fetch failure:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching tournament status' },
      { status: 500 }
    );
  }
}