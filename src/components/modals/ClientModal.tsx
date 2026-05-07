"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { PipelineStage, PackageTier, Platform } from "@/lib/types";
import { X } from "lucide-react";

interface Props { open: boolean; onClose: () => void; }

const PLATFORMS: Platform[] = ["instagram", "facebook", "tiktok", "youtube"];
const PACKAGE_RATES: Record<PackageTier, number> = { silver: 1800, gold: 3500, custom: 0 };

export default function ClientModal({ open, onClose }: Props) {
  const { addClient, markets, session } = useStore();
  const [form, setForm] = useState({
    business_name: "", contact_name: "", email: "", phone: "",
    industry: "", package: "silver" as PackageTier,
    pipeline_stage: "lead" as PipelineStage, monthly_rate: 1800,
    platforms: [] as Platform[], notes: "", start_date: null as string | null,
    market_id: session?.marketId ?? "",
  });

  if (!open) return null;

  function set(field: string, value: unknown) { setForm((prev) => ({ ...prev, [field]: value })); }

  function togglePlatform(p: Platform) {
    set("platforms", form.platforms.includes(p) ? form.platforms.filter((x) => x !== p) : [...form.platforms, p]);
  }

  function handlePackageChange(pkg: PackageTier) {
    setForm((prev) => ({ ...prev, package: pkg, monthly_rate: pkg !== "custom" ? PACKAGE_RATES[pkg] : prev.monthly_rate }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.business_name.trim() || !form.contact_name.trim()) return;
    addClient(form);
    onClose();
    setForm({
      business_name: "", contact_name: "", email: "", phone: "",
      industry: "", package: "silver", pipeline_stage: "lead",
      monthly_rate: 1800, platforms: [], notes: "", start_date: null,
      market_id: session?.marketId ?? "",
    });
  }

  const isOwner = session?.isOwner ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[90vh] h-full sm:h-auto overflow-y-auto z-10 rounded-t-2xl mt-auto sm:mt-0">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Business Name *</label>
              <input className="input" placeholder="Acme Roofing" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} required />
            </div>
            <div>
              <label className="label">Contact Name *</label>
              <input className="input" placeholder="John Smith" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="john@acme.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="(208) 555-0100" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Industry</label>
            <input className="input" placeholder="e.g. Home Services, Fitness, Real Estate…" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
          </div>

          {/* Market — owners pick any, staff auto-assigned */}
          {isOwner ? (
            <div>
              <label className="label">Market *</label>
              <select className="input" value={form.market_id} onChange={(e) => set("market_id", e.target.value)} required>
                <option value="">Select a market…</option>
                {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              {markets.length === 0 && <p className="text-xs text-amber-600 mt-1">Add markets in Settings first.</p>}
            </div>
          ) : (
            <div>
              <label className="label">Market</label>
              <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                {markets.find((m) => m.id === form.market_id)?.name ?? "Your assigned market"}
              </p>
            </div>
          )}

          {/* Package */}
          <div>
            <label className="label">Package</label>
            <div className="flex gap-2">
              {(["silver", "gold", "custom"] as PackageTier[]).map((pkg) => (
                <button type="button" key={pkg} onClick={() => handlePackageChange(pkg)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${form.package === pkg ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {pkg} {pkg !== "custom" && <span className="text-xs opacity-70">${PACKAGE_RATES[pkg].toLocaleString()}/mo</span>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Monthly Rate ($)</label>
            <input className="input" type="number" min="0" value={form.monthly_rate} onChange={(e) => set("monthly_rate", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Pipeline Stage</label>
            <select className="input" value={form.pipeline_stage} onChange={(e) => set("pipeline_stage", e.target.value as PipelineStage)}>
              <option value="lead">Lead</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="negotiating">Negotiating</option>
              <option value="active">Active Client</option>
              <option value="paused">Paused</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="label">Platforms</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                <button type="button" key={p} onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium capitalize transition-all ${form.platforms.includes(p) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input className="input" type="date" value={form.start_date ?? ""} onChange={(e) => set("start_date", e.target.value || null)} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={3} placeholder="Shoot preferences, posting schedule, special requirements…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="submit" className="btn-primary flex-1">Add Client</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
