// ==========================================
// FILE: app/admin/page.js — Protected Admin & Host Control Panel
// ==========================================
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Lock, Mail, ShieldCheck, IndianRupee, Users, LogOut, MapPin, Trophy,
  CalendarClock, UserPlus, Ban, CheckCircle, Gamepad2, Link2, RefreshCw,
  ChevronDown, ChevronUp, Loader2, Eye, EyeOff,
} from "lucide-react";
import { GAMES, MAP_ART, getFullLobbyEconomics, calculateTournamentEconomics, formatINR } from "@/lib/tournamentConfig";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // No client-side credential storage — we just ask the server if a
    // session cookie is already valid (kept simple for the demo; wire this
    // to a real /api/admin/session check backed by the httpOnly cookie).
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400 text-sm">
        Checking session...
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onSuccess={setSession} />;
  }

  return <AdminDashboard session={session} onLogout={() => setSession(null)} />;
}

function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        return;
      }
      onSuccess(data.session);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#131a26] border border-[#1f293d] rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={20} className="text-cyan-400" />
          <h1 className="font-black text-lg text-white">Admin Panel</h1>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Super admin and sub-host access only. Credentials are verified server-side.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 focus-within:border-cyan-400">
            <Mail size={16} className="text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-transparent flex-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 focus-within:border-cyan-400">
            <Lock size={16} className="text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-transparent flex-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-5 bg-cyan-500 hover:bg-cyan-400 text-[#04121a] font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {submitting ? "Verifying..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

function AdminDashboard({ session, onLogout }) {
  const bgmiEcon = getFullLobbyEconomics("BGMI");
  const ffEcon = getFullLobbyEconomics("FREEFIRE");
  const totalPlatformCut = bgmiEcon.platformCut + ffEcon.platformCut;

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white px-4 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <ShieldCheck size={20} className="text-cyan-400" /> Control Panel
          </h1>
          <p className="text-xs text-slate-500">
            Signed in as {session.role === "SUPER_ADMIN" ? "Super Admin" : `Host (${session.scope})`}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>

      {/* Financial dashboard */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-1.5">
          <IndianRupee size={15} className="text-cyan-400" /> Platform Financial Dashboard
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <StatCard label="BGMI Platform Cut (full lobby)" value={formatINR(bgmiEcon.platformCut)} />
          <StatCard label="Free Fire Platform Cut (full lobby)" value={formatINR(ffEcon.platformCut)} />
          <StatCard label="Combined Platform Revenue" value={formatINR(totalPlatformCut)} highlight />
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {Object.values(GAMES).map((game) => {
            const econ = getFullLobbyEconomics(game.id);
            return (
              <div key={game.id} className="bg-[#131a26] border border-[#1f293d] rounded-xl p-4">
                <p className="text-xs font-bold text-cyan-400 mb-2">{game.label} — Full Lobby Split</p>
                <div className="space-y-1 text-xs text-slate-300">
                  <Row label="Gross Revenue" value={formatINR(econ.grossRevenue)} />
                  <Row label="Platform Cut" value={formatINR(econ.platformCut)} />
                  <Row label="Disbursable Pool" value={formatINR(econ.disbursablePool)} />
                  {econ.prizeBreakdown.map((tier) => (
                    <Row key={tier.place} label={tier.label} value={formatINR(tier.amount)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Host a new tournament lobby */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-1.5">
          <Trophy size={15} className="text-cyan-400" /> Host Tournament
        </h2>
        <CreateTournamentForm session={session} />
      </section>

      {/* Host Management (Super Admin only) */}
      {session.role === "SUPER_ADMIN" && (
        <>
          <section className="mb-8">
            <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-1.5">
              <Gamepad2 size={15} className="text-cyan-400" /> Host Management
            </h2>
            <HostManagementPanel />
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-1.5">
              <Link2 size={15} className="text-cyan-400" /> Assign Host to Tournament
            </h2>
            <AssignHostPanel />
          </section>
        </>
      )}
    </div>
  );
}


function CreateTournamentForm({ session }) {
  // A sub-host only ever hosts inside their own scope; a super admin can pick either.
  const allowedGames =
    session.role === "SUB_HOST" ? [GAMES[session.scope]] : Object.values(GAMES);

  const [game, setGame] = useState(allowedGames[0].id);
  const gameConfig = GAMES[game];

  const [map, setMap] = useState(gameConfig.maps[0]);
  const [title, setTitle] = useState(`${gameConfig.label} Squad Showdown`);
  const [matchStartAt, setMatchStartAt] = useState("");
  const [slotsTotal, setSlotsTotal] = useState(gameConfig.squadCap);
  const [entryFee, setEntryFee] = useState(gameConfig.entryFeePerSquad);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "ok" | "error", text }

  // Whenever the game changes, snap the map (and defaults) back to that
  // game's own list — a BGMI host should never be able to submit "Bermuda".
  const handleGameChange = (nextGameId) => {
    const next = GAMES[nextGameId];
    setGame(nextGameId);
    setMap(next.maps[0]);
    setSlotsTotal(next.squadCap);
    setEntryFee(next.entryFeePerSquad);
    setTitle(`${next.label} Squad Showdown`);
  };

  const previewEconomics = calculateTournamentEconomics(game, Number(slotsTotal) || gameConfig.squadCap);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/tournament/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, map, title, matchStartAt, slotsTotal, entryFee }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Could not create the tournament." });
        return;
      }
      setFeedback({ type: "ok", text: `${map} lobby is live — "${title}".` });
    } catch {
      setFeedback({ type: "error", text: "Could not reach the server. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] bg-[#131a26] border border-[#1f293d] rounded-2xl p-4"
    >
      <div className="space-y-3">
        {/* Game */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Game</label>
          <div className="flex rounded-xl border border-[#1f293d] bg-[#0b0f19] p-1">
            {allowedGames.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGameChange(g.id)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                  game === g.id ? "bg-cyan-500/15 text-cyan-300" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map — this is the option that appears the moment a host is creating a tournament */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <MapPin size={12} className="text-cyan-400" /> Map
          </label>
          <select
            value={map}
            onChange={(e) => setMap(e.target.value)}
            className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
          >
            {gameConfig.maps.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Lobby Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <CalendarClock size={12} className="text-cyan-400" /> Match Start
            </label>
            <input
              type="datetime-local"
              value={matchStartAt}
              onChange={(e) => setMatchStartAt(e.target.value)}
              required
              className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Squad Slots</label>
            <input
              type="number"
              min={1}
              value={slotsTotal}
              onChange={(e) => setSlotsTotal(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Entry Fee / Squad</label>
          <input
            type="number"
            min={0}
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center justify-between bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-xs">
          <span className="text-slate-400">Prize pool (auto)</span>
          <span className="font-bold text-emerald-300">{formatINR(previewEconomics.disbursablePool)}</span>
        </div>

        {feedback && (
          <p className={`text-xs ${feedback.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#04121a] font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {submitting ? "Hosting..." : "Host Tournament"}
        </button>
      </div>

      {/* Map art preview — updates the instant a map is selected above */}
      <div className="relative overflow-hidden rounded-xl border border-[#1f293d] min-h-[220px] bg-[#0b0f19]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300"
          style={{ backgroundImage: `url(${MAP_ART[map]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04070d]/90 via-[#04070d]/20 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">{gameConfig.label}</p>
          <h3 className="mt-1 flex items-center gap-1.5 text-xl font-black text-white">
            <MapPin size={16} className="text-slate-300" /> {map}
          </h3>
          <p className="mt-1 text-[11px] text-slate-300">
            {slotsTotal || gameConfig.squadCap} squads · {formatINR(entryFee || gameConfig.entryFeePerSquad)} / squad
          </p>
        </div>
      </div>
    </form>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        highlight ? "bg-cyan-500/10 border-cyan-500/40" : "bg-[#131a26] border-[#1f293d]"
      }`}
    >
      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
      <p className={`text-lg font-black ${highlight ? "text-cyan-300" : "text-white"}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

// ============================================================
// HOST MANAGEMENT PANEL — Create & manage host accounts
// ============================================================
function HostManagementPanel() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", scope: "BGMI", commissionPct: 5 });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadHosts = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/hosts")
      .then((r) => r.json())
      .then((d) => setHosts(d.hosts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadHosts(); }, [loadHosts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/host/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { setFeedback({ type: "error", text: d.error }); return; }
      setFeedback({ type: "ok", text: `Host "${d.host.name}" created successfully.` });
      setForm({ name: "", email: "", password: "", scope: "BGMI", commissionPct: 5 });
      setShowCreate(false);
      loadHosts();
    } catch {
      setFeedback({ type: "error", text: "Server error." });
    } finally {
      setBusy(false);
    }
  };

  const toggleHost = async (hostId, isActive) => {
    const res = await fetch("/api/admin/host/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostId, isActive }),
    });
    const d = await res.json();
    if (res.ok) loadHosts();
    else alert(d.error);
  };

  return (
    <div className="space-y-4">
      {/* Create form toggle */}
      <button
        onClick={() => { setShowCreate((v) => !v); setFeedback(null); }}
        className="flex items-center gap-2 text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-2 rounded-xl transition-colors"
      >
        <UserPlus size={14} />
        {showCreate ? "Cancel" : "Create New Host Account"}
      </button>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-[#131a26] border border-[#1f293d] rounded-2xl p-4 space-y-3"
        >
          <p className="text-xs font-bold text-slate-300 mb-1">New Host Details</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <AdminField label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Rahul Sharma" />
            <AdminField label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="host@ayanix.com" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Password (min 8 chars)</label>
              <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 focus-within:border-cyan-400">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Secure password"
                  className="bg-transparent flex-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Game Scope</label>
              <div className="flex rounded-xl border border-[#1f293d] bg-[#0b0f19] p-1">
                {["BGMI", "FREEFIRE"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, scope: g }))}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                      form.scope === g ? "bg-cyan-500/15 text-cyan-300" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {g === "FREEFIRE" ? "Free Fire" : g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Commission % (per match, from platform cut)</label>
            <input
              type="number" min={0} max={100} value={form.commissionPct}
              onChange={(e) => setForm((f) => ({ ...f, commissionPct: Number(e.target.value) }))}
              className="w-32 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          {feedback && (
            <p className={`text-xs ${feedback.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>{feedback.text}</p>
          )}
          <button
            type="submit" disabled={busy}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#04121a] font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create Host Account"}
          </button>
        </form>
      )}

      {feedback && !showCreate && (
        <p className={`text-xs ${feedback.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>{feedback.text}</p>
      )}

      {/* Host list */}
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-cyan-400" size={24} /></div>
      ) : hosts.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">No hosts created yet. Use the button above to add one.</p>
      ) : (
        <div className="space-y-2">
          {hosts.map((h) => (
            <div
              key={h._id}
              className={`flex items-center justify-between bg-[#131a26] border rounded-xl px-4 py-3 ${h.isActive ? "border-[#1f293d]" : "border-red-500/20 opacity-70"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{h.name}</p>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${h.scope === "BGMI" ? "bg-amber-500/15 text-amber-300" : "bg-orange-500/15 text-orange-300"}`}>
                    {h.scope}
                  </span>
                  {!h.isActive && (
                    <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full">BANNED</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{h.email} · {h.commissionPct}% commission</p>
              </div>
              <button
                onClick={() => toggleHost(h._id, !h.isActive)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ml-4 shrink-0 ${
                  h.isActive
                    ? "text-red-400 hover:bg-red-500/10 border border-red-500/20"
                    : "text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
                }`}
              >
                {h.isActive ? <><Ban size={12} /> Ban</> : <><CheckCircle size={12} /> Activate</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ASSIGN HOST PANEL — Link a host to a tournament
// ============================================================
function AssignHostPanel() {
  const [hosts, setHosts] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedHost, setSelectedHost] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Load active hosts
    fetch("/api/admin/hosts")
      .then((r) => r.json())
      .then((d) => setHosts((d.hosts || []).filter((h) => h.isActive)))
      .catch(() => {});
    // Load upcoming/live tournaments from admin API
    fetch("/api/admin/tournaments")
      .then((r) => r.json())
      .then((d) => setTournaments(d.tournaments || []))
      .catch(() => {});
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!selectedTournament || !selectedHost) {
      setFeedback({ type: "error", text: "Select both a tournament and a host." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tournament/assign-host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: selectedTournament, hostId: selectedHost }),
      });
      const d = await res.json();
      if (!res.ok) { setFeedback({ type: "error", text: d.error }); return; }
      setFeedback({ type: "ok", text: d.message });
      setSelectedTournament("");
      setSelectedHost("");
    } catch {
      setFeedback({ type: "error", text: "Server error." });
    } finally {
      setBusy(false);
    }
  };

  const selectClass = "w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400";

  return (
    <form onSubmit={handleAssign} className="bg-[#131a26] border border-[#1f293d] rounded-2xl p-4 space-y-3">
      <p className="text-xs text-slate-400">Assign a host account to manage a specific match. The host's scope must match the tournament's game.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Tournament</label>
          <select value={selectedTournament} onChange={(e) => setSelectedTournament(e.target.value)} className={selectClass}>
            <option value="">— Select tournament —</option>
            {tournaments
              .filter((t) => t.status !== "COMPLETED")
              .map((t) => (
                <option key={t._id} value={t._id}>
                  [{t.game}] {t.title} · {t.matchCode || ""}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Host</label>
          <select value={selectedHost} onChange={(e) => setSelectedHost(e.target.value)} className={selectClass}>
            <option value="">— Select host —</option>
            {hosts.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.scope})
              </option>
            ))}
          </select>
        </div>
      </div>
      {feedback && (
        <p className={`text-xs ${feedback.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>{feedback.text}</p>
      )}
      <button
        type="submit" disabled={busy}
        className="bg-cyan-500 hover:bg-cyan-400 text-[#04121a] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
      >
        {busy ? "Assigning…" : "Assign Host"}
      </button>
    </form>
  );
}

// ── Shared admin input field ─────────────────────────────────────────────────
function AdminField({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        {...props}
      />
    </div>
  );
}
