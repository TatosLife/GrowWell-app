"use client";
import { useStore } from "@/lib/store";
import { PIPELINE_COLORS, PIPELINE_LABELS, PACKAGE_COLORS, STATUS_COLORS, STATUS_LABELS, formatCurrency, daysUntil } from "@/lib/utils";
import Link from "next/link";
import ProjectModal from "@/components/modals/ProjectModal";
import { useState } from "react";
import { ArrowLeft, Phone, Mail, Calendar, Edit2, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ClientDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { visibleClients: clients, visibleProjects: projects, visibleTeam: team } = useStore();
  const [showProjectModal, setShowProjectModal] = useState(false);

  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Client not found.</p>
        <Link href="/crm" className="text-brand-600 text-sm mt-2 inline-block hover:underline">← Back to CRM</Link>
      </div>
    );
  }

  const clientProjects = projects.filter((p) => p.client_id === id);
  const activeProjects = clientProjects.filter((p) => p.status !== "delivered");

  return (
    <div>
      <Link href="/crm" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to CRM
      </Link>

      <ProjectModal open={showProjectModal} onClose={() => setShowProjectModal(false)} preselectedClientId={id} />

      {/* Client header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {client.business_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{client.business_name}</h1>
                <span className={`badge ${PIPELINE_COLORS[client.pipeline_stage]}`}>{PIPELINE_LABELS[client.pipeline_stage]}</span>
                <span className={`badge ${PACKAGE_COLORS[client.package]} capitalize`}>{client.package} package</span>
              </div>
              {client.industry && <p className="text-gray-500 text-sm">{client.industry}</p>}
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {client.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600"><Phone className="w-3.5 h-3.5" /> {client.phone}</div>
                )}
                {client.email && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600"><Mail className="w-3.5 h-3.5" /> {client.email}</div>
                )}
                {client.start_date && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5" /> Client since {format(parseISO(client.start_date), "MMM yyyy")}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(client.monthly_rate)}</p>
              <p className="text-xs text-gray-400">per month</p>
            </div>
            <button className="btn-secondary flex items-center gap-1.5"><Edit2 className="w-4 h-4" /> Edit</button>
          </div>
        </div>

        {client.platforms.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mr-1">Platforms:</p>
            {client.platforms.map((p) => (
              <span key={p} className="badge bg-gray-100 text-gray-600 capitalize">{p}</span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Projects */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Projects</h2>
            <button onClick={() => setShowProjectModal(true)} className="btn-primary text-xs flex items-center gap-1">+ New Project</button>
          </div>

          {clientProjects.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-400 text-sm mb-3">No projects yet for this client.</p>
              <button onClick={() => setShowProjectModal(true)} className="btn-primary text-xs">+ Create First Project</button>
            </div>
          ) : (
            clientProjects.map((proj) => {
              const days = daysUntil(proj.due_date);
              const videog = team.find((t) => t.id === proj.assigned_videographer);
              const editor = team.find((t) => t.id === proj.assigned_editor);
              return (
                <Link key={proj.id} href={`/projects/${proj.id}`}>
                  <div className="card p-4 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{proj.title}</p>
                        {proj.description && <p className="text-xs text-gray-400 mt-0.5">{proj.description}</p>}
                      </div>
                      <span className={`badge ${STATUS_COLORS[proj.status]} ml-3 flex-shrink-0`}>{STATUS_LABELS[proj.status]}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className={`text-xs font-medium flex items-center gap-1 ${days < 0 ? "text-red-500" : days <= 3 ? "text-amber-600" : "text-gray-500"}`}>
                        {days < 0 ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        Due {format(parseISO(proj.due_date), "MMM d")}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CheckCircle2 className={`w-3 h-3 ${proj.script_ready ? "text-green-500" : "text-gray-300"}`} /> Script
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CheckCircle2 className={`w-3 h-3 ${proj.footage_uploaded ? "text-green-500" : "text-gray-300"}`} /> Footage
                      </div>
                      <div className="flex -space-x-1.5 ml-auto">
                        {[videog, editor].filter(Boolean).map((m) => (
                          <div key={m!.id} className={`w-6 h-6 rounded-full ${m!.color} flex items-center justify-center text-white text-xs font-bold border-2 border-white`} title={m!.name}>
                            {m!.avatar_initials}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {client.notes && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{client.notes}</p>
            </div>
          )}

          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Quick Stats</h3>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Total Projects</span><span className="font-medium">{clientProjects.length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Active Projects</span><span className="font-medium">{activeProjects.length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Delivered</span><span className="font-medium">{clientProjects.filter(p => p.status === "delivered").length}</span></div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
              <span className="text-gray-500">Monthly Rate</span>
              <span className="font-bold text-gray-900">{formatCurrency(client.monthly_rate)}</span>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Primary Contact</h3>
            <p className="text-sm font-medium text-gray-800">{client.contact_name}</p>
            {client.email && (
              <a href={`mailto:${client.email}`} className="text-xs text-brand-600 hover:underline flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" /> {client.email}
              </a>
            )}
            {client.phone && (
              <a href={`tel:${client.phone}`} className="text-xs text-gray-500 flex items-center gap-1 mt-1 hover:text-gray-700">
                <Phone className="w-3 h-3" /> {client.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
