import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Tournament from '@/lib/models/Tournament';

export async function GET(request) {
  try {
    await connectToDatabase();

    // Latest active entry points parameters model document search query schema trigger
    const documentQueryInstance = await Tournament.findOne({ status: 'UPCOMING' });

    if (!documentQueryInstance) {
      return NextResponse.json({ success: false, error: "No active tournament found" }, { status: 404 });
    }

    // Extract values matching target parameter requirements logic blocks safely
    const confirmedSquadsList = documentQueryInstance.confirmedSquads
      .filter(squad => squad.paymentStatus === 'PAID')
      .map((squad, index) => ({
        squadId: squad._id,
        squadName: squad.squadName,
        finishRankPosition: index + 1,
        confirmedKillsCount: 0
      }));

    return NextResponse.json({ success: true, squads: confirmedSquadsList });

  } catch (errorPipelineException) {
    console.error("Critical Admin Retrieval Failure Core Layer:", errorPipelineException);
    return NextResponse.json({ error: "Database context pipeline fetching block crash occurred" }, { status: 500 });
  }
}
