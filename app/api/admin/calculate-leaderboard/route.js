import { NextResponse } from 'next/server';

const POSITION_POINT_MATRIX = {
  1: 10,
  2: 6,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 1,
  8: 1,
};

export async function POST(request) {
  try {
    const { rawMatchMetrics } = await request.json();

    if (!rawMatchMetrics || !Array.isArray(rawMatchMetrics)) {
      return NextResponse.json({ error: "Invalid Data Packet schema array model structure" }, { status: 400 });
    }

    const computedLobbyLeaderboard = rawMatchMetrics.map((squadReportRow) => {
      const currentSquadPlacementRank = parseInt(squadReportRow.finishRankPosition);
      const documentedKillCount = parseInt(squadReportRow.confirmedKillsCount || 0);

      const finalPlacementBasePoints = POSITION_POINT_MATRIX[currentSquadPlacementRank] || 0;
      const absoluteCalculatedScore = finalPlacementBasePoints + documentedKillCount;

      return {
        squadId: squadReportRow.squadId,
        squadName: squadReportRow.squadName,
        placementPoints: finalPlacementBasePoints,
        killPoints: documentedKillCount,
        totalCalculatedMatchPoints: absoluteCalculatedScore,
      };
    });

    computedLobbyLeaderboard.sort((alphaElement, betaElement) => betaElement.totalCalculatedMatchPoints - alphaElement.totalCalculatedMatchPoints);

    return NextResponse.json({ success: true, processedLeaderboard: computedLobbyLeaderboard }, { status: 200 });

  } catch (systemCoreError) {
    console.error("Leaderboard pipeline exception core runtime error:", systemCoreError);
    return NextResponse.json({ error: "Calculation pipeline processing failure occurred" }, { status: 500 });
  }
}
