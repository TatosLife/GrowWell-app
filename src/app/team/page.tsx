"use client";
import { useStore } from "@/lib/store";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import Header from "@/components/Header";
import TeamModal from "@/components/modals/TeamModal";
import Link from "next/link";
import { useState } from "react";
import { Camera, Scissors, TrendingUp, UserSquare2, Mail, Plus } from "lucide-react";

const RoleIcon = ({ role }: { role: string }) => {
  if (role === "videographer") return <Camera className="w-4 h-4" />;
  if (role === "editor") return <Scissors className="w-4 h-4" />;
  if (role === "salesman") return <TrendingUp className="w-4 h-4" />;
  return <UserSquare2 className="w-4 h-4" />;
};

const ROLE_COLORS: Record<string, string> = {
  director: "bg-brand-100 text-brand-700",
  videographer: "bg-blue-100 text-blue-700",
  editor: "bg-purple-100 text-purple-700",
  salesman: "bg-amber-100 text-amber-700",
};

export default function TeamPage() {
  const { visibleTeam: team, visibleProjects: projects } = useStore();
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <Header
        title="Team"
        subtitle={team.length > 0 ? `${team.length} team members` : "Manage your crew"}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        }
      />

      <TeamModal open={showModal} onClose={() => setShowModal(false)} />

      {team.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <UserSquare2 className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No team members yet</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">Add your videographers, editors, and salespeople to assign them to projects and track workload.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Your First Team Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {team.map((member) => {
            const activeProjects = projects.filter((p) =>
              p.status !== "delivered" &&
              (p.assigned_videographer === member.id || p.assigned_editor === member.id)
            );
            const delivered = projects.filter((p) =>
              p.status === "delivered" &&
              (p.assigned_videographer === member.id || p.assigned_editor === member.id)
            ).length;

            return (
              <div key={member.id} className="card p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${member.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {member.avatar_initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`badge ${ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-600"} capitalize flex items-center gap-1`}>
                        <RoleIcon role={member.role} /> {member.role}
                      </span>
                    </div>
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="text-xs text-gray-400 flex items-center gap-1 mt-1.5 hover:text-brand-600 transition-colors truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" /> {member.email}
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{activeProjects.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Active</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{delivered}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Delivered</p>
                  </div>
                </div>

                {activeProjects.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Active Work</p>
                    <div className="space-y-1.5">
                      {activeProjects.slice(0, 3).map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-700 truncate">{p.client_name}</p>
                            <p className="text-xs text-gray-400 truncate">{p.title}</p>
                          </div>
                          <span className={`badge ${STATUS_COLORS[p.status]} ml-2 flex-shrink-0 text-xs`}>{STATUS_LABELS[p.status]}</span>
                        </Link>
                      ))}
                      {activeProjects.length > 3 && (
                        <p className="text-xs text-gray-400 text-center pt-1">+{activeProjects.length - 3} more</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2 bg-gray-50 rounded-lg">No active projects</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
