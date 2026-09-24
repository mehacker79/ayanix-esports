// ==========================================
// FILE: app/components/LobbiesView.js — Tournament match card grid
// ==========================================
"use client";

import React, { useState, useMemo } from "react";
import { MapPin, Clock, Users2 } from "lucide-react";
import { GAMES, MAP_ART, calculateTournamentEconomics, formatINR } from "@/lib/tournamentConfig";

// In production these lobby lists come from the Tournament model / API route.
// The shape mirrors lib/models/Tournament.js so swapping in a real fetch is a 1-line change.
const MOCK_LOBBIES = {
  BGMI: [
    { id: "bgmi-1", map: "Erangel", startsAt: "Today, 8:30 PM", squadsFilled: 12 },
    { id: "bgmi-2", map: "Sanhok", startsAt: "Tomorrow, 6:00 PM", squadsFilled: 5 },
    { id: "bgmi-3", map: "Miramar", startsAt: "Fri, 9:00 PM", squadsFilled: 16 },
  ],
  FREEFIRE: [
    { id: "ff-1", map: "Bermuda", startsAt: "Today, 7:00 PM", squadsFilled: 9 },
    { id: "ff-2", map: "Purgatory", startsAt: "Tomorrow, 8:00 PM", squadsFilled: 3 },
  ],
};

export default function LobbiesView({ isLoggedIn, onRequireAuth, onOpenLobbyDetail }) {
  const [activeGame, setActiveGame] = useState("BGMI");
  const game = GAMES[activeGame];
  const lobbies = MOCK_LOBBIES[activeGame];

  const handleJoin = (lobbyId) => {
    if (!isLoggedIn) {
      onRequireAuth?.("lobbies");
      return;
    }
    const lobby = lobbies.find((item) => item.id === lobbyId);
    if (lobby) onOpenLobbyDetail?.({ ...lobby, game });
  };

  return (
    <div className="game-shell w-full max-w-md md:max-w-5xl mx-auto px-3.5 pt-5 pb-28 text-white">
      <div className="ambient-orb left-10 top-10 h-20 w-20 bg-cyan-400/15" />
      <div className="ambient-orb right-8 top-20 h-24 w-24 bg-violet-500/10" />

      <div className="relative z-10 mb-4">
        <h1 className="text-xl font-black tracking-tight">Tournament Lobbies</h1>
        <p className="mt-1 text-xs text-slate-400">Pick your battlefield and lock in your squad.</p>
      </div>

      <div className="relative z-10 mb-5 flex rounded-2xl border border-white/10 bg-[#121b2a]/80 p-1.5 shadow-[0_12px_28px_rgba(2,6,23,0.32)]">
        {Object.values(GAMES).map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeGame === g.id
                ? "bg-cyan-500/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.2)]"
                : "text-slate-500 hover:text-slate-200"
            }`}
          >
            {g.id === "BGMI" ? "BGMI" : "Free Fire"}
          </button>
        ))}
      </div>

      <div className="relative z-10 space-y-3.5">
        {lobbies.map((lobby) => (
          <LobbyCard
            key={lobby.id}
            game={game}
            lobby={lobby}
            onOpenDetail={() => onOpenLobbyDetail?.({ ...lobby, game })}
            onJoin={() => handleJoin(lobby.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LobbyCard({ game, lobby, onOpenDetail, onJoin }) {
  const econ = calculateTournamentEconomics(game.id, lobby.squadsFilled);
  const fullEcon = calculateTournamentEconomics(game.id, game.squadCap);
  const pctFilled = Math.min(100, Math.round((lobby.squadsFilled / game.squadCap) * 100));
  const isFull = lobby.squadsFilled >= game.squadCap;

  return (
    <div className="game-card-hover glass-panel overflow-hidden rounded-[26px]">
      <button onClick={onOpenDetail} className="block w-full text-left">
        <div
          className="relative h-32 overflow-hidden bg-cover bg-center px-4 py-4"
          style={{ backgroundImage: `url(${MAP_ART[lobby.map]})` }}
        >
          <div className="absolute inset-0 bg-[#07101c]/65" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_32%)]" />
          <div className="relative flex h-full items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">{game.label}</p>
              <h3 className="mt-2 flex items-center gap-1.5 text-lg font-black text-white">
                <MapPin size={14} className="text-slate-400" /> {lobby.map}
              </h3>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-[#09131f]/80 px-2.5 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Prize</p>
              <p className="text-base font-black text-cyan-300">{formatINR(fullEcon.disbursablePool)}</p>
            </div>
          </div>
        </div>
      </button>

      <div className="space-y-3.5 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {lobby.startsAt}
          </span>
          <span className="font-semibold text-slate-200">{formatINR(game.entryFeePerSquad)} / Squad</span>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users2 size={12} /> {lobby.squadsFilled}/{game.squadCap} Squads Registered
            </span>
            <span>{pctFilled}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#0b0f19]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
              style={{ width: `${pctFilled}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Estimated winnings</p>
            <p className="text-sm font-bold text-emerald-300">{formatINR(econ.disbursablePool)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
            disabled={isFull}
            className={`min-w-[132px] rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              isFull
                ? "cursor-not-allowed border border-white/10 bg-[#1a2435] text-slate-500"
                : "cinematic-button bg-cyan-500 text-[#04121a] hover:bg-cyan-400"
            }`}
          >
            {isFull ? "Lobby Full" : "Join Squad"}
          </button>
        </div>
      </div>
    </div>
  );
}
