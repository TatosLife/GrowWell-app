"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PIPELINE_COLORS, PIPELINE_LABELS, PACKAGE_COLORS, formatCurrency } from "@/lib/utils";
import type { Client, PipelineStage } from "@/lib/types";
import Link from "next/link";
import Header from "@/components/Header";
import ClientModal from "@/components/modals/ClientModal";
import { Search, Plus, Instagram, Facebook, LayoutList, Columns, Phone, Mail, Users } from "lucide-react";

const STAGES: PipelineStage[] = ["lead", "proposal_sent", "negotiating", "active", "paused", "inactive"];

const PlatformIcon = ({ p }: { p: string }) => {
  if (p === "instagram") return <Instagram className="w-3.5 h-3.5" />;
  if (p === "facebook") return <Facebook className="w-3.5 h-3.5" />;
  if (p === "tiktok") return <span className="text-xs font-bold">TK</span>;
  if (p === "youtube") return <span className="text-xs font-bold">YT</span>;
  return null;
};

function ClientCard({ client }: { client: Client }) {
  return (
    <Link href={`/crm/${client.id}`}>
      <div className="card p-4 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">{client.business_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{client.industry}</p>
          </div>
          <span className={`badge ${PACKAGE_COLORS[client.package]} ml-2 flex-shrink-0 capitalize`}>{client.package}</span>
        </div>
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone className="w-3 h-3" /> {client.phone}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate"><Mail className="w-3 h-3" /> {client.email}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 text-gray-400">
            {client.platforms.map((p) => <span key={p} title={p} className="w-5 h-5 flex items-center justify-center"><PlatformIcon p={p} /></span>)}
          </div>
          <p className="text-sm font-semibold text-gray-900">{formatCurrency(client.monthly_rate)}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
        </div>
      </div>
    </Link>
  );
}

export default function CRMPage() {
  const { visibleClients: clients } = useStore();
  const [view, setView] = useState<"pipeline" | "list">("pipeline");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<PipelineStage | "all">("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = clients.filter((c) => {
    const matchSearch = c.business_name.toLowerCase().includes(search.toLowerCase()) || c.contact_name.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || c.pipeline_stage === stageFilter;
    return matchSearch && matchStage;
  });

  const totalMRR = clients.filter((c) => c.pipeline_stage === "active").reduce((s, c) => s + c.monthly_rate, 0);

  return (
    <div>
      <Header
        title="CRM"
        subtitle={clients.length > 0 ? `${clients.filter(c => c.pipeline_stage === "active").length} active clients · ${formatCurrency(totalMRR)} MRR` : "Manage your client pipeline"}
        actions={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Client</button>}
      />

      <ClientModal open={showModal} onClose={() => setShowModal(false)} />

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Users className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No clients yet</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">Add your first client to start tracking your pipeline, packages, and revenue.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Your First Client</button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-9" placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input max-w-[160px]" value={stageFilter} onChange={(e) => setStageFilter(e.target.value as PipelineStage | "all")}>
              <option value="all">All Stages</option>
              {STAGES.map((s) => <option key={s} value={s}>{PIPELINE_LABELS[s]}</option>)}
            </select>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden ml-auto">
              <button onClick={() => setView("pipeline")} className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${view === "pipeline" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}><Columns className="w-4 h-4" /> Pipeline</button>
              <button onClick={() => setView("list")} className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${view === "list" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}><LayoutList className="w-4 h-4" /> List</button>
            </div>
          </div>

          {view === "pipeline" && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map((stage) => {
                const cols = filtered.filter((c) => c.pipeline_stage === stage);
                const colMRR = cols.reduce((s, c) => s + c.monthly_rate, 0);
                return (
                  <div key={stage} className="flex-shrink-0 w-60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${PIPELINE_COLORS[stage]}`}>{PIPELINE_LABELS[stage]}</span>
                        <span className="text-xs text-gray-400 font-medium">{cols.length}</span>
                      </div>
                      {stage === "active" && colMRR > 0 && <span className="text-xs text-gray-400">{formatCurrency(colMRR)}</span>}
                    </div>
                    <div className="space-y-3">
                      {cols.length > 0 ? cols.map((c) => <ClientCard key={c.id} client={c} />) : (
                        <div className="card p-4 border-dashed text-center text-gray-400 text-xs">No clients</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "list" && (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Business</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Contact</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Package</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Stage</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">MRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/crm/${c.id}`}>
                      <td className="px-5 py-3.5"><p className="text-sm font-medium text-gray-900">{c.business_name}</p><p className="text-xs text-gray-400">{c.industry}</p></td>
                      <td className="px-4 py-3.5"><p className="text-sm text-gray-700">{c.contact_name}</p><p className="text-xs text-gray-400">{c.phone}</p></td>
                      <td className="px-4 py-3.5"><span className={`badge ${PACKAGE_COLORS[c.package]} capitalize`}>{c.package}</span></td>
                      <td className="px-4 py-3.5"><span className={`badge ${PIPELINE_COLORS[c.pipeline_stage]}`}>{PIPELINE_LABELS[c.pipeline_stage]}</span></td>
                      <td className="px-5 py-3.5 text-right"><p className="text-sm font-semibold text-gray-900">{formatCurrency(c.monthly_rate)}</p></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
