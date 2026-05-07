"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import Header from "@/components/Header";
import { Settings, MapPin, Plus, Trash2, ShieldCheck, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { markets, addMarket, deleteMarket, session, team } = useStore();
  const [newMarket, setNewMarket] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Safety: only owners should reach this page (sidebar hides the link for non-owners)
  if (!session?.isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Access Restricted</h2>
        <p className="text-sm text-gray-400 max-w-xs">Only owners can access settings.</p>
      </div>
    );
  }

  function handleAddMarket(e: React.FormEvent) {
    e.preventDefault();
    const name = newMarket.trim();
    if (!name) return;
    if (markets.some((m) => m.name.toLowerCase() === name.toLowerCase())) return;
    addMarket(name);
    setNewMarket("");
  }

  function handleDelete(id: string) {
    const membersInMarket = team.filter((m) => m.market_id === id && !m.is_owner).length;
    if (membersInMarket > 0) {
      setDeleteConfirm(id);
      return;
    }
    deleteMarket(id);
  }

  function confirmDelete(id: string) {
    deleteMarket(id);
    setDeleteConfirm(null);
  }

  return (
    <div>
      <Header title="Settings" subtitle="App configuration and markets" />

      <div className="max-w-2xl space-y-6">

        {/* ── Markets ──────────────────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Markets</h2>
          </div>
          <p className="text-xs text-gray-400 mb-5">Each market is a city or region. Team members assigned to a market only see data for that market.</p>

          {/* Existing markets */}
          {markets.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-5">
              <MapPin className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No markets yet. Add your first city below.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-5">
              {markets.map((market) => {
                const memberCount = team.filter((m) => m.market_id === market.id && !m.is_owner).length;
                return (
                  <div key={market.id}>
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-500" />
                        <span className="text-sm font-medium text-gray-800">{market.name}</span>
                        <span className="text-xs text-gray-400">{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(market.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete market"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Confirm delete if members exist */}
                    {deleteConfirm === market.id && (
                      <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800">
                            <span className="font-semibold">{memberCount} team member{memberCount !== 1 ? "s are" : " is"}</span> assigned to <span className="font-semibold">{market.name}</span>. Deleting the market won't remove them, but they'll lose their market assignment. Are you sure?
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => confirmDelete(market.id)} className="text-xs font-semibold px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Yes, delete
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new market */}
          <form onSubmit={handleAddMarket} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="e.g. Dallas, Houston, Austin…"
              value={newMarket}
              onChange={(e) => setNewMarket(e.target.value)}
            />
            <button type="submit" className="btn-primary flex items-center gap-1.5 flex-shrink-0" disabled={!newMarket.trim()}>
              <Plus className="w-4 h-4" /> Add Market
            </button>
          </form>
        </div>

        {/* ── Company Info ──────────────────────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Company Info</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Company Name</label>
              <input className="input" defaultValue="GrowWell Marketing" />
            </div>
            <div>
              <label className="label">Admin Email</label>
              <input className="input" defaultValue="taylor@growwellmarketing.com" />
            </div>
          </div>
          <button className="btn-primary mt-4">Save Changes</button>
        </div>

        {/* ── Integrations ──────────────────────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Integrations</h2>
          <div className="space-y-3">
            {[
              { name: "Supabase (Database)", status: "Configure in .env.local", color: "text-amber-600" },
              { name: "Instagram API", status: "Not connected", color: "text-gray-400" },
              { name: "Facebook API", status: "Not connected", color: "text-gray-400" },
              { name: "TikTok API", status: "Not connected", color: "text-gray-400" },
            ].map((i) => (
              <div key={i.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm text-gray-700">{i.name}</p>
                <span className={`text-xs font-medium ${i.color}`}>{i.status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
