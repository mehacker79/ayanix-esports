// ==========================================
// FILE: app/components/TeamsView.js — Clan roster registry
// ==========================================
"use client";

import React, { useState } from "react";
import { UserPlus, Crown, Shield } from "lucide-react";

const MOCK_ROSTER = [
  { id: 1, ign: "ShadowStrike", role: "Captain", charId: "5123098417" },
  { id: 2, ign: "GhostPeek", role: "Assaulter", charId: "5123098418" },
  { id: 3, ign: "ViperX", role: "Support", charId: "5123098419" },
  { id: 4, ign: "NullSix", role: "Sniper", charId: "5123098420" },
];

export default function TeamsView({ isLoggedIn, onRequireAuth }) {
  const [roster, setRoster] = useState(MOCK_ROSTER);
  const [teamName, setTeamName] = useState("Team Nemesis");
  const [draft, setDraft] = useState("");

  const handleInvite = () => {
    if (!isLoggedIn) {
      onRequireAuth?.("teams");
      return;
    }
    if (!draft.trim()) {
      setDraft("GhostNova");
      return;
    }
    const newMember = {
      id: Date.now(),
      ign: draft.trim(),
      role: "Support",
      charId: `5123098${Math.floor(Math.random() * 1000)}`,
    };
    setRoster((prev) => [newMember, ...prev]);
    setDraft("");
  };

  return (
    <div className="w-full max-w-md md:max-w-5xl mx-auto px-3.5 pt-5 pb-28 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black">My Team Line-up</h1>
          <p className="text-xs text-slate-400">Manage your roster and positioning.</p>
        </div>
        <button
          onClick={handleInvite}
          className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-[#04121a] text-xs font-bold px-3 py-2 rounded-xl transition-colors"
        >
          <UserPlus size={14} /> Invite
        </button>
      </div>

      <div className="bg-[#131a26] border border-[#1f293d] rounded-2xl p-4 mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center">
          <Shield size={22} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full bg-transparent text-lg font-black text-white outline-none"
          />
          <p className="text-xs text-slate-400">{roster.length}/5 players · Squad ready</p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-[#1f293d] bg-[#121b2a] p-3">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">Invite teammate</p>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Enter IGN"
            className="flex-1 rounded-xl border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleInvite}
            className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-[#04121a]"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {roster.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-[#131a26] border border-[#1f293d] rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0b0f19] border border-[#1f293d] flex items-center justify-center text-xs font-bold text-cyan-400">
                {player.ign.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold flex items-center gap-1">
                  {player.ign}
                  {player.role === "Captain" && <Crown size={12} className="text-yellow-400" />}
                </p>
                <p className="text-[11px] text-slate-500">ID: {player.charId}</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">{player.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
