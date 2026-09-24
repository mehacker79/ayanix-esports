// ==========================================
// FILE: app/components/ProfileView.js — Wallet & profile edit dashboard
// ==========================================
"use client";

import React, { useState } from "react";
import {
  Copy,
  Plus,
  Wallet,
  Trophy,
  Target,
  Percent,
  ChevronRight,
  ArrowLeft,
  Pencil,
  LogOut,
  Trash2,
  Bell,
} from "lucide-react";

const USER = {
  uid: "AYX-48213",
  ign: "ShadowStrike",
  bgmiCharId: "5123098417",
  walletBalance: 2450,
};

const METRICS = [
  { label: "Total Matches", value: "148", Icon: Trophy },
  { label: "Win Rate", value: "42.5%", Icon: Target },
  { label: "K/D Ratio", value: "4.82", Icon: Percent },
];

const TRANSACTIONS = [
  { id: 1, type: "Scrim Fee", label: "BGMI Erangel Squad Entry", amount: -120, date: "8 Sep" },
  { id: 2, type: "Winnings", label: "Free Fire Bermuda — 1st Place", amount: 500, date: "6 Sep" },
  { id: 3, type: "Deposit", label: "UPI Deposit via GPay", amount: 1000, date: "3 Sep" },
  { id: 4, type: "Scrim Fee", label: "BGMI Sanhok Squad Entry", amount: -120, date: "1 Sep" },
];

const WALLET_OPTIONS = [
  { id: "gpay", label: "GPay" },
  { id: "phonepe", label: "PhonePe" },
  { id: "paytm", label: "Paytm" },
];

export default function ProfileView({ userEmail, profile, onProfileUpdate, onLogout }) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showTxHistory, setShowTxHistory] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const user = {
    ...USER,
    uid: profile?.email ? profile.email.split("@")[0].toUpperCase().slice(0, 10) : USER.uid,
    ign: profile?.inGameName || USER.ign,
    bgmiCharId: profile?.bgmiCharacterId || USER.bgmiCharId,
  };

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard.writeText(user.uid);
    } catch {
      /* clipboard may be unavailable in some sandboxed contexts */
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  if (isEditingProfile) {
    return (
      <EditProfileMode
        profile={profile}
        onBack={() => setIsEditingProfile(false)}
        onProfileUpdate={onProfileUpdate}
        onLogout={onLogout}
      />
    );
  }

  if (showTxHistory) {
    return <TransactionHistory onBack={() => setShowTxHistory(false)} />;
  }

  return (
    <div className="w-full max-w-md md:max-w-5xl mx-auto px-3.5 pt-5 pb-28 text-white relative">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Left column — identity card */}
        <div className="bg-gradient-to-br from-[#131a26] to-[#0b0f19] border border-[#1f293d] rounded-2xl p-5 flex flex-col items-center text-center md:col-span-1">
          <div className="w-20 h-20 rounded-full bg-cyan-500/15 border-2 border-cyan-400/50 flex items-center justify-center text-2xl font-black text-cyan-400 mb-3">
            {user.ign.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="font-black text-lg">{user.ign}</h2>
          {userEmail && <p className="text-[11px] text-slate-500">{userEmail}</p>}
          <p className="text-xs text-slate-500 mb-3">BGMI ID: {user.bgmiCharId}</p>

          <button
            onClick={handleCopyUid}
            className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f293d] rounded-full px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-400/50 transition-colors"
          >
            {user.uid} <Copy size={12} />
          </button>

          <button
            onClick={() => setIsEditingProfile(true)}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400"
          >
            <Pencil size={13} /> Edit Profile
          </button>
        </div>

        {/* Right columns — metrics + wallet */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            {METRICS.map(({ label, value, Icon }) => (
              <div key={label} className="bg-[#131a26] border border-[#1f293d] rounded-xl p-3 text-center">
                <Icon size={16} className="text-cyan-400 mx-auto mb-1.5" />
                <p className="text-sm font-black">{value}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#131a26] border border-[#1f293d] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Wallet size={14} /> Wallet Balance
              </p>
              <button
                onClick={() => setShowDepositModal(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#04121a] transition-colors"
                aria-label="Add funds"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="text-3xl font-black text-cyan-400 mb-4">
              ₹{USER.walletBalance.toLocaleString("en-IN")}
            </p>
            <button
              onClick={() => setShowTxHistory(true)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
            >
              View Transaction History <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {showDepositModal && (
        <DepositModal onClose={() => setShowDepositModal(false)} />
      )}

      {toastVisible && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#131a26] border border-cyan-400/40 text-cyan-300 text-xs font-semibold px-4 py-2 rounded-full shadow-glow-cyan animate-toast z-50">
          UID Copied to Clipboard!
        </div>
      )}
    </div>
  );
}

function DepositModal({ onClose }) {
  const [amount, setAmount] = useState(200);
  const [method, setMethod] = useState("gpay");

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#131a26] border border-[#1f293d] rounded-2xl p-6 mb-0 md:mb-0">
        <h3 className="font-black text-lg mb-4">Add Funds</h3>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[100, 200, 500].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className={`py-2 rounded-xl text-sm font-bold border transition-colors ${
                amount === v
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                  : "bg-[#0b0f19] border-[#1f293d] text-slate-300"
              }`}
            >
              ₹{v}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 mb-2">Pay via</p>
        <div className="space-y-2 mb-5">
          {WALLET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMethod(opt.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                method === opt.id
                  ? "bg-cyan-500/10 border-cyan-400 text-cyan-300"
                  : "bg-[#0b0f19] border-[#1f293d] text-slate-300"
              }`}
            >
              {opt.label}
              {method === opt.id && <span className="text-cyan-400 text-xs">Selected</span>}
            </button>
          ))}
        </div>

        <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#04121a] font-bold text-sm py-2.5 rounded-xl transition-colors">
          Pay ₹{amount}
        </button>
        <button onClick={onClose} className="w-full text-xs text-slate-500 mt-3">
          Cancel
        </button>
      </div>
    </div>
  );
}

function TransactionHistory({ onBack }) {
  return (
    <div className="w-full max-w-md md:max-w-5xl mx-auto px-3.5 pt-5 pb-28 text-white">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 mb-4">
        <ArrowLeft size={16} /> Back to Profile
      </button>
      <h1 className="text-xl font-black mb-4">Transaction History</h1>
      <div className="space-y-2.5">
        {TRANSACTIONS.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between bg-[#131a26] border border-[#1f293d] rounded-xl px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{tx.label}</p>
              <p className="text-[11px] text-slate-500">
                {tx.type} · {tx.date}
              </p>
            </div>
            <p className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {tx.amount > 0 ? "+" : ""}
              {tx.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditProfileMode({ profile, onBack, onProfileUpdate, onLogout }) {
  const [ign, setIgn] = useState(profile?.inGameName || USER.ign);
  const [charId, setCharId] = useState(profile?.bgmiCharacterId || USER.bgmiCharId);
  const [device, setDevice] = useState("");
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyWallet, setNotifyWallet] = useState(true);

  const handleSave = () => {
    onProfileUpdate({
      email: profile?.email || "",
      inGameName: ign,
      bgmiCharacterId: charId,
    });
    onBack();
  };

  return (
    <div className="w-full max-w-md md:max-w-5xl mx-auto px-3.5 pt-5 pb-40 mb-12 text-white">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 mb-4">
        <ArrowLeft size={16} /> Back to Profile
      </button>
      <h1 className="text-xl font-black mb-5">Edit Profile</h1>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <EditField label="In-Game Name (IGN)" value={ign} onChange={setIgn} />
          <EditField label="BGMI Character ID" value={charId} onChange={setCharId} />
          <EditField
            label="Device / Hardware"
            value={device}
            onChange={setDevice}
            placeholder="e.g. iPhone 15, 90Hz, Gyroscope on"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-[#131a26] border border-[#1f293d] rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-2">Team / Clan</p>
            <p className="text-sm font-semibold">Team Nemesis</p>
            <p className="text-[11px] text-slate-500">Captain · 4/4 players</p>
          </div>

          <div className="bg-[#131a26] border border-[#1f293d] rounded-xl p-4 space-y-3">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Bell size={13} /> Notifications
            </p>
            <ToggleRow label="Match reminders" checked={notifyMatches} onChange={setNotifyMatches} />
            <ToggleRow label="Wallet activity" checked={notifyWallet} onChange={setNotifyWallet} />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-2.5">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#04121a] font-bold text-sm py-2.5 rounded-xl transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-[#131a26] border border-[#1f293d] text-slate-300 font-semibold text-sm py-2.5 rounded-xl transition-colors"
        >
          <LogOut size={15} /> Log Out
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm py-2.5 rounded-xl transition-colors">
          <Trash2 size={15} /> Delete Account
        </button>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 mb-1 block">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#131a26] border border-[#1f293d] rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
      />
    </label>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full relative transition-colors ${
          checked ? "bg-cyan-500" : "bg-[#1f293d]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
