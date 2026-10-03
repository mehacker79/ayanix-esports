// ==========================================
// FILE: app/host/page.js — Host Control Panel
// Separate login from admin. Host manages their assigned matches:
//   • Publishes Room ID + Password
//   • Watches live chat & responds
//   • Submits match results
// ==========================================
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LogIn,
  LogOut,
  ShieldCheck,
  Mail,
  Lock,
  Gamepad2,
  CalendarClock,
  Users,
  Eye,
  EyeOff,
  Send,
  AlertTriangle,
  CheckCircle,
  Trophy,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Key,
  ClipboardList,
  Loader2,
  RefreshCw,
} from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status) {
  const map = {
    UPCOMING: "bg-amber-500/15 text-amber-300",
    LIVE: "bg-emerald-500/15 text-emerald-300",
    COMPLETED: "bg-slate-500/15 text-slate-400",
  };
  return map[status] ?? "bg-slate-700 text-slate-300";
}

// ── Root ────────────────────────────────────────────────────────────────────

export default function HostPage() {
  const [host, setHost] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/host/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.loggedIn) setHost(d.host);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={28} />
      </div>
    );
  }

  if (!host) return <HostLogin onSuccess={setHost} />;
  return <HostDashboard host={host} onLogout={() => setHost(null)} />;
}

// ── Login ────────────────────────────────────────────────────────────────────

function HostLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/host/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Invalid credentials."); return; }
      onSuccess(d.host);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-[#131a26] border border-[#1f293d] rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <Gamepad2 size={20} className="text-cyan-400" />
          <h1 className="font-black text-lg text-white">Host Panel</h1>
        </div>
        <p className="text-xs text-slate-400">Sign in with your host credentials to manage your matches.</p>

        <Field Icon={Mail} type="email" placeholder="Host email" value={email} onChange={setEmail} />
        <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 focus-within:border-cyan-400">
          <Lock size={16} className="text-slate-500 shrink-0" />
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-transparent flex-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="text-slate-500 hover:text-slate-300">
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#04121a] font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function HostDashboard({ host, onLogout }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMatch, setActiveMatch] = useState(null); // expanded match id

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/host/matches")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const logout = async () => {
    await fetch("/api/host/logout", { method: "POST" }).catch(() => {});
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white px-4 py-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Gamepad2 size={20} className="text-cyan-400" /> Host Panel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {host.name} · <span className="text-cyan-400">{host.scope}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl border border-[#1f293d] text-slate-400 hover:text-cyan-300 transition-colors">
            <RefreshCw size={15} />
          </button>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* Matches */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-cyan-400" size={28} />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          <CalendarClock size={40} className="mx-auto mb-3 opacity-30" />
          No matches assigned to you yet. Contact your admin.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <MatchCard
              key={m._id}
              match={m}
              isExpanded={activeMatch === m._id}
              onToggle={() => setActiveMatch((prev) => (prev === m._id ? null : m._id))}
              onRefresh={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({ match, isExpanded, onToggle, onRefresh }) {
  const squadsFilled = match.confirmedSquads?.filter((s) => s.paymentStatus === "PAID").length ?? 0;

  return (
    <div className="bg-[#131a26] border border-[#1f293d] rounded-2xl overflow-hidden">
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusBadge(match.status)}`}>
              {match.status}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">#{match.matchCode}</span>
          </div>
          <p className="text-sm font-bold text-white truncate">{match.title}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {match.game} · {match.mapType} · {fmt(match.matchStartAt)}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-300">{squadsFilled} / {match.slotsTotal}</p>
            <p className="text-[10px] text-slate-500">squads</p>
          </div>
          {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      {/* Expanded panels */}
      {isExpanded && (
        <div className="border-t border-[#1f293d] divide-y divide-[#1f293d]">
          <MatchTabs match={match} onRefresh={onRefresh} />
        </div>
      )}
    </div>
  );
}

// ── Match Tabs ────────────────────────────────────────────────────────────────

function MatchTabs({ match, onRefresh }) {
  const [tab, setTab] = useState("publish");
  const tabs = [
    { key: "publish", label: "Publish Room", Icon: Key },
    { key: "squads", label: "Squads", Icon: Users },
    { key: "results", label: "Results", Icon: ClipboardList },
    { key: "chat", label: "Live Chat", Icon: MessageSquare },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-[#1f293d] px-4 pt-3 gap-1">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-t-xl transition-colors ${
              tab === key
                ? "bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "publish" && <PublishTab match={match} onRefresh={onRefresh} />}
        {tab === "squads" && <SquadsTab match={match} />}
        {tab === "results" && <ResultsTab match={match} onRefresh={onRefresh} />}
        {tab === "chat" && <ChatTab match={match} isHost />}
      </div>
    </div>
  );
}

// ── Publish Room Tab ──────────────────────────────────────────────────────────

function PublishTab({ match, onRefresh }) {
  const [roomId, setRoomId] = useState(match.roomId || "");
  const [roomPw, setRoomPw] = useState(match.roomPassword || "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handlePublish = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!roomId.trim() || !roomPw.trim()) {
      setFeedback({ type: "error", text: "Room ID and Password are required." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/host/match/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: match._id, roomId, roomPassword: roomPw }),
      });
      const d = await res.json();
      if (!res.ok) { setFeedback({ type: "error", text: d.error }); return; }
      setFeedback({ type: "ok", text: d.message });
      onRefresh();
    } catch {
      setFeedback({ type: "error", text: "Server error." });
    } finally {
      setBusy(false);
    }
  };

  const isPublished = !!match.credentialsPublishedAt;
  // Time until reveal: matchStartAt - 10 min
  const revealAt = match.matchStartAt
    ? new Date(new Date(match.matchStartAt).getTime() - 10 * 60 * 1000)
    : null;

  return (
    <form onSubmit={handlePublish} className="space-y-3">
      {isPublished && (
        <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs text-emerald-300">
          <CheckCircle size={14} className="mt-0.5 shrink-0" />
          <span>
            Published at {fmt(match.credentialsPublishedAt)}.
            Players will see credentials at{" "}
            <strong>{revealAt ? fmt(revealAt) : "10 min before start"}</strong>.
          </span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Game Room ID</label>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="e.g. 1234567"
            className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Room Password</label>
          <input
            value={roomPw}
            onChange={(e) => setRoomPw(e.target.value)}
            placeholder="e.g. ayanix123"
            className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      <div className="bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-xs text-slate-400">
        <span className="font-semibold text-cyan-300">Internal Match Code:</span>{" "}
        <span className="font-mono font-black text-white">{match.matchCode}</span>
        <span className="ml-2 text-slate-600">— visible to all registered players.</span>
      </div>

      {feedback && (
        <p className={`text-xs ${feedback.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
          {feedback.text}
        </p>
      )}

      {match.status !== "COMPLETED" && (
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#04121a] font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {busy ? "Publishing…" : isPublished ? "Update & Re-Publish" : "Publish Room Credentials"}
        </button>
      )}
    </form>
  );
}

// ── Squads Tab ────────────────────────────────────────────────────────────────

function SquadsTab({ match }) {
  const paid = match.confirmedSquads?.filter((s) => s.paymentStatus === "PAID") ?? [];

  if (paid.length === 0) {
    return <p className="text-xs text-slate-500 text-center py-4">No registered squads yet.</p>;
  }

  return (
    <div className="space-y-2">
      {paid.map((sq, i) => (
        <div key={sq._id || i} className="bg-[#0b0f19] border border-[#1f293d] rounded-xl p-3">
          <p className="text-xs font-bold text-white mb-1">
            #{i + 1} {sq.squadName}
          </p>
          <div className="grid grid-cols-2 gap-1">
            {sq.members?.map((m, j) => (
              <p key={j} className="text-[11px] text-slate-400">
                {m.ign} <span className="text-slate-600">· {m.charId}</span>
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Results Tab ───────────────────────────────────────────────────────────────

function ResultsTab({ match, onRefresh }) {
  const paid = match.confirmedSquads?.filter((s) => s.paymentStatus === "PAID") ?? [];
  const [rows, setRows] = useState(
    () =>
      match.results?.length
        ? match.results.map((r) => ({ squadName: r.squadName, rank: r.rank, kills: r.kills, points: r.points }))
        : paid.map((sq, i) => ({ squadName: sq.squadName, rank: i + 1, kills: 0, points: 0 }))
  );
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const updateRow = (i, field, val) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setBusy(true);
    try {
      const res = await fetch("/api/host/match/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: match._id,
          results: rows.map((r) => ({
            ...r,
            rank: Number(r.rank),
            kills: Number(r.kills),
            points: Number(r.points),
          })),
        }),
      });
      const d = await res.json();
      if (!res.ok) { setFeedback({ type: "error", text: d.error }); return; }
      setFeedback({ type: "ok", text: d.message });
      onRefresh();
    } catch {
      setFeedback({ type: "error", text: "Server error." });
    } finally {
      setBusy(false);
    }
  };

  if (match.status === "COMPLETED" && match.results?.length) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={14} className="text-emerald-400" />
          <p className="text-xs text-emerald-300 font-semibold">Results submitted · {fmt(match.resultsSubmittedAt)}</p>
        </div>
        <div className="space-y-1.5">
          {[...match.results].sort((a, b) => a.rank - b.rank).map((r, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2 text-xs">
              <span className={`font-black w-5 text-center ${r.rank === 1 ? "text-amber-300" : r.rank === 2 ? "text-slate-300" : r.rank === 3 ? "text-amber-600" : "text-slate-500"}`}>
                #{r.rank}
              </span>
              <span className="flex-1 font-semibold text-white">{r.squadName}</span>
              <span className="text-slate-500">{r.kills}K · {r.points}pts</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (paid.length === 0) {
    return <p className="text-xs text-slate-500 text-center py-4">No registered squads to submit results for.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-[11px] text-slate-400">Fill in rank, kills, and points for each squad after the match ends.</p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 items-center">
            <p className="text-xs font-semibold text-white truncate">{row.squadName}</p>
            <input
              type="number" min={1} value={row.rank}
              onChange={(e) => updateRow(i, "rank", e.target.value)}
              placeholder="Rank"
              className="bg-[#0b0f19] border border-[#1f293d] rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-cyan-400"
            />
            <input
              type="number" min={0} value={row.kills}
              onChange={(e) => updateRow(i, "kills", e.target.value)}
              placeholder="Kills"
              className="bg-[#0b0f19] border border-[#1f293d] rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-cyan-400"
            />
            <input
              type="number" min={0} value={row.points}
              onChange={(e) => updateRow(i, "points", e.target.value)}
              placeholder="Pts"
              className="bg-[#0b0f19] border border-[#1f293d] rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        ))}
        <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 text-[10px] text-slate-600 px-0 -mt-1">
          <span></span><span className="text-center">Rank</span><span className="text-center">Kills</span><span className="text-center">Pts</span>
        </div>
      </div>

      {feedback && (
        <p className={`text-xs ${feedback.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
          {feedback.text}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#04121a] font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Submit Final Results"}
      </button>
    </form>
  );
}

// ── Chat Tab (shared by Host & Player, isHost flag controls which API) ────────

export function ChatTab({ match, isHost }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isCheatReport, setIsCheatReport] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    const url = isHost
      ? `/api/host/match/chat?tournamentId=${match._id}`
      : `/api/match/chat?tournamentId=${match._id}`;
    try {
      const res = await fetch(url);
      const d = await res.json();
      if (d.messages) setMessages(d.messages);
    } catch {}
  }, [match._id, isHost]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000); // poll every 5s
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      const url = isHost ? "/api/host/match/chat" : "/api/match/chat";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: match._id, text: text.trim(), isCheatReport }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Failed to send."); return; }
      setText("");
      setIsCheatReport(false);
      fetchMessages();
    } catch {
      setError("Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Message list */}
      <div className="h-56 overflow-y-auto bg-[#0b0f19] border border-[#1f293d] rounded-xl p-3 space-y-2 scroll-smooth">
        {messages.length === 0 && (
          <p className="text-xs text-slate-600 text-center mt-8">No messages yet. Chat starts when the match goes live.</p>
        )}
        {messages.map((msg) => {
          const isMe = isHost ? msg.senderRole === "host" : msg.senderRole === "player";
          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                  msg.isCheatReport
                    ? "bg-red-500/20 border border-red-500/40 text-red-200"
                    : msg.senderRole === "host"
                    ? "bg-cyan-500/15 text-cyan-100"
                    : "bg-[#1f293d] text-slate-200"
                }`}
              >
                {msg.isCheatReport && (
                  <div className="flex items-center gap-1 text-red-400 font-bold mb-1 text-[10px]">
                    <AlertTriangle size={11} /> CHEAT REPORT
                  </div>
                )}
                <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.senderLabel}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Report cheat checkbox (player only) */}
      {!isHost && (
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isCheatReport}
            onChange={(e) => setIsCheatReport(e.target.checked)}
            className="accent-red-500 rounded"
          />
          <AlertTriangle size={12} className="text-red-400" />
          Flag as cheat/hack report
        </label>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Input */}
      <form onSubmit={send} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isHost ? "Reply to players…" : "Message the host…"}
          maxLength={500}
          className="flex-1 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#04121a] p-2.5 rounded-xl transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

// ── Shared field ──────────────────────────────────────────────────────────────

function Field({ Icon, ...props }) {
  return (
    <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 focus-within:border-cyan-400">
      <Icon size={16} className="text-slate-500 shrink-0" />
      <input
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
        className="bg-transparent flex-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
      />
    </div>
  );
}
