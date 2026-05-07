"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { STATUS_COLORS, STATUS_LABELS, deadlineColor, daysUntil } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Clock, AlertTriangle, Edit2, Camera, Scissors, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_production", label: "In Production" },
  { value: "in_editing", label: "In Editing" },
  { value: "review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "delivered", label: "Delivered" },
];

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { visibleProjects: projects, visibleTeam: team, visibleClients: clients, updateProject } = useStore();
  const proj = projects.find((p) => p.id === id);
  const [status, setStatus] = useState<ProjectStatus>(proj?.status ?? "not_started");

  if (!proj) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Project not found.</p>
        <Link href="/projects" className="text-brand-600 text-sm mt-2 inline-block hover:underline">← Back to Projects</Link>
      </div>
    );
  }

  const videog = team.find((t) => t.id === proj.assigned_videographer);
  const editor = team.find((t) => t.id === proj.assigned_editor);
  const client = clients.find((c) => c.id === proj.client_id);
  const days = daysUntil(proj.due_date);
  const statusIndex = STATUSES.findIndex((s) => s.value === status);

  function handleStatusChange(s: ProjectStatus) {
    setStatus(s);
    updateProject(proj!.id, { status: s });
  }

  return (
    <div>
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {/* Header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-3 mb-1">
              <Link href={`/crm/${proj.client_id}`} className="text-sm text-brand-600 hover:underline font-medium">{proj.client_name}</Link>
              <span className="text-gray-300">·</span>
              <span className={`badge ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{proj.title}</h1>
            {proj.description && <p className="text-sm text-gray-500">{proj.description}</p>}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Camera className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Shoot:</span>
                <span className="font-medium">{proj.shoot_date ? format(parseISO(proj.shoot_date), "MMM d, yyyy") : "TBD"}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg ${deadlineColor(proj.due_date)}`}>
                {days < 0 ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>Due: {format(parseISO(proj.due_date), "MMM d, yyyy")}</span>
                {days < 0 ? <span>({Math.abs(days)}d overdue)</span> : days === 0 ? <span>(Today!)</span> : <span>({days} days)</span>}
              </div>
            </div>
          </div>
          <button className="btn-secondary flex items-center gap-1.5 flex-shrink-0"><Edit2 className="w-4 h-4" /> Edit</button>
        </div>
      </div>

      {/* Progress stepper */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Production Pipeline</h2>
        <div className="flex items-center">
          {STATUSES.map((s, i) => {
            const done = i < statusIndex;
            const current = i === statusIndex;
            const last = i === STATUSES.length - 1;
            return (
              <div key={s.value} className="flex items-center flex-1">
                <button onClick={() => handleStatusChange(s.value)} className="flex flex-col items-center gap-1.5 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? "bg-brand-600 border-brand-600" : current ? "bg-white border-brand-600 ring-4 ring-brand-100" : "bg-white border-gray-200"}`}>
                    {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className={`text-xs font-bold ${current ? "text-brand-600" : "text-gray-300"}`}>{i + 1}</span>}
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${current ? "text-brand-700" : done ? "text-gray-600" : "text-gray-400"}`}>{s.label}</span>
                </button>
                {!last && <div className={`flex-1 h-0.5 mx-2 rounded ${done ? "bg-brand-500" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Checklist */}
        <div className="col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Production Checklist</h2>
            <div className="space-y-3">
              {[
                { label: "Script written & approved", done: proj.script_ready, icon: FileText },
                { label: "Shoot date confirmed with client", done: !!proj.shoot_date, icon: Calendar },
                { label: "Videographer assigned", done: !!proj.assigned_videographer, icon: Camera },
                { label: "Raw footage uploaded to Drive", done: proj.footage_uploaded, icon: Camera },
                { label: "Editor assigned", done: !!proj.assigned_editor, icon: Scissors },
                { label: "Edit delivered for review", done: ["review","approved","delivered"].includes(status), icon: Scissors },
                { label: "Client approved", done: ["approved","delivered"].includes(status), icon: CheckCircle2 },
                { label: "Content delivered / posted", done: status === "delivered", icon: CheckCircle2 },
              ].map(({ label, done, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? "bg-brand-600 border-brand-600" : "border-gray-200"}`}>
                    {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${done ? "text-brand-500" : "text-gray-300"}`} />
                    <span className={`text-sm ${done ? "text-gray-500 line-through" : "text-gray-700"}`}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {proj.notes && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Production Notes</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{proj.notes}</p>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Assigned Team</h3>
            <div className="space-y-3">
              {videog && (
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${videog.color} flex items-center justify-center text-white text-sm font-bold`}>{videog.avatar_initials}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{videog.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Camera className="w-3 h-3" /> Videographer</p>
                  </div>
                </div>
              )}
              {editor && (
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${editor.color} flex items-center justify-center text-white text-sm font-bold`}>{editor.avatar_initials}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{editor.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Scissors className="w-3 h-3" /> Editor</p>
                  </div>
                </div>
              )}
              {!videog && !editor && <p className="text-xs text-gray-400">No team assigned yet.</p>}
            </div>
          </div>

          {proj.platforms.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {proj.platforms.map((p) => <span key={p} className="badge bg-gray-100 text-gray-600 capitalize">{p}</span>)}
              </div>
            </div>
          )}

          {client && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Client</h3>
              <Link href={`/crm/${client.id}`} className="text-sm text-brand-600 hover:underline font-medium">{client.business_name} →</Link>
              <p className="text-xs text-gray-400 mt-0.5">{client.contact_name}</p>
              {client.phone && <p className="text-xs text-gray-500 mt-0.5">{client.phone}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
