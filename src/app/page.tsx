"use client";
import { useStore } from "@/lib/store";
import { PIPELINE_COLORS, PIPELINE_LABELS, STATUS_COLORS, STATUS_LABELS, formatCurrency, daysUntil, deadlineColor } from "@/lib/utils";
import { Users, FolderKanban, DollarSign, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { visibleClients: clients, visibleProjects: projects, visibleTeam: team } = useStore();

  const activeClients = clients.filter((c) => c.pipeline_stage === "active");
  const mrr = activeClients.reduce((sum, c) => sum + c.monthly_rate, 0);
  const openProjects = projects.filter((p) => p.status !== "delivered");
  const overdueProjects = openProjects.filter((p) => daysUntil(p.due_date) < 0);
  const dueSoon = openProjects.filter((p) => { const d = daysUntil(p.due_date); return d >= 0 && d <= 3; });
  const pipeline = clients.filter((c) => c.pipeline_stage !== "active" && c.pipeline_stage !== "inactive");

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/crm" className="btn-secondary text-xs sm:text-sm px-2 sm:px-4">+ Client</Link>
          <Link href="/projects" className="btn-primary text-xs sm:text-sm px-2 sm:px-4">+ Project</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Active Clients</p>
            <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-brand-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeClients.length}</p>
          <p className="text-xs text-gray-400 mt-1">{pipeline.length} in pipeline</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Monthly Revenue</p>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(mrr)}</p>
          <p className="text-xs text-gray-400 mt-1">MRR from active clients</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Open Projects</p>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{openProjects.length}</p>
          <p className="text-xs text-gray-400 mt-1">{projects.filter(p => p.status === "delivered").length} delivered this month</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Attention Needed</p>
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overdueProjects.length + dueSoon.length}</p>
          <p className="text-xs text-gray-400 mt-1">{overdueProjects.length} overdue · {dueSoon.length} due soon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Deadlines */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Project Deadlines</h2>
              <Link href="/projects" className="text-xs text-brand-600 hover:underline font-medium">View all →</Link>
            </div>
            {openProjects.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <FolderKanban className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No active projects yet.</p>
                <Link href="/projects" className="text-xs text-brand-600 hover:underline mt-1 inline-block">Create your first project →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {openProjects
                  .sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date))
                  .map((p) => {
                    const days = daysUntil(p.due_date);
                    const colorClass = deadlineColor(p.due_date);
                    const videog = team.find((t) => t.id === p.assigned_videographer);
                    const editor = team.find((t) => t.id === p.assigned_editor);
                    return (
                      <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className={`w-14 text-center rounded-lg py-1 text-xs font-bold ${colorClass}`}>
                          {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">{p.client_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                          <div className="flex -space-x-1.5">
                            {[videog, editor].filter(Boolean).map((m) => (
                              <div key={m!.id} className={`w-6 h-6 rounded-full ${m!.color} flex items-center justify-center text-white text-xs font-bold border-2 border-white`} title={m!.name}>
                                {m!.avatar_initials[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Sales Pipeline</h2>
              <Link href="/crm" className="text-xs text-brand-600 hover:underline font-medium">View →</Link>
            </div>
            <div className="p-5">
              {pipeline.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">No leads in pipeline.</p>
                  <Link href="/crm" className="text-xs text-brand-600 hover:underline mt-1 inline-block">Add a client →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {pipeline.map((c) => (
                    <Link key={c.id} href={`/crm/${c.id}`} className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.business_name}</p>
                        <p className="text-xs text-gray-400">{c.contact_name}</p>
                      </div>
                      <span className={`badge ${PIPELINE_COLORS[c.pipeline_stage]}`}>{PIPELINE_LABELS[c.pipeline_stage]}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Team Workload</h2>
            </div>
            <div className="p-5">
              {team.filter(m => m.role !== "director").length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">No team members added.</p>
                  <Link href="/team" className="text-xs text-brand-600 hover:underline mt-1 inline-block">Add your team →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {team.filter((m) => m.role !== "director").map((m) => {
                    const assigned = projects.filter((p) => p.status !== "delivered" && (p.assigned_videographer === m.id || p.assigned_editor === m.id)).length;
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full ${m.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{m.avatar_initials}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-gray-700 truncate">{m.name}</p>
                            <p className="text-xs text-gray-400">{assigned} active</p>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${assigned >= 3 ? "bg-red-400" : assigned >= 2 ? "bg-amber-400" : "bg-brand-400"}`} style={{ width: `${Math.min(100, (assigned / 4) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
