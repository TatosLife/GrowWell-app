"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import Header from "@/components/Header";
import ClientModal from "@/components/modals/ClientModal";
import { FileText, Plus, ChevronDown, Users } from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-50 text-pink-600 border-pink-100",
  facebook: "bg-blue-50 text-blue-600 border-blue-100",
  tiktok: "bg-gray-900 text-white border-gray-800",
  youtube: "bg-red-50 text-red-600 border-red-100",
};

const TEMPLATE_SECTIONS = [
  { key: "hook", label: "Hook (0–3 sec)", placeholder: "What stops the scroll? Strong opening line or visual action…", rows: 3 },
  { key: "body", label: "Body / Story", placeholder: "Main message — problem, solution, or story arc…", rows: 6 },
  { key: "cta", label: "Call to Action", placeholder: "What should viewers do next? Comment, DM, visit link in bio…", rows: 2 },
  { key: "shoot_notes", label: "Shoot Notes (for videographer)", placeholder: "Location, wardrobe, props, B-roll needs, tone, pacing…", rows: 4 },
];

export default function ScriptsPage() {
  const { visibleClients: clients } = useStore();
  const activeClients = clients.filter((c) => c.pipeline_stage === "active");

  const [selectedClientId, setSelectedClientId] = useState<string>(activeClients[0]?.id ?? "");
  const [platform, setPlatform] = useState<string>("instagram");
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({
    hook: "", body: "", cta: "", shoot_notes: "",
  });
  const [showClientModal, setShowClientModal] = useState(false);

  const client = clients.find((c) => c.id === selectedClientId);

  if (activeClients.length === 0) {
    return (
      <div>
        <Header title="Content Scripts" subtitle="Write monthly scripts for each client" />
        <ClientModal open={showClientModal} onClose={() => setShowClientModal(false)} />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No active clients yet</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">Add an active client first, then come back to write their content scripts.</p>
          <button onClick={() => setShowClientModal(true)} className="btn-primary flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Add a Client
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Content Scripts"
        subtitle="Write and manage monthly video scripts for each client"
        actions={
          <button className="btn-primary flex items-center gap-1.5"><Plus className="w-4 h-4" /> New Script</button>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Script builder */}
        <div className="col-span-2">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1">
                <label className="label">Client</label>
                <div className="relative">
                  <select className="input appearance-none pr-8" value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setPlatform("instagram"); }}>
                    {activeClients.map((c) => <option key={c.id} value={c.id}>{c.business_name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {client && client.platforms.length > 0 && (
                <div>
                  <label className="label">Platform</label>
                  <div className="flex gap-2">
                    {client.platforms.map((p) => (
                      <button key={p} type="button" onClick={() => setPlatform(p)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all capitalize ${platform === p ? PLATFORM_COLORS[p] : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-5">
              <label className="label">Script Title</label>
              <input className="input" placeholder="e.g. May Reel #1 — Before & After Transformation" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {TEMPLATE_SECTIONS.map((sec) => (
              <div key={sec.key} className="mb-5">
                <label className="label">{sec.label}</label>
                <textarea className="input resize-none" rows={sec.rows} placeholder={sec.placeholder}
                  value={fields[sec.key]} onChange={(e) => setFields({ ...fields, [sec.key]: e.target.value })} />
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button className="btn-primary">Save Script</button>
              <button className="btn-secondary">Mark as Approved</button>
              <button className="btn-secondary ml-auto">Download PDF</button>
            </div>
          </div>
        </div>

        {/* Tips + client context */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" /> Platform Tips
            </h3>
            <div className="space-y-3">
              {platform === "instagram" && <>
                <Tip title="Hook" text="First 1–3 seconds must stop the scroll. Lead with motion or a bold statement." />
                <Tip title="Length" text="Reels: 15–30 sec for entertainment, up to 90 sec for tutorials." />
                <Tip title="Captions" text="Always write on-screen text — 85% watch muted." />
                <Tip title="CTA" text="'Comment below' or 'Link in bio' — keep it one action." />
              </>}
              {platform === "tiktok" && <>
                <Tip title="Hook" text="Open with conflict or a question in the first 2 seconds." />
                <Tip title="Length" text="7–15 sec high-performing. 60 sec max for most niches." />
                <Tip title="Sound" text="Use trending audio when possible — boosts reach significantly." />
                <Tip title="CTA" text="'Stitch this', 'Duet if you agree', or comment CTAs work best." />
              </>}
              {platform === "facebook" && <>
                <Tip title="Hook" text="Text overlay in first frame — many autoplay muted." />
                <Tip title="Length" text="1–3 min videos perform best for engagement on Facebook." />
                <Tip title="Caption" text="Longer captions with story context do well here." />
                <Tip title="CTA" text="'Share this with someone who needs this' is a high-performer." />
              </>}
              {platform === "youtube" && <>
                <Tip title="Hook" text="Preview the payoff in the first 30 seconds — don't bury the lead." />
                <Tip title="Length" text="Shorts: under 60 sec. Long-form: 8–15 min for watch time." />
                <Tip title="Chapters" text="Add timestamps in description for longer videos." />
                <Tip title="CTA" text="Ask to subscribe at the mid-point and again at end." />
              </>}
            </div>
          </div>

          {client && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Client Context</h3>
              {client.industry && <><p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Industry</p><p className="text-sm text-gray-700 mb-2">{client.industry}</p></>}
              {client.notes && <><p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Notes</p><p className="text-sm text-gray-600 leading-relaxed">{client.notes}</p></>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tip({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-700">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{text}</p>
    </div>
  );
}
