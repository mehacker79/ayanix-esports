// ==========================================
// FILE: app/page.js â€” Main Root Client Orchestrator & Auth Gate
// ==========================================
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Home,
  Trophy,
  Users,
  User,
  X,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy as TrophyIcon,
  Wallet,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import HomeView from "./components/HomeView";
import LobbiesView from "./components/LobbiesView";
import TeamsView from "./components/TeamsView";
import ProfileView from "./components/ProfileView";
import { MAP_ART } from "@/lib/tournamentConfig";

const NAV_ITEMS = [
  { key: "home", label: "Home", Icon: Home },
  { key: "lobbies", label: "Lobbies", Icon: Trophy },
  { key: "teams", label: "Teams", Icon: Users },
  { key: "profile", label: "Profile", Icon: User },
];

const OTP_LENGTH = 6;
const OTP_COUNTDOWN_SECONDS = 30;

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingView, setPendingView] = useState(null);
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [utilityPanel, setUtilityPanel] = useState(null);
  const [roomModal, setRoomModal] = useState(null); // { tournamentId, title }
  const [profile, setProfile] = useState({
    email: "",
    username: "Warrior",
    inGameName: "ShadowStrike",
    bgmiCharacterId: "5123098417",
  });

  // Resolve initial client state safely to avoid hydration mismatches, then
  // ask the server (via the httpOnly session cookie) whether we're logged in.
  useEffect(() => {
    setMounted(true);
    setCurrentView("home");

    const storedProfile = (() => {
      try {
        const raw = localStorage.getItem("ayanix_profile");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    if (storedProfile) {
      setProfile((prev) => ({ ...prev, ...storedProfile }));
    }

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setIsLoggedIn(true);
          setUserEmail(data.email);
          setProfile((prev) => ({
            ...prev,
            email: data.email,
            ...(storedProfile || {}),
          }));
        }
      })
      .catch(() => {});
  }, []);

  const requireAuth = useCallback(
    (viewName) => {
      if (!isLoggedIn) {
        setPendingView(viewName);
        setShowAuthModal(true);
        return false;
      }
      return true;
    },
    [isLoggedIn]
  );

  const handleNavClick = (viewName) => {
    if (viewName === "home") {
      setCurrentView("home");
      return;
    }

    if ((viewName === "teams" || viewName === "profile") && !isLoggedIn) {
      requireAuth(viewName);
      return;
    }

    setCurrentView(viewName);
  };

  const handleAuthSuccess = (email, profileData = null) => {
    const safeEmail = email?.toLowerCase?.() || email || "";
    setIsLoggedIn(true);
    setUserEmail(safeEmail);

    if (profileData) {
      const nextProfile = {
        email: safeEmail,
        username: profileData.username || "Warrior",
        inGameName: profileData.inGameName || "ShadowStrike",
        bgmiCharacterId: profileData.bgmiCharacterId || "",
      };
      setProfile(nextProfile);
      try {
        localStorage.setItem("ayanix_profile", JSON.stringify(nextProfile));
      } catch {}
    } else {
      setProfile((prev) => ({ ...prev, email: safeEmail }));
    }

    setShowAuthModal(false);
    if (pendingView) {
      setCurrentView(pendingView);
      setPendingView(null);
      return;
    }

    setCurrentView((prev) => (prev === "home" ? "profile" : prev));
  };

  const handleProfileUpdate = (nextProfile) => {
    const safeProfile = {
      email: nextProfile.email || userEmail || profile.email || "",
      username: nextProfile.username || "Warrior",
      inGameName: nextProfile.inGameName || "ShadowStrike",
      bgmiCharacterId: nextProfile.bgmiCharacterId || "",
    };
    setProfile(safeProfile);
    try {
      localStorage.setItem("ayanix_profile", JSON.stringify(safeProfile));
    } catch {}
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    try {
      localStorage.removeItem("ayanix_profile");
    } catch {}
    setIsLoggedIn(false);
    setUserEmail(null);
    setProfile({
      email: "",
      username: "Warrior",
      inGameName: "ShadowStrike",
      bgmiCharacterId: "5123098417",
    });
    setCurrentView("home");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center">
        <span className="text-sm tracking-wide text-slate-400">Loading Arena...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] [background-size:30px_30px]" />

      <TopNav
        active={currentView}
        onSelect={handleNavClick}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => {
          setPendingView(null);
          setShowAuthModal(true);
        }}
      />

      <main className="relative z-10 md:pt-4">
        {currentView === "home" && (
          <HomeView
            onRequireAuth={requireAuth}
            onNavigate={(viewName) => {
              if (viewName === "lobbies") {
                setCurrentView("lobbies");
                return;
              }
              handleNavClick(viewName);
            }}
            onOpenUtility={setUtilityPanel}
          />
        )}
        {currentView === "lobbies" && (
          <LobbiesView
            isLoggedIn={isLoggedIn}
            onRequireAuth={requireAuth}
            onOpenLobbyDetail={setSelectedLobby}
          />
        )}
        {currentView === "teams" && <TeamsView isLoggedIn={isLoggedIn} onRequireAuth={requireAuth} />}
        {currentView === "profile" && (
          <ProfileView
            userEmail={userEmail}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onLogout={handleLogout}
          />
        )}
      </main>

      <BottomNav active={currentView} onSelect={handleNavClick} />
      <SiteFooter />

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setPendingView(null);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {selectedLobby && (
        <LobbyDetailModal
          lobby={selectedLobby}
          onClose={() => setSelectedLobby(null)}
          isLoggedIn={isLoggedIn}
          onRequireAuth={requireAuth}
          userEmail={userEmail}
          profile={profile}
          onJoinConfirmed={(payload) => {
            setSelectedLobby(null);
            setConfirmation(payload);
          }}
          onOpenRoomModal={(info) => {
            setSelectedLobby(null);
            setRoomModal(info);
          }}
        />
      )}

      {confirmation && (
        <ConfirmationModal
          title={confirmation.title}
          subtitle={confirmation.subtitle}
          onClose={() => setConfirmation(null)}
        />
      )}

      {roomModal && (
        <MatchRoomModal
          tournamentId={roomModal.tournamentId}
          title={roomModal.title}
          onClose={() => setRoomModal(null)}
        />
      )}

      {utilityPanel && (
        <UtilityPanelModal panel={utilityPanel} onClose={() => setUtilityPanel(null)} />
      )}
    </div>
  );
}

function TopNav({ active, onSelect, isLoggedIn, onLoginClick }) {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-white/10 bg-[#0a101b]/90 backdrop-blur-xl md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3 lg:px-10">
        <button onClick={() => onSelect("home")} className="flex shrink-0 items-center gap-2.5">
          <img src="/logo.png" alt="Ayanix Esports" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Ayanix <span className="text-cyan-300">Esports</span>
          </span>
        </button>

        <nav className="flex items-center gap-1.5">
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  isActive ? "bg-cyan-500/10 text-cyan-300" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.4 : 1.8} />
                {label}
              </button>
            );
          })}
        </nav>

        {isLoggedIn ? (
          <button
            onClick={() => onSelect("profile")}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40"
          >
            <User size={16} /> My Account
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="shrink-0 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-[#04121a] transition hover:bg-cyan-400"
          >
            Login / Sign up
          </button>
        )}
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto mb-24 mt-6 w-full max-w-md px-4 pb-4 text-center sm:max-w-2xl md:mb-8 md:max-w-6xl md:px-10">
      <div className="rounded-2xl border border-white/10 bg-[#0d1420]/70 p-4">
        <p className="text-[11px] leading-relaxed text-slate-500">
          Ayanix Esports is operated by{" "}
          <a href="https://www.ayanixtech.com" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">
            Ayanix Tech
          </a>{" "}
          (Govt. Registered MSME â€” UDYAM-MH-25-0049639). Entry fees fund skill-based squad
          tournament prize pools only â€” no betting, no wagering.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-400">
          <a href="/terms" className="hover:text-cyan-300">
            Terms &amp; Conditions
          </a>
          <span className="text-slate-700">Â·</span>
          <a href="/privacy" className="hover:text-cyan-300">
            Privacy Policy
          </a>
          <span className="text-slate-700">Â·</span>
          <a href="https://wa.me/919970889890" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300">
            WhatsApp Support
          </a>
          <span className="text-slate-700">Â·</span>
          <a href="mailto:ayanixtech@gmail.com" className="hover:text-cyan-300">
            ayanixtech@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}

function BottomNav({ active, onSelect }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0a101b]/85 backdrop-blur-xl md:hidden">
      <div className="max-w-md mx-auto grid grid-cols-4 p-2">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 transition-all duration-200 ${
                isActive ? "bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]" : "text-slate-500 hover:text-slate-200"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.4 : 1.8}
                className={isActive ? "text-cyan-400" : "text-slate-500"}
              />
              <span className={`text-[11px] ${isActive ? "text-cyan-300 font-semibold" : "text-slate-500"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function AuthModal({ onClose, onSuccess }) {
  const [authMode, setAuthMode] = useState("login");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [ign, setIgn] = useState("");
  const [bgmiId, setBgmiId] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = async () => {
    setError("");
    if (!email.includes("@")) {
      setError("Enter a valid email to receive an OTP.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send OTP");
      if (data?.demoOtp) {
        setDemoOtp(data.demoOtp);
      }
      setOtpSent(true);
      setCountdown(OTP_COUNTDOWN_SECONDS);
    } catch {
      setError("Could not send OTP right now. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value.slice(-1);
    setOtpDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setError("Password login isn't set up yet â€” use OTP Login below for now.");
    setAuthMode("login");
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !ign.trim() || !bgmiId.trim() || !email.includes("@")) {
      setError("Please complete all required profile details before creating your account.");
      return;
    }
    setError("");
    setIsSignUp(true);
    sendOtp();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const code = otpDigits.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "That code didn't work. Try again.");
        return;
      }

      const profileData = isSignUp
        ? {
            username: fullName.trim(),
            inGameName: ign.trim(),
            bgmiCharacterId: bgmiId.trim(),
          }
        : null;

      onSuccess(data.email, profileData);
    } catch {
      setError("Could not verify right now. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#0d1420]/95 shadow-[0_20px_60px_rgba(8,15,25,0.8)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.15),_transparent_36%)]" />
        <div className="relative p-5 sm:p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-lg font-black text-cyan-300">
              A
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Ayanix</p>
              <h2 className="text-xl font-black text-white">Secure access</h2>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">Match access</p>
            <p className="mt-1 text-sm text-slate-200">Use your email to join tournaments, manage squads, and unlock wallet features.</p>
          </div>

          <div className="mb-4 flex rounded-2xl border border-white/10 bg-[#0b0f19] p-1">
            <button
              onClick={() => {
                setAuthMode("login");
                setIsSignUp(false);
                setError("");
              }}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                authMode === "login" ? "bg-cyan-500/15 text-cyan-300" : "text-slate-400"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setIsSignUp(true);
                setError("");
              }}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                authMode === "signup" ? "bg-cyan-500/15 text-cyan-300" : "text-slate-400"
              }`}
            >
              Sign Up
            </button>
          </div>

          {authMode === "signup" ? (
            <form onSubmit={handleCreateAccount} className="space-y-3.5">
              {!otpSent ? (
                <>
                  <FieldWithIcon Icon={User} type="text" placeholder="Full name" value={fullName} onChange={setFullName} />
                  <FieldWithIcon Icon={User} type="text" placeholder="In-game name (IGN)" value={ign} onChange={setIgn} />
                  <FieldWithIcon Icon={TrophyIcon} type="text" placeholder="BGMI character ID" value={bgmiId} onChange={setBgmiId} />
                  <FieldWithIcon Icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} />
                  <FieldWithIcon Icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#04121a] transition hover:bg-cyan-400 disabled:opacity-60"
                  >
                    Create account & send OTP
                  </button>
                  {demoOtp && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                      Demo OTP: <span className="font-black text-cyan-300">{demoOtp}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {demoOtp && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                      Demo OTP: <span className="font-black text-cyan-300">{demoOtp}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        inputMode="numeric"
                        maxLength={1}
                        className="h-12 w-10 rounded-xl border border-white/10 bg-[#0b0f19] text-center text-lg font-black text-white outline-none transition focus:border-cyan-400"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{countdown > 0 ? `Resend in ${countdown}s` : "Code expired"}</span>
                    <button
                      type="button"
                      disabled={countdown > 0 || submitting}
                      onClick={sendOtp}
                      className="font-semibold text-cyan-300 disabled:text-slate-600"
                    >
                      Resend
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#04121a] transition hover:bg-cyan-400"
                  >
                    Verify &amp; finish sign up
                  </button>
                </>
              )}
            </form>
          ) : authMode === "login" ? (
            <form onSubmit={handleOtpSubmit} className="space-y-3.5">
              <FieldWithIcon Icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} />
              {!otpSent ? (
                <>
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={submitting}
                    className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#04121a] transition hover:bg-cyan-400 disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send OTP"}
                  </button>
                  {demoOtp && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                      Demo OTP: <span className="font-black text-cyan-300">{demoOtp}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {demoOtp && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                      Demo OTP: <span className="font-black text-cyan-300">{demoOtp}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        inputMode="numeric"
                        maxLength={1}
                        className="h-12 w-10 rounded-xl border border-white/10 bg-[#0b0f19] text-center text-lg font-black text-white outline-none transition focus:border-cyan-400"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{countdown > 0 ? `Resend in ${countdown}s` : "Code expired"}</span>
                    <button
                      type="button"
                      disabled={countdown > 0 || submitting}
                      onClick={sendOtp}
                      className="font-semibold text-cyan-300 disabled:text-slate-600"
                    >
                      Resend
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#04121a] transition hover:bg-cyan-400"
                  >
                    Verify &amp; Continue <ArrowRight size={16} className="ml-2 inline" />
                  </button>
                </>
              )}
              {error && !otpSent && <p className="text-xs text-red-400">{error}</p>}
            </form>
          ) : null}

          {authMode !== "signup" && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span>Need an account?</span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setIsSignUp(true);
                  setError("");
                }}
                className="font-semibold text-cyan-300"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const EMPTY_MEMBER = { ign: "", charId: "" };

function LobbyDetailModal({ lobby, onClose, isLoggedIn, onRequireAuth, userEmail, profile, onJoinConfirmed, onOpenRoomModal }) {
  const { game, map, startsAt, squadsFilled } = lobby;
  const squadCap = lobby.squadCap || game.squadCap;
  const pctFilled = Math.min(100, Math.round((squadsFilled / squadCap) * 100));
  const mapArt = MAP_ART[map];

  const [step, setStep] = useState("details"); // details | form | processing
  const [squadName, setSquadName] = useState("");
  const [members, setMembers] = useState([
    { ign: profile?.inGameName || "", charId: profile?.bgmiCharacterId || "" },
    { ...EMPTY_MEMBER },
    { ...EMPTY_MEMBER },
    { ...EMPTY_MEMBER },
  ]);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleStartRegistration = () => {
    if (!isLoggedIn) {
      onRequireAuth?.("lobbies");
      onClose();
      return;
    }
    setStep("form");
  };

  const updateMember = (index, field, value) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");

    if (!squadName.trim()) {
      setError("Give your squad a name.");
      return;
    }
    if (members.some((m) => !m.ign.trim() || !m.charId.trim())) {
      setError(`Enter the in-game name and ${game.id === "BGMI" ? "character ID" : "player ID"} for all 4 players.`);
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }

    setSubmitting(true);
    setStep("processing");
    try {
      const orderRes = await fetch("/api/registration/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          squadName: squadName.trim(),
          members: members.map((m) => ({ ign: m.ign.trim(), charId: m.charId.trim() })),
          game: game.id,
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order?.error || "Could not create the registration order.");

      if (typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Payment gateway is still loading â€” try again in a second.");
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Ayanix Esports",
        description: `${map} Showdown â€” ${game.label} squad entry`,
        order_id: order.orderId,
        prefill: { email: userEmail || "", name: squadName.trim() },
        theme: { color: "#22d3ee" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/registration/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                squadId: order.squadId,
                tournamentId: order.tournamentId,
              }),
            });
            const verified = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verified?.error || "Payment verification failed.");

            onJoinConfirmed?.({
              title: "Squad registration locked in",
              subtitle: `${squadName.trim()} is confirmed for ${map} Showdown. Room ID & password will be shared here and on WhatsApp before match time.`,
            });
          } catch (err) {
            setError(err.message || "Payment succeeded but verification failed â€” message support with your payment ID.");
            setStep("form");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setStep("form");
          },
        },
      });
      rzp.on("payment.failed", (resp) => {
        setError(resp?.error?.description || "Payment failed. No amount was charged.");
        setSubmitting(false);
        setStep("form");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start payment. Try again.");
      setSubmitting(false);
      setStep("form");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-4 pt-10 backdrop-blur-sm md:items-center">
      <div className="relative flex w-full max-w-md max-h-[88vh] flex-col overflow-hidden rounded-[30px] border border-cyan-400/20 bg-[#101a2b] shadow-[0_30px_80px_rgba(8,15,25,0.85)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(180deg,rgba(12,17,28,0.6),rgba(9,14,23,0.96))]" />
        <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3">
          <button
            onClick={() => (step === "form" ? setStep("details") : onClose())}
            className="flex items-center gap-1.5 text-sm text-slate-300"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="rounded-full border border-red-400/30 bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">
            {step === "form" ? "Squad details" : "Live"}
          </span>
        </div>

        <div className="relative overflow-y-auto px-4 pb-4 pt-4">
          {step === "processing" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Loader2 size={32} className="animate-spin text-cyan-300" />
              <p className="text-sm font-semibold text-white">Opening secure Razorpay checkoutâ€¦</p>
              <p className="text-xs text-slate-400">Don't close this window until payment finishes.</p>
            </div>
          ) : step === "form" ? (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-3 text-xs text-slate-300">
                {game.label} Â· {map} Showdown Â· Entry â‚¹{game.entryFeePerSquad} / squad
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Squad name
                </label>
                <input
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  placeholder="e.g. Team Nemesis"
                  className="w-full rounded-xl border border-white/10 bg-[#0b0f19] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-3">
                {members.map((member, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-[#121d2d] p-3">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-300">
                      {i === 0 ? "Player 1 (Captain â€” you)" : `Player ${i + 1}`}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={member.ign}
                        onChange={(e) => updateMember(i, "ign", e.target.value)}
                        placeholder="In-game name"
                        className="rounded-lg border border-white/10 bg-[#0b0f19] px-2.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                      />
                      <input
                        value={member.charId}
                        onChange={(e) => updateMember(i, "charId", e.target.value)}
                        placeholder={game.id === "BGMI" ? "Character ID" : "Player ID"}
                        inputMode="numeric"
                        className="rounded-lg border border-white/10 bg-[#0b0f19] px-2.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-2.5 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-[#0b0f19] accent-cyan-400"
                />
                <span>
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">
                    Terms &amp; Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">
                    Privacy Policy
                  </a>
                  . I confirm this entry fee funds a skill-based tournament prize pool, not a bet.
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              <div className="flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-500/5 px-4 py-3 text-sm font-bold text-white">
                <span className="font-medium text-slate-300">Pay now</span>
                <span>â‚¹{game.entryFeePerSquad}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#04121a] transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {submitting ? "Please waitâ€¦" : `Pay â‚¹${game.entryFeePerSquad} & Register`}
              </button>
            </form>
          ) : (
            <>
              <div
                className="relative mb-4 overflow-hidden rounded-[26px] border border-white/10 bg-cover bg-center p-4"
                style={{ backgroundImage: `url(${mapArt})` }}
              >
                <div className="absolute inset-0 bg-[#07101c]/65" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">{game.label}</p>
                      <h3 className="mt-2 text-2xl font-black text-white">{map} Showdown</h3>
                    </div>
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-2 text-right">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Prize</p>
                      <p className="text-base font-black text-cyan-300">â‚¹{game.prizePool?.toLocaleString("en-IN") || "1400"}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    <InfoPill label="Entry" value={`â‚¹${game.entryFeePerSquad}`} Icon={Ticket} />
                    <InfoPill label="Time" value={startsAt} Icon={CalendarDays} />
                    <InfoPill label="Mode" value="Squad" Icon={ShieldCheck} />
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-2xl border border-white/10 bg-[#121d2d] p-4">
                <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5"><Users size={12} /> {squadsFilled}/{squadCap} squads filled</span>
                  <span>{pctFilled}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#0b0f19]">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${pctFilled}%` }} />
                </div>
              </div>

              <div className="mb-5 space-y-2.5 rounded-2xl border border-white/10 bg-[#121d2d] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles size={16} className="text-cyan-300" /> Match details
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" /> 4-player squad only</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" /> {map} map Â· Room ID &amp; password shared 10 minutes before start</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" /> Prize pool split across top 3 squads (50% / 30% / 20%)</li>
                </ul>
              </div>

              <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  <Wallet size={16} /> Payment summary
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between"><span>Entry fee</span><span>â‚¹{game.entryFeePerSquad}</span></div>
                  <div className="flex items-center justify-between"><span>Processing</span><span>â‚¹0</span></div>
                  <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-base font-bold text-white">
                    <span>Total</span><span>â‚¹{game.entryFeePerSquad}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartRegistration}
                disabled={squadsFilled >= squadCap}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#04121a] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {squadsFilled >= squadCap ? "Lobby Full" : "Register Squad & Pay"}
              </button>

              {/* Room credentials & live chat â€” visible once registered */}
              {isLoggedIn && lobby._id && (
                <button
                  onClick={() => onOpenRoomModal?.({ tournamentId: lobby._id, title: lobby.title || `${map} Showdown` })}
                  className="mt-2 w-full rounded-xl border border-cyan-400/20 bg-cyan-500/5 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
                >
                  ðŸ”‘ Room Credentials & Live Chat
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function UtilityPanelModal({ panel, onClose }) {
  const isLeaderboard = panel === "leaderboard";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-4 pt-10 backdrop-blur-sm md:items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-cyan-400/20 bg-[#101a2b] shadow-[0_30px_80px_rgba(8,15,25,0.85)]">
        <div className="relative overflow-hidden px-5 pb-6 pt-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_35%),linear-gradient(180deg,rgba(12,17,28,0.55),rgba(9,14,23,0.98))]" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Ayanix arena</p>
              <h2 className="mt-1 text-2xl font-black text-white">{isLeaderboard ? "Leaderboards" : "Clan Central"}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {isLeaderboard ? "Track the squads dominating this week." : "Your squad hub is ready for roster moves and invites."}
              </p>
            </div>
            <button onClick={onClose} aria-label="Close" className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300">
              <X size={17} />
            </button>
          </div>

          {isLeaderboard ? (
            <div className="relative mt-5 space-y-2.5">
              {["Team Nemesis", "Rogue Orbit", "Nova Syndicate"].map((team, index) => (
                <div key={team} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121d2d]/90 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-cyan-300">0{index + 1}</span>
                    <span className="text-sm font-semibold text-white">{team}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-300">{1240 - index * 126} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
              <p className="text-sm font-semibold text-white">Team Nemesis</p>
              <p className="mt-1 text-xs text-slate-400">4/5 players Â· Captain access enabled</p>
              <p className="mt-4 text-xs leading-5 text-slate-300">Open Teams below to edit your roster, rename the squad, or invite a teammate by IGN.</p>
            </div>
          )}

          <button onClick={onClose} className="relative mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#04121a] hover:bg-cyan-400">
            Close panel
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({ title, subtitle, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[30px] border border-cyan-400/20 bg-[#111b2c] p-5 shadow-[0_30px_80px_rgba(8,15,25,0.85)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-2xl text-cyan-300">
          âœ“
        </div>
        <h3 className="text-center text-xl font-black text-white">{title}</h3>
        <p className="mt-2 text-center text-sm text-slate-300">{subtitle}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#04121a] transition hover:bg-cyan-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function InfoPill({ label, value, Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1420]/80 p-2.5">
      <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">
        <Icon size={11} /> {label}
      </div>
      <p className="text-xs font-bold text-slate-100">{value}</p>
    </div>
  );
}

function FieldWithIcon({ Icon, type, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 focus-within:border-cyan-400">
      <Icon size={16} className="text-slate-500" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent flex-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
      />
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.5 29.3 4 24 4 16.2 4 9.5 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.4 39.6 16.1 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41 35.9 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// ============================================================
// MATCH ROOM MODAL â€” Player sees Match Code, Room Credentials
// (time-gated) and the Live Chat with the host.
// ============================================================
function MatchRoomModal({ tournamentId, title, onClose }) {
  const [tab, setTab] = useState("credentials");
  const [creds, setCreds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [isCheatReport, setIsCheatReport] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchCreds = useCallback(async () => {
    try {
      const res = await fetch(`/api/match/credentials?tournamentId=${tournamentId}`);
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Failed to load credentials."); return; }
      setCreds(d);
    } catch {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/match/chat?tournamentId=${tournamentId}`);
      const d = await res.json();
      if (d.messages) setMessages(d.messages);
    } catch {}
  }, [tournamentId]);

  useEffect(() => {
    fetchCreds();
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchCreds, fetchMessages]);

  useEffect(() => {
    if (tab === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    setSending(true);
    setChatError("");
    try {
      const res = await fetch("/api/match/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, text: chatText.trim(), isCheatReport }),
      });
      const d = await res.json();
      if (!res.ok) { setChatError(d.error || "Failed to send."); return; }
      setChatText("");
      setIsCheatReport(false);
      fetchMessages();
    } catch {
      setChatError("Could not send.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-4 pt-10 backdrop-blur-sm md:items-center">
      <div className="relative flex w-full max-w-md max-h-[88vh] flex-col overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#101a2b] shadow-[0_30px_80px_rgba(8,15,25,0.85)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Match Room</p>
            <p className="text-sm font-bold text-white truncate max-w-[220px]">{title}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-cyan-300 transition">
            <X size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/10 px-4 pt-3 gap-1">
          {[
            { key: "credentials", label: "ðŸ”‘ Room" },
            { key: "chat", label: "ðŸ’¬ Live Chat" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`text-xs font-semibold px-3 py-2 rounded-t-xl transition-colors ${
                tab === key
                  ? "bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "credentials" && (
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-cyan-400" size={24} /></div>
              ) : error ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-xs text-red-300">
                  <AlertTriangle size={14} className="shrink-0" /> {error}
                </div>
              ) : (
                <>
                  {/* Match Code â€” always visible */}
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1">Your Match Code</p>
                    <p className="text-2xl font-black text-cyan-300 tracking-widest">{creds.matchCode}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Show this to your squad. Confirms you're in the right match.</p>
                  </div>

                  {/* Room Credentials */}
                  {creds.credentialsAvailable ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-3 space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 mb-1">Room Credentials â€” LIVE</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Room ID</span>
                        <span className="font-black font-mono text-white text-sm">{creds.roomId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Password</span>
                        <span className="font-black font-mono text-white text-sm">{creds.roomPassword}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400 mb-1">Room Credentials</p>
                      <p className="text-xs text-slate-300">{creds.message}</p>
                      {creds.revealAt && (
                        <p className="text-xs font-semibold text-amber-300 mt-1">
                          Visible at: {new Date(creds.revealAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-[11px] text-slate-600">
                      Match starts: {creds.matchStartAt ? new Date(creds.matchStartAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "â€”"}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "chat" && (
            <div className="flex flex-col gap-3 h-full">
              {/* Messages */}
              <div className="h-56 overflow-y-auto bg-[#0b0f19] border border-[#1f293d] rounded-xl p-3 space-y-2">
                {messages.length === 0 && (
                  <p className="text-xs text-slate-600 text-center mt-8">No messages yet. Ask your host anything here!</p>
                )}
                {messages.map((msg) => (
                  <div key={msg._id} className={`flex ${msg.senderRole === "player" ? "justify-end" : "justify-start"}`}>
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
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Cheat report toggle */}
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

              {chatError && <p className="text-xs text-red-400">{chatError}</p>}

              <form onSubmit={sendChat} className="flex gap-2">
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Message the hostâ€¦"
                  maxLength={500}
                  className="flex-1 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={sending || !chatText.trim()}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#04121a] p-2.5 rounded-xl transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
