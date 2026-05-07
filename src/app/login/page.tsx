"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import type { TeamMember } from "@/lib/types";
import { TrendingUp, Delete, ChevronLeft, ShieldCheck, User } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  director: "bg-brand-600",
  videographer: "bg-blue-600",
  editor: "bg-purple-600",
  salesman: "bg-amber-600",
};

export default function LoginPage() {
  const { team, markets, login, addTeamMember } = useStore();
  const router = useRouter();
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // First-run setup state
  const [setupName, setSetupName] = useState("");
  const [setupPin, setSetupPin] = useState("");
  const [setupPin2, setSetupPin2] = useState("");
  const [setupError, setSetupError] = useState("");
  const [pendingPin, setPendingPin] = useState<string | null>(null);

  // After addTeamMember flushes, auto-login the new owner
  useEffect(() => {
    if (pendingPin && team.length > 0) {
      const owner = team.find((m) => m.is_owner);
      if (owner) {
        const ok = login(owner.id, pendingPin);
        if (ok) router.push("/");
      }
    }
  }, [team, pendingPin, login, router]);

  function handleFirstRun(e: React.FormEvent) {
    e.preventDefault();
    setSetupError("");
    const name = setupName.trim();
    if (!name) { setSetupError("Enter your name."); return; }
    if (!/^\d{4}$/.test(setupPin)) { setSetupError("PIN must be exactly 4 digits."); return; }
    if (setupPin !== setupPin2) { setSetupError("PINs don't match."); return; }
    const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    setPendingPin(setupPin);
    addTeamMember({
      name,
      email: "",
      role: "director",
      avatar_initials: initials,
      color: "bg-brand-600",
      market_id: "",
      pin: setupPin,
      is_owner: true,
    });
  }

  function selectMember(member: TeamMember) {
    setSelected(member);
    setPin("");
    setError("");
  }

  function handleDigit(d: string) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) attemptLogin(next);
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1));
    setError("");
  }

  function attemptLogin(enteredPin: string) {
    if (!selected) return;
    const ok = login(selected.id, enteredPin);
    if (ok) {
      router.push("/");
    } else {
      setError("Incorrect PIN. Try again.");
      setShake(true);
      setTimeout(() => { setShake(false); setPin(""); }, 600);
    }
  }

  const market = selected ? markets.find((m) => m.id === selected.market_id) : null;

  const KEYPAD = [
    ["1","2","3"],
    ["4","5","6"],
    ["7","8","9"],
    ["","0","⌫"],
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-tight">GrowWell</p>
          <p className="text-gray-400 text-xs">Marketing</p>
        </div>
      </div>

      {!selected ? (
        /* ── Step 1: Select who you are ── */
        <div className="w-full max-w-2xl">
          <h1 className="text-white text-xl font-bold text-center mb-2">Who are you?</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Select your name to sign in</p>

          {team.length === 0 ? (
            /* ── First-run: create owner account ── */
            <div className="w-full max-w-sm mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-brand-400" />
                </div>
                <h2 className="text-white text-xl font-bold mb-1">Welcome to GrowWell</h2>
                <p className="text-gray-400 text-sm">Set up your owner account to get started</p>
              </div>
              <form onSubmit={handleFirstRun} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Your Name</label>
                  <input
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Taylor Martin"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Create a 4-Digit PIN</label>
                  <input
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500 tracking-widest"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="• • • •"
                    value={setupPin}
                    onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm PIN</label>
                  <input
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500 tracking-widest"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="• • • •"
                    value={setupPin2}
                    onChange={(e) => setSetupPin2(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  />
                </div>
                {setupError && <p className="text-red-400 text-xs">{setupError}</p>}
                <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors mt-2">
                  Create Account & Sign In
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {team.map((member) => {
                const mkt = markets.find((m) => m.id === member.market_id);
                return (
                  <button
                    key={member.id}
                    onClick={() => selectMember(member)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl p-4 text-left transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${ROLE_COLORS[member.role] ?? "bg-gray-600"} flex items-center justify-center text-white font-bold text-lg mb-3`}>
                      {member.avatar_initials}
                    </div>
                    <p className="text-white font-semibold text-sm">{member.name}</p>
                    <p className="text-gray-400 text-xs capitalize mt-0.5">{member.role}</p>
                    {member.is_owner ? (
                      <span className="inline-flex items-center gap-1 text-xs text-brand-400 mt-1">
                        <ShieldCheck className="w-3 h-3" /> Owner
                      </span>
                    ) : mkt ? (
                      <p className="text-xs text-gray-500 mt-1">{mkt.name}</p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Step 2: PIN entry ── */
        <div className="w-full max-w-xs">
          <button onClick={() => { setSelected(null); setPin(""); setError(""); }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-xl ${ROLE_COLORS[selected.role] ?? "bg-gray-600"} flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3`}>
              {selected.avatar_initials}
            </div>
            <p className="text-white font-bold text-lg">{selected.name}</p>
            <p className="text-gray-400 text-sm capitalize">{selected.role}</p>
            {selected.is_owner ? (
              <span className="inline-flex items-center gap-1 text-xs text-brand-400 mt-1">
                <ShieldCheck className="w-3 h-3" /> Owner · All Markets
              </span>
            ) : market ? (
              <p className="text-gray-500 text-xs mt-1">{market.name}</p>
            ) : null}
          </div>

          {/* PIN dots */}
          <div className={`flex justify-center gap-4 mb-3 ${shake ? "animate-bounce" : ""}`}>
            {[0,1,2,3].map((i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? "bg-brand-500 border-brand-500" : "bg-transparent border-gray-600"}`} />
            ))}
          </div>

          {error ? (
            <p className="text-red-400 text-xs text-center mb-4">{error}</p>
          ) : (
            <p className="text-gray-500 text-xs text-center mb-4">Enter your 4-digit PIN</p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {KEYPAD.flat().map((key, i) => {
              if (key === "") return <div key={i} />;
              if (key === "⌫") return (
                <button key={i} onClick={handleDelete}
                  className="h-14 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95">
                  <Delete className="w-5 h-5" />
                </button>
              );
              return (
                <button key={i} onClick={() => handleDigit(key)}
                  className="h-14 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-lg transition-all active:scale-95 active:bg-gray-600">
                  {key}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
