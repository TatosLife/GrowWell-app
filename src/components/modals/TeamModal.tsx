"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { TeamRole } from "@/lib/types";
import { X, Eye, EyeOff } from "lucide-react";

interface Props { open: boolean; onClose: () => void; }

export default function TeamModal({ open, onClose }: Props) {
  const { addTeamMember, markets } = useStore();
  const [form, setForm] = useState({
    name: "", email: "", role: "videographer" as TeamRole,
    market_id: "", pin: "", pin_confirm: "", is_owner: false,
  });
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");

  if (!open) return null;

  function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin)) {
      setPinError("PIN must be exactly 4 digits."); return;
    }
    if (form.pin !== form.pin_confirm) {
      setPinError("PINs do not match."); return;
    }
    setPinError("");
    addTeamMember({
      name: form.name, email: form.email, role: form.role,
      avatar_initials: initials(form.name),
      color: "",
      market_id: form.is_owner ? "" : form.market_id,
      pin: form.pin,
      is_owner: form.is_owner,
    });
    onClose();
    setForm({ name: "", email: "", role: "videographer", market_id: "", pin: "", pin_confirm: "", is_owner: false });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Team Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" placeholder="Jake Rivera" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="jake@growwellmarketing.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          {/* Role */}
          <div>
            <label className="label">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(["videographer", "editor", "salesman", "director"] as TeamRole[]).map((r) => (
                <button type="button" key={r} onClick={() => setForm({ ...form, role: r })}
                  className={`py-2 rounded-lg border text-sm font-medium capitalize transition-all ${form.role === r ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Owner toggle */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-50 border border-brand-100">
            <input
              type="checkbox"
              id="is_owner"
              className="mt-0.5 w-4 h-4 accent-brand-600"
              checked={form.is_owner}
              onChange={(e) => setForm({ ...form, is_owner: e.target.checked })}
            />
            <div>
              <label htmlFor="is_owner" className="text-sm font-semibold text-brand-800 cursor-pointer">Owner / Full Access</label>
              <p className="text-xs text-brand-600 mt-0.5">Can see all markets, all clients, and all data company-wide.</p>
            </div>
          </div>

          {/* Market — only if not owner */}
          {!form.is_owner && (
            <div>
              <label className="label">Assigned Market *</label>
              <select className="input" value={form.market_id} onChange={(e) => setForm({ ...form, market_id: e.target.value })} required={!form.is_owner}>
                <option value="">Select a market…</option>
                {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              {markets.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No markets set up yet — add them in Settings first.</p>
              )}
            </div>
          )}

          {/* PIN */}
          <div>
            <label className="label">Login PIN * (4 digits)</label>
            <div className="relative">
              <input
                className="input pr-10 tracking-widest text-lg"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={form.pin}
                onChange={(e) => { setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }); setPinError(""); }}
              />
              <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm PIN *</label>
            <input
              className="input tracking-widest text-lg"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={form.pin_confirm}
              onChange={(e) => { setForm({ ...form, pin_confirm: e.target.value.replace(/\D/g, "").slice(0, 4) }); setPinError(""); }}
            />
            {pinError && <p className="text-xs text-red-500 mt-1">{pinError}</p>}
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="submit" className="btn-primary flex-1">Add Member</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
