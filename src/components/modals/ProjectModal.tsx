"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { ProjectStatus, Platform } from "@/lib/types";
import { X } from "lucide-react";

interface Props { open: boolean; onClose: () => void; preselectedClientId?: string; }

const PLATFORMS: Platform[] = ["instagram", "facebook", "tiktok", "youtube"];

export default function ProjectModal({ open, onClose, preselectedClientId }: Props) {
  const { addProject, visibleClients, team } = useStore();
  const [form, setForm] = useState({
    client_id: preselectedClientId ?? "", title: "", description: "",
    status: "not_started" as ProjectStatus, due_date: "", shoot_date: "",
    assigned_videographer: "", assigned_editor: "", platforms: [] as Platform[],
    script_ready: false, footage_uploaded: false, notes: "",
  });

  if (!open) return null;

  function set(field: string, value: unknown) { setForm((prev) => ({ ...prev, [field]: value })); }

  function togglePlatform(p: Platform) {
    set("platforms", form.platforms.includes(p) ? form.platforms.filter((x) => x !== p) : [...form.platforms, p]);
  }

  const selectedClient = visibleClients.find((c) => c.id === form.client_id);

  // Filter team to the client's market (or all if owner)
  const marketId = selectedClient?.market_id ?? "";
  const videographers = team.filter((m) => m.role === "videographer" && (m.is_owner || !marketId || m.market_id === marketId));
  const editors = team.filter((m) => m.role === "editor" && (m.is_owner || !marketId || m.market_id === marketId));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id || !form.title.trim() || !form.due_date) return;
    addProject({
      ...form,
      client_name: selectedClient?.business_name ?? "",
      market_id: selectedClient?.market_id ?? "",
      shoot_date: form.shoot_date || null,
      assigned_videographer: form.assigned_videographer || null,
      assigned_editor: form.assigned_editor || null,
    });
    onClose();
    setForm({ client_id: preselectedClientId ?? "", title: "", description: "", status: "not_started", due_date: "", shoot_date: "", assigned_videographer: "", assigned_editor: "", platforms: [], script_ready: false, footage_uploaded: false, notes: "" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[90vh] h-full sm:h-auto overflow-y-auto z-10 rounded-t-2xl mt-auto sm:mt-0">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <label className="label">Client *</label>
            <select className="input" value={form.client_id} onChange={(e) => set("client_id", e.target.value)} required>
              <option value="">Select a client…</option>
              {visibleClients.map((c) => <option key={c.id} value={c.id}>{c.business_name}</option>)}
            </select>
            {visibleClients.length === 0 && <p className="text-xs text-amber-600 mt-1">No clients yet — add a client first.</p>}
          </div>
          <div>
            <label className="label">Project Title *</label>
            <input className="input" placeholder="e.g. May Content Package — 12 Reels" value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} placeholder="Brief overview of deliverables…" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date *</label>
              <input className="input" type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} required />
            </div>
            <div>
              <label className="label">Shoot Date</label>
              <input className="input" type="date" value={form.shoot_date} onChange={(e) => set("shoot_date", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)}>
              <option value="not_started">Not Started</option>
              <option value="in_production">In Production</option>
              <option value="in_editing">In Editing</option>
              <option value="review">In Review</option>
              <option value="approved">Approved</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Videographer</label>
              <select className="input" value={form.assigned_videographer} onChange={(e) => set("assigned_videographer", e.target.value)}>
                <option value="">Unassigned</option>
                {videographers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Editor</label>
              <select className="input" value={form.assigned_editor} onChange={(e) => set("assigned_editor", e.target.value)}>
                <option value="">Unassigned</option>
                {editors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
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
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-green-600" checked={form.script_ready} onChange={(e) => set("script_ready", e.target.checked)} />
              <span className="text-sm text-gray-700">Script ready</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-green-600" checked={form.footage_uploaded} onChange={(e) => set("footage_uploaded", e.target.checked)} />
              <span className="text-sm text-gray-700">Footage uploaded</span>
            </label>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Location details, special instructions…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="submit" className="btn-primary flex-1">Create Project</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
