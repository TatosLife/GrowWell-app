"use client";
import { useState } from "react";
import { useStore, type DriveFile } from "@/lib/store";
import Header from "@/components/Header";
import {
  FolderOpen, Plus, Link2, Copy, Trash2, Check, X,
  Film, Image, Music, FileVideo, FileText, File,
} from "lucide-react";
import { format, parseISO } from "date-fns";

const FILE_TYPES: { value: DriveFile["type"]; label: string }[] = [
  { value: "raw_footage", label: "Raw Footage" },
  { value: "b_roll", label: "B-Roll" },
  { value: "photos", label: "Photos" },
  { value: "final_edit", label: "Final Edit" },
  { value: "audio", label: "Audio" },
  { value: "other", label: "Other" },
];

const TYPE_COLORS: Record<DriveFile["type"], string> = {
  raw_footage: "bg-blue-100 text-blue-700",
  b_roll: "bg-indigo-100 text-indigo-700",
  photos: "bg-pink-100 text-pink-700",
  final_edit: "bg-green-100 text-green-700",
  audio: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-600",
};

const TypeIcon = ({ type }: { type: DriveFile["type"] }) => {
  const cls = "w-4 h-4";
  if (type === "raw_footage") return <FileVideo className={cls} />;
  if (type === "b_roll") return <Film className={cls} />;
  if (type === "photos") return <Image className={cls} />;
  if (type === "final_edit") return <FileVideo className={cls} />;
  if (type === "audio") return <Music className={cls} />;
  return <File className={cls} />;
};

function AddFileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addFile, clients, projects } = useStore();
  const [form, setForm] = useState({
    client_id: "", project_id: "", drive_link: "", label: "",
    type: "raw_footage" as DriveFile["type"], uploaded_by: "", notes: "",
  });

  if (!open) return null;

  const selectedClient = clients.find((c) => c.id === form.client_id);
  const clientProjects = projects.filter((p) => p.client_id === form.client_id);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.drive_link.trim() || !form.label.trim() || !form.client_id) return;
    const client = clients.find((c) => c.id === form.client_id);
    const project = projects.find((p) => p.id === form.project_id);
    addFile({
      ...form,
      client_name: client?.business_name ?? "",
      project_title: project?.title ?? "No project",
      market_id: client?.market_id ?? "",
    });
    onClose();
    setForm({ client_id: "", project_id: "", drive_link: "", label: "", type: "raw_footage", uploaded_by: "", notes: "" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Upload Drive Link</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Client *</label>
            <select className="input" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value, project_id: "" })} required>
              <option value="">Select client…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.business_name}</option>)}
            </select>
          </div>
          {form.client_id && (
            <div>
              <label className="label">Project (optional)</label>
              <select className="input" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
                <option value="">No specific project</option>
                {clientProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Google Drive Link *</label>
            <input className="input" type="url" placeholder="https://drive.google.com/…" value={form.drive_link} onChange={(e) => setForm({ ...form, drive_link: e.target.value })} required />
          </div>
          <div>
            <label className="label">Label / File Name *</label>
            <input className="input" placeholder="e.g. Ridgeline — May Shoot Raw Footage" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">File Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as DriveFile["type"] })}>
                {FILE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Uploaded By</label>
              <input className="input" placeholder="Your name" value={form.uploaded_by} onChange={(e) => setForm({ ...form, uploaded_by: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Scene descriptions, what's included…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="submit" className="btn-primary flex-1">Submit Link</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600" title="Copy link">
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function FilesPage() {
  const { files, deleteFile, clients } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [clientFilter, setClientFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<DriveFile["type"] | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = files
    .filter((f) => {
      const matchClient = clientFilter === "all" || f.client_id === clientFilter;
      const matchType = typeFilter === "all" || f.type === typeFilter;
      const matchSearch = f.label.toLowerCase().includes(search.toLowerCase()) || f.client_name.toLowerCase().includes(search.toLowerCase());
      return matchClient && matchType && matchSearch;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Group by client
  const grouped = filtered.reduce<Record<string, DriveFile[]>>((acc, f) => {
    if (!acc[f.client_name]) acc[f.client_name] = [];
    acc[f.client_name].push(f);
    return acc;
  }, {});

  return (
    <div>
      <Header
        title="File Hub"
        subtitle="Google Drive links — shared between videographers and editors"
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Upload Drive Link
          </button>
        }
      />

      <AddFileModal open={showModal} onClose={() => setShowModal(false)} />

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FolderOpen className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No files yet</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">
            Videographers submit their Google Drive links here after a shoot. Editors can copy links directly to access footage.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Upload First Drive Link
          </button>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <input
              className="input max-w-xs"
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input max-w-[180px]" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
              <option value="all">All Clients</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.business_name}</option>)}
            </select>
            <select className="input max-w-[160px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as DriveFile["type"] | "all")}>
              <option value="all">All Types</option>
              {FILE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} file{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Grouped by client */}
          <div className="space-y-6">
            {Object.entries(grouped).map(([clientName, clientFiles]) => (
              <div key={clientName}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  {clientName}
                  <span className="text-gray-400 font-normal">({clientFiles.length})</span>
                </h3>
                <div className="space-y-2">
                  {clientFiles.map((f) => (
                    <div key={f.id} className="card p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[f.type]}`}>
                        <TypeIcon type={f.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900 truncate">{f.label}</p>
                          <span className={`badge ${TYPE_COLORS[f.type]} flex-shrink-0`}>
                            {FILE_TYPES.find((t) => t.value === f.type)?.label}
                          </span>
                        </div>
                        {f.project_title && f.project_title !== "No project" && (
                          <p className="text-xs text-gray-400 mb-1">{f.project_title}</p>
                        )}
                        <a href={f.drive_link} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline flex items-center gap-1 truncate max-w-xs">
                          <Link2 className="w-3 h-3 flex-shrink-0" />
                          {f.drive_link}
                        </a>
                        {f.notes && <p className="text-xs text-gray-500 mt-1">{f.notes}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {f.uploaded_by && <span>Uploaded by <span className="font-medium">{f.uploaded_by}</span> · </span>}
                          {format(parseISO(f.created_at), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <CopyButton text={f.drive_link} />
                        <a href={f.drive_link} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-brand-600" title="Open in Drive">
                          <Link2 className="w-4 h-4" />
                        </a>
                        <button onClick={() => deleteFile(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-300 hover:text-red-500" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No files match your filters.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
