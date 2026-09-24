// ==========================================
// FILE: app/api/admin/tournament/create/route.js
// Admin-only: host a new tournament lobby. Auth is the same
// httpOnly "ayanix_admin_session" cookie set by /api/admin/auth —
// a sub-host can only host lobbies inside their own game scope.
// ==========================================
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import { GAMES, calculateTournamentEconomics } from "@/lib/tournamentConfig";

function getSession(request) {
  const raw = request.cookies.get("ayanix_admin_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function POST(request) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json();
  const { game, map, title, matchStartAt, slotsTotal, entryFee } = body;

  const gameConfig = GAMES[game];
  if (!gameConfig) {
    return NextResponse.json({ error: "Unknown game." }, { status: 400 });
  }

  // Sub-hosts may only create lobbies inside their assigned game.
  if (session.role === "SUB_HOST" && session.scope !== game) {
    return NextResponse.json(
      { error: `Your account can only host ${session.scope} tournaments.` },
      { status: 403 }
    );
  }

  if (!gameConfig.maps.includes(map)) {
    return NextResponse.json(
      { error: `"${map}" is not a valid map for ${gameConfig.label}.` },
      { status: 400 }
    );
  }

  if (!title || !matchStartAt) {
    return NextResponse.json(
      { error: "Title and match start time are required." },
      { status: 400 }
    );
  }

  const slots = Number(slotsTotal) || gameConfig.squadCap;
  const fee = Number(entryFee) || gameConfig.entryFeePerSquad;

  // Prize pool is always derived from entry fee × slots, never typed in by
  // hand, so the number shown to players on the lobby card can never drift
  // from what the host actually configured.
  const economics = calculateTournamentEconomics(game, slots);

  try {
    await connectToDatabase();

    const tournament = await Tournament.create({
      game,
      title,
      mapType: map,
      entryFee: fee,
      prizePool: economics.disbursablePool,
      slotsTotal: slots,
      matchStartAt: new Date(matchStartAt),
      status: "UPCOMING",
      confirmedSquads: [],
    });

    return NextResponse.json({ success: true, tournament }, { status: 201 });
  } catch (error) {
    console.error("Tournament creation failed:", error);
    return NextResponse.json(
      { error: "Could not create the tournament." },
      { status: 500 }
    );
  }
}
