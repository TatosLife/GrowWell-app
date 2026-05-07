"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { STATUS_COLORS, STATUS_LABELS, deadlineColor, daysUntil } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/types";
import Link from "next/link";
import Header from "@/components/Header";
import ProjectModal from "@/components/modals/ProjectModal";
import { Search, Plus, CheckCircle2, Clock, AlertTriangle, FolderKanban } from "lucide-react";
import { format, parseISO } from "date-fns";

const STATUSES: ProjectStatus[] = ["not_started", "in_production", "in_editing", "review", "approved", "delivered"];

export default function ProjectsPage() {
  const { visibleProjects: projects, visibleTeam: team } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.client_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchMember = memberFilter === "all" || p.assigned_videographer === memberFilter || p.assigned_editor === memberFilter;
    return matchSearch && matchStatus && matchMember;
  }).sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date));

  const overdue = projects.filter((p) => p.status !== "delivered" && daysUntil(p.due_date) < 0).length;

  return (
    <div>
      <Header
        title="Project Tracker"
        subtitle={projects.length > 0
          ? `${projects.filter(p => p.status !== "delivered").length} active projects${overdue > 0 ? ` · ${overdue} overdue` : ""}`
          : "Track production deadlines and team assignments"}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Project
          </button>
        }
      />

      <ProjectModal open={showModal} onClose={() => setShowModal(false)} />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FolderKanban className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No projects yet</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">Create your first project to start tracking shoots, edits, and deadlines for your clients.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create Your First Project
          </button>
        </div>
      ) : (
        <>
          {/* Status summary strip */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {STATUSES.map((s) => {
              const count = projects.filter((p) => p.status === s).length;
              return (
                <button key={s} onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
                  className={`card p-3 text-center transition-all hover:shadow-md ${statusFilter === s ? "ring-2 ring-brand-500" : ""}`}>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                  <span className={`badge ${STATUS_COLORS[s]} mt-1 text-xs`}>{STATUS_LABELS[s]}</span>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-9" placeholder="Search projects or clients…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input max-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}>
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <select className="input max-w-[170px]" value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}>
              <option value="all">All Team Members</option>
              {team.filter((t) => t.role !== "director" && t.role !== "salesman").map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="grid grid-cols-[1fr_140px_120px_100px_100px_120px] text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span>Project</span><span>Due Date</span><span>Status</span><span>Script</span><span>Footage</span><span>Assigned To</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">No projects match your filters.</div>
              ) : (
                filtered.map((proj) => {
                  const days = daysUntil(proj.due_date);
                  const colorClass = deadlineColor(proj.due_date);
                  const videog = team.find((t) => t.id === proj.assigned_videographer);
                  const editor = team.find((t) => t.id === proj.assigned_editor);
                  return (
                    <Link key={proj.id} href={`/projects/${proj.id}`}
                      className="grid grid-cols-[1fr_140px_120px_100px_100px_120px] items-center px-5 py-4 hover:bg-gray-50 transition-colors group">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 truncate">{proj.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{proj.client_name}</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${colorClass}`}>
                          {days < 0 ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {format(parseISO(proj.due_date), "MMM d")}
                          {days < 0 ? ` (${Math.abs(days)}d late)` : days === 0 ? " (Today)" : ""}
                        </span>
                      </div>
                      <div><span className={`badge ${STATUS_COLORS[proj.status]}`}>{STATUS_LABELS[proj.status]}</span></div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className={`w-4 h-4 ${proj.script_ready ? "text-green-500" : "text-gray-200"}`} />
                        <span className={proj.script_ready ? "text-green-700" : "text-gray-400"}>{proj.script_ready ? "Ready" : "Pending"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className={`w-4 h-4 ${proj.footage_uploaded ? "text-green-500" : "text-gray-200"}`} />
                        <span className={proj.footage_uploaded ? "text-green-700" : "text-gray-400"}>{proj.footage_uploaded ? "Uploaded" : "Pending"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[videog, editor].filter(Boolean).map((m) => (
                          <div key={m!.id} className={`w-7 h-7 rounded-full ${m!.color} flex items-center justify-center text-white text-xs font-bold border-2 border-white`} title={`${m!.name} (${m!.role})`}>
                            {m!.avatar_initials}
                          </div>
                        ))}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
