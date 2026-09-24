// ==========================================
// FILE: app/components/HomeView.js — Dynamic welcome feed
// ==========================================
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Radio, Swords, BarChart3, Shield, Wallet, Bell, ShieldCheck, Zap, Headset } from "lucide-react";
import { GAMES, formatINR } from "@/lib/tournamentConfig";

const QUICK_ACTIONS = [
  { key: "scrims", label: "Fast Scrims", Icon: Swords, tone: "blue" },
  { key: "leaderboard", label: "Leaderboards", Icon: BarChart3, tone: "fire" },
  { key: "clan", label: "Clan Central", Icon: Shield, tone: "blue" },
  { key: "wallet", label: "My Wallet", Icon: Wallet, tone: "fire" },
];

// Teeno posters ek hi slideshow mein
const POSTER_SLIDES = [
  { src: "/images/dual-battle-poster.png", alt: "BGMI x Free Fire Dual Battle Tournament" },
  { src: "/images/bgmi-poster.png", alt: "BGMI Solo Tournament" },
  { src: "/images/freefire-poster.png", alt: "Free Fire Solo Tournament" },
];

// Alag se "Choose Your Battlefield" section ke liye
const GAME_POSTERS = {
  BGMI: "/images/bgmi-poster.png",
  FREEFIRE: "/images/freefire-poster.png",
};

const TRUST_BADGES = [
  { Icon: ShieldCheck, label: "Secure Razorpay Payments", tone: "blue", href: "/terms" },
  { Icon: Zap, label: "Fast Squad Registration", tone: "fire", action: "lobbies" },
  { Icon: Headset, label: "Direct Support", tone: "blue", href: "https://wa.me/919970889890?text=Hi%20Ayanix%20Esports%2C%20I%20need%20help%20with", external: true },
];

const TONE = {
  blue: { icon: "text-cyan-300", ring: "border-cyan-400/20 bg-cyan-500/10" },
  fire: { icon: "text-orange-300", ring: "border-orange-400/20 bg-orange-500/10" },
};

export default function HomeView({ profile, onRequireAuth, onNavigate, onOpenUtility }) {
  const [liveStats, setLiveStats] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [posterIndex, setPosterIndex] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    fetch("/api/tournament/live-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLiveStats(data.tournaments);
      })
      .catch(() => {});
  }, []);

  const heroSlides = useMemo(() => {
    return Object.values(GAMES).map((game) => {
      const live = liveStats?.find((t) => t.game === game.id);
      return {
        game,
        entryFee: live?.entryFee ?? game.entryFeePerSquad,
        prizePool: live?.prizePool ?? null,
        slotsFilled: live?.slotsFilled ?? 0,
        slotsTotal: live?.slotsTotal ?? game.squadCap,
        isLive: live?.live ?? false,
      };
    });
  }, [liveStats]);

  useEffect(() => {
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  useEffect(() => {
    const t = setInterval(() => {
      setPosterIndex((i) => (i + 1) % POSTER_SLIDES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const activeSlide = heroSlides[slideIndex];
  const displayName = profile?.username && profile.username !== "Warrior" ? profile.username : "Warrior";

  const tickerMessages = heroSlides.map((s) =>
    s.isLive
      ? `⚡ ${s.game.label} ${s.game.maps[0]} lobby closing soon — ${s.slotsFilled}/${s.slotsTotal} squads registered`
      : `⚡ ${s.game.label} tournament opening soon — register your squad early`
  );

  return (
    <div className="game-shell w-full max-w-md sm:max-w-2xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-2 pb-28 text-white">
      <div className="ambient-orb left-8 top-12 h-28 w-28 bg-cyan-400/25 animate-float-slow" />
      <div className="ambient-orb right-8 top-36 h-24 w-24 bg-orange-400/25 animate-float-slow [animation-delay:1.3s]" />

            {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Welcome back,</p>
          <h1 className="font-display mt-1 text-2xl font-bold tracking-tight">{displayName}</h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowAlerts((v) => !v)}
            className="relative h-11 w-11 rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition hover:border-orange-400/50 hover:text-orange-300"
          >
            <Bell size={18} className="mx-auto text-slate-300" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(255,122,26,0.9)]" />
          </button>
          {showAlerts && (
            <React.Fragment>
              <button aria-label="Close alerts" onClick={() => setShowAlerts(false)} className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-[2px]" />
              <div className="absolute right-0 top-14 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#0d1420] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-300">Alerts</p>
                <div className="space-y-2">
                  {heroSlides.map((s) => (
                    <p key={s.game.id} className="text-xs text-slate-300">
                      {s.game.label}: {s.slotsFilled}/{s.slotsTotal} squads {s.isLive ? "registered" : "· opening soon"}
                    </p>
                  ))}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Live ticker */}
      <div className="relative z-10 mb-4 overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 via-transparent to-orange-500/10 py-2 shadow-[inset_0_0_30px_rgba(34,211,238,0.08)]">
        <div className="whitespace-nowrap animate-ticker flex gap-10 text-[11px] font-semibold text-cyan-200">
          {[...tickerMessages, ...tickerMessages].map((msg, i) => (
            <span key={i}>{msg}</span>
          ))}
        </div>
      </div>

      {/* Poster slideshow — full width, top-aligned crop so headline never cuts */}
      <button
        onClick={() => onNavigate?.("lobbies")}
        className="relative z-10 mb-5 block w-full overflow-hidden rounded-[24px] border border-white/10 shadow-[0_15px_40px_rgba(8,15,25,0.5)] aspect-[1.9/1] sm:aspect-[2.3/1] lg:aspect-[2.8/1]"
      >
        {POSTER_SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
              i === posterIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {POSTER_SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === posterIndex ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </button>

      {/* Featured match — full width duotone gradient panel */}
      <div className="relative z-10 mb-5 overflow-hidden rounded-[28px] border border-white/10 p-5 lg:p-8 bg-[#0a0f1a]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-transparent to-orange-500/25" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
                <Radio size={10} /> {activeSlide.isLive ? "Live" : "Soon"}
              </span>
              <span className="text-[11px] text-slate-300">{activeSlide.game.fullName}</span>
            </div>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Featured match</p>
              <h2 className="font-display mt-1 text-2xl lg:text-3xl font-bold tracking-tight text-white">
                {activeSlide.game.maps[0]} Showdown
              </h2>
            </div>
            <div className="rounded-xl border border-cyan-400/30 bg-[#0b1220]/70 px-2.5 py-1.5 text-right self-start sm:self-auto">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Entry</p>
              <p className="text-sm font-bold text-cyan-300">{formatINR(activeSlide.entryFee)}</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="rounded-2xl border border-cyan-400/20 bg-[#0d1420]/90 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Prize Pool</p>
              <p className="font-display mt-1 text-lg font-bold text-cyan-300">
                {activeSlide.prizePool ? formatINR(activeSlide.prizePool) : "TBA"}
              </p>
            </div>
            <div className="rounded-2xl border border-orange-400/20 bg-[#0d1420]/90 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Squad Fill</p>
              <p className="font-display mt-1 text-lg font-bold text-orange-300">
                {activeSlide.slotsFilled} / {activeSlide.slotsTotal}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500">Status</p>
              <p className="text-sm font-semibold text-slate-200">
                {activeSlide.isLive ? "Registrations open" : "Opening soon"}
              </p>
            </div>
            <button
              onClick={() => onNavigate?.("lobbies")}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-orange-400 px-5 py-2.5 text-sm font-bold text-[#0a0f1a] shadow-[0_10px_25px_rgba(255,122,26,0.25)] transition hover:brightness-110"
            >
              Join Now
            </button>
          </div>

          <div className="mt-5 flex gap-1.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === slideIndex ? "w-7 bg-gradient-to-r from-cyan-400 to-orange-400" : "w-2 bg-white/15"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Choose your battlefield — dono posters alag alag, side by side */}
      <p className="relative z-10 mb-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Choose Your Battlefield
      </p>
      <div className="relative z-10 mb-5 grid grid-cols-2 gap-2.5 lg:gap-4">
        {Object.values(GAMES).map((game) => (
          <button
            key={game.id}
            onClick={() => onNavigate?.("lobbies")}
            className="game-card-hover aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_25px_rgba(2,6,23,0.3)]"
          >
            <img
              src={GAME_POSTERS[game.id]}
              alt={`${game.label} Tournament`}
              className="h-full w-full object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="relative z-10 grid grid-cols-4 gap-2.5 mb-5">
        {QUICK_ACTIONS.map(({ key, label, Icon, tone }) => (
          <button
            key={key}
            onClick={() => {
              if (key === "wallet") onNavigate?.("profile");
              else if (key === "clan") onNavigate?.("teams");
              else if (key === "scrims") onNavigate?.("lobbies");
              else onOpenUtility?.("leaderboard");
            }}
            className="game-card-hover flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#121b2a]/85 px-2 py-3.5 text-center shadow-[0_10px_25px_rgba(2,6,23,0.25)]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${TONE[tone].ring}`}>
              <Icon size={19} className={TONE[tone].icon} />
            </div>
            <span className="text-[10px] font-medium leading-tight text-slate-200">{label}</span>
          </button>
        ))}
      </div>

      {/* Trust strip — each badge is a real action now (payments info, jump to
          lobbies, or a live WhatsApp chat), not just decoration. */}
      <div className="relative z-10 rounded-2xl border border-white/10 bg-[#0d1420]/70 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {TRUST_BADGES.map(({ Icon, label, tone, href, action, external }) => {
            const content = (
              <React.Fragment>
                <Icon size={18} className={TONE[tone].icon} />
                <span className="text-[10px] leading-tight text-slate-400">{label}</span>
              </React.Fragment>
            );
            const className = "game-card-hover flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 transition hover:bg-white/5";
            if (action) {
              return (
                <button key={label} onClick={() => onNavigate?.(action)} className={className}>
                  {content}
                </button>
              );
            }
            return (
              <a key={label} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={className}>
                {content}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}