// ==========================================
// FILE: lib/tournamentConfig.js
// Single source of truth for tournament economics.
// Nothing here is a hardcoded final number — every displayed figure
// is DERIVED from entryFee / squadCap / platformCut at render time,
// so changing a fee automatically re-flows every screen and the admin panel.
// ==========================================

export const GAMES = {
  BGMI: {
    id: "BGMI",
    label: "BGMI",
    fullName: "Battlegrounds Mobile India",
    format: "Squad (4 Players)",
    entryFeePerSquad: 120,
    squadCap: 16,
    platformCutFlat: 520,
    winLabel: "Winner Winner Chicken Dinner",
    maps: ["Erangel", "Sanhok", "Miramar"],
  },
  FREEFIRE: {
    id: "FREEFIRE",
    label: "Free Fire",
    fullName: "Free Fire MAX",
    format: "Squad (4 Players)",
    entryFeePerSquad: 90,
    squadCap: 16,
    platformCutFlat: 390,
    winLabel: "Booyah!",
    maps: ["Bermuda", "Purgatory", "Kalahari"],
  },
};

// Single source of truth for map splash art. Add a new map here (and to a
// game's `maps` array above) and it instantly shows up everywhere that reads
// MAP_ART: the lobbies grid AND the admin "Create Tournament" map picker —
// no other file needs to change.
// Files live in /public/images/maps/<file>, so the URL is just "/images/maps/<file>".
export const MAP_ART = {
  Erangel: "/images/maps/erangel.jpg",
  Sanhok: "/images/maps/sanhok.jpg",
  Miramar: "/images/maps/miramar.jpg",
  Bermuda: "/images/maps/bermuda.jpg",
  Purgatory: "/images/maps/purgatory.jpg",
  Kalahari: "/images/maps/kalahari.jpg",
};

// Percentage split applied to whatever the disbursable pool turns out to be.
export const PRIZE_SPLIT = [
  { place: 1, label: "1st Place", percent: 0.5 },
  { place: 2, label: "2nd Place", percent: 0.3 },
  { place: 3, label: "3rd Place", percent: 0.2 },
];

/**
 * Computes the full financial picture for a game config at a given
 * number of squads currently registered (defaults to the full lobby).
 */
export function calculateTournamentEconomics(gameId, squadsRegistered) {
  const game = GAMES[gameId];
  if (!game) throw new Error(`Unknown game id: ${gameId}`);

  const squads = typeof squadsRegistered === "number" ? squadsRegistered : game.squadCap;
  const grossRevenue = squads * game.entryFeePerSquad;
  const platformCut = Math.min(game.platformCutFlat, grossRevenue);
  const disbursablePool = Math.max(grossRevenue - platformCut, 0);

  const prizeBreakdown = PRIZE_SPLIT.map((tier) => ({
    ...tier,
    amount: Math.round(disbursablePool * tier.percent),
  }));

  return {
    game: game.id,
    squadsRegistered: squads,
    squadCap: game.squadCap,
    entryFeePerSquad: game.entryFeePerSquad,
    grossRevenue,
    platformCut,
    disbursablePool,
    prizeBreakdown,
  };
}

/** Convenience helper for full-lobby ("target") figures shown in marketing/admin UI. */
export function getFullLobbyEconomics(gameId) {
  return calculateTournamentEconomics(gameId, GAMES[gameId].squadCap);
}

export function formatINR(amount) {
  return `\u20B9${Number(amount).toLocaleString("en-IN")}`;
}
