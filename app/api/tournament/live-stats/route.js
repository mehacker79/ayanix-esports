import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';
import { GAMES } from '@/lib/tournamentConfig';

export async function GET() {
  try {
    await connectToDatabase();

    const gameIds = Object.keys(GAMES); // ['BGMI', 'FREEFIRE']

    const results = await Promise.all(
      gameIds.map(async (gameId) => {
        const config = GAMES[gameId];
        const tournament = await Tournament.findOne({
          game: gameId,
          status: { $in: ['UPCOMING', 'LIVE'] },
        }).sort({ matchStartAt: 1 });

        if (!tournament) {
          // Koi active tournament nahi hai abhi — config ke default figures dikhao,
          // fake "already filling up" numbers nahi dikhayenge.
          return {
            game: gameId,
            live: false,
            title: `${config.fullName} — Coming Soon`,
            mapType: config.maps[0],
            entryFee: config.entryFeePerSquad,
            slotsTotal: config.squadCap,
            slotsFilled: 0,
            status: 'UPCOMING',
            matchStartAt: null,
          };
        }

        return {
          game: gameId,
          live: true,
          title: tournament.title,
          mapType: tournament.mapType,
          entryFee: tournament.entryFee,
          prizePool: tournament.prizePool,
          slotsTotal: tournament.slotsTotal,
          slotsFilled: tournament.confirmedSquads.length,
          status: tournament.status,
          matchStartAt: tournament.matchStartAt,
        };
      })
    );

    return NextResponse.json({ success: true, tournaments: results });
  } catch (error) {
    console.error('live-stats fetch failure:', error);
    return NextResponse.json({ success: false, error: 'Could not load live stats' }, { status: 500 });
  }
}