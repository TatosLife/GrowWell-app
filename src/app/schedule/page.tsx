"use client";
import { useState } from "react";
import { useStore, type ScheduledPost, type PostPlatform } from "@/lib/store";
import Header from "@/components/Header";
import {
  CalendarDays, Plus, X, Trash2, Edit2, Check,
  Instagram, Facebook, Clock, ChevronLeft, ChevronRight,
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from "date-fns";

const PLATFORMS: { value: PostPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];

const PLATFORM_COLORS: Record<PostPlatform, string> = {
  instagram: "bg-pink-100 text-pink-700",
  facebook: "bg-blue-100 text-blue-700",
  tiktok: "bg-gray-900 text-white",
  youtube: "bg-red-100 text-red-700",
};

const PLATFORM_DOTS: Record<PostPlatform, string> = {
  instagram: "bg-pink-400",
  facebook: "bg-blue-400",
  tiktok: "bg-gray-700",
  youtube: "bg-red-400",
};

const STATUS_COLORS: Record<ScheduledPost["status"], string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
};

function PlatformIcon({ platform, className = "w-4 h-4" }: { platform: PostPlatform; className?: string }) {
  if (platform === "instagram") return <Instagram className={className} />;
  if (platform === "facebook") return <Facebook className={className} />;
  if (platform === "tiktok") return <span className="text-xs font-black">TK</span>;
  return <span className="text-xs font-black">YT</span>;
}

function PostModal({ open, onClose, editPost }: { open: boolean; onClose: () => void; editPost?: ScheduledPost }) {
  const { addPost, updatePost, clients } = useStore();
  const [form, setForm] = useState({
    client_id: editPost?.client_id ?? "",
    platform: (editPost?.platform ?? "instagram") as PostPlatform,
    caption: editPost?.caption ?? "",
    drive_link: editPost?.drive_link ?? "",
    scheduled_at: editPost?.scheduled_at ?? "",
    status: (editPost?.status ?? "scheduled") as ScheduledPost["status"],
    notes: editPost?.notes ?? "",
  });

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id || !form.scheduled_at) return;
    const client = clients.find((c) => c.id === form.client_id);
    const data = { ...form, client_name: client?.business_name ?? "", market_id: client?.market_id ?? "" };
    if (editPost) { updatePost(editPost.id, data); }
    else { addPost(data); }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{editPost ? "Edit Post" : "Schedule Post"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Client *</label>
            <select className="input" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} required>
              <option value="">Select client…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.business_name}</option>)}
            </select>
            {clients.length === 0 && <p className="text-xs text-amber-600 mt-1">Add a client first.</p>}
          </div>

          {/* Platform */}
          <div>
            <label className="label">Platform</label>
            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button type="button" key={p.value} onClick={() => setForm({ ...form, platform: p.value })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${form.platform === p.value ? `border-transparent ${PLATFORM_COLORS[p.value]}` : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <PlatformIcon platform={p.value} className="w-3.5 h-3.5" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date & Time *</label>
              <input className="input" type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} required />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ScheduledPost["status"] })}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Drive link */}
          <div>
            <label className="label">Content (Google Drive Link)</label>
            <input className="input" type="url" placeholder="https://drive.google.com/…" value={form.drive_link} onChange={(e) => setForm({ ...form, drive_link: e.target.value })} />
          </div>

          {/* Caption */}
          <div>
            <label className="label">Caption</label>
            <textarea className="input resize-none" rows={4} placeholder="Write your caption here…" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Internal Notes</label>
            <input className="input" placeholder="e.g. Use trending audio, post at 7am" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="submit" className="btn-primary flex-1">{editPost ? "Save Changes" : "Schedule Post"}</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PostCard({ post, onEdit, onDelete, onStatusChange }: {
  post: ScheduledPost;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: ScheduledPost["status"]) => void;
}) {
  return (
    <div className="card p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${PLATFORM_COLORS[post.platform]}`}>
          <PlatformIcon platform={post.platform} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{post.client_name}</p>
            <span className={`badge ${STATUS_COLORS[post.status]}`}>{post.status}</span>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
            <Clock className="w-3 h-3" />
            {format(new Date(post.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
          </p>
          {post.caption && (
            <p className="text-xs text-gray-600 line-clamp-2">{post.caption}</p>
          )}
          {post.drive_link && (
            <a href={post.drive_link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline mt-1 block truncate">
              → View content in Drive
            </a>
          )}
          {post.notes && <p className="text-xs text-gray-400 mt-1 italic">{post.notes}</p>}
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          {post.status === "scheduled" && (
            <button onClick={() => onStatusChange("published")} title="Mark published" className="p-1.5 rounded-lg hover:bg-green-50 text-gray-300 hover:text-green-500 transition-colors"><Check className="w-3.5 h-3.5" /></button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const { posts, deletePost, updatePost, clients } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState<ScheduledPost | undefined>();
  const [view, setView] = useState<"queue" | "calendar">("queue");
  const [clientFilter, setClientFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState<PostPlatform | "all">("all");
  const [calMonth, setCalMonth] = useState(new Date());

  const filtered = posts.filter((p) => {
    const matchClient = clientFilter === "all" || p.client_id === clientFilter;
    const matchPlatform = platformFilter === "all" || p.platform === platformFilter;
    return matchClient && matchPlatform;
  }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const upcoming = filtered.filter((p) => p.status !== "published");
  const published = filtered.filter((p) => p.status === "published");

  // Calendar data
  const monthDays = eachDayOfInterval({ start: startOfMonth(calMonth), end: endOfMonth(calMonth) });
  const startDow = startOfMonth(calMonth).getDay();
  const calPosts = posts.filter((p) => {
    const matchClient = clientFilter === "all" || p.client_id === clientFilter;
    const matchPlatform = platformFilter === "all" || p.platform === platformFilter;
    return matchClient && matchPlatform;
  });

  function openEdit(post: ScheduledPost) {
    setEditPost(post);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditPost(undefined);
  }

  return (
    <div>
      <Header
        title="Social Scheduler"
        subtitle={posts.length > 0 ? `${upcoming.length} upcoming · ${published.length} published` : "Schedule posts for all client accounts"}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Schedule Post
          </button>
        }
      />

      <PostModal open={showModal} onClose={closeModal} editPost={editPost} />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CalendarDays className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No posts scheduled</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">Schedule posts for your clients across Instagram, Facebook, TikTok, and YouTube from one place.</p>
          <div className="flex gap-3 justify-center mb-6">
            {PLATFORMS.map((p) => (
              <span key={p.value} className={`badge ${PLATFORM_COLORS[p.value]} flex items-center gap-1.5 px-3 py-1.5`}>
                <PlatformIcon platform={p.value} /> {p.label}
              </span>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Schedule Your First Post
          </button>
        </div>
      ) : (
        <>
          {/* Filters + view toggle */}
          <div className="flex items-center gap-3 mb-6">
            <select className="input max-w-[180px]" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
              <option value="all">All Clients</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.business_name}</option>)}
            </select>
            <select className="input max-w-[150px]" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value as PostPlatform | "all")}>
              <option value="all">All Platforms</option>
              {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden ml-auto">
              <button onClick={() => setView("queue")} className={`px-3 py-2 text-sm transition-colors ${view === "queue" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Queue</button>
              <button onClick={() => setView("calendar")} className={`px-3 py-2 text-sm transition-colors ${view === "calendar" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Calendar</button>
            </div>
          </div>

          {view === "queue" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Upcoming */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Upcoming ({upcoming.length})</h2>
                {upcoming.length === 0 ? (
                  <div className="card p-6 text-center text-gray-400 text-sm border-dashed">No upcoming posts.</div>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((p) => (
                      <PostCard key={p.id} post={p} onEdit={() => openEdit(p)} onDelete={() => deletePost(p.id)} onStatusChange={(s) => updatePost(p.id, { status: s })} />
                    ))}
                  </div>
                )}
              </div>
              {/* Published */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Published ({published.length})</h2>
                {published.length === 0 ? (
                  <div className="card p-6 text-center text-gray-400 text-sm border-dashed">No published posts yet.</div>
                ) : (
                  <div className="space-y-3">
                    {published.map((p) => (
                      <PostCard key={p.id} post={p} onEdit={() => openEdit(p)} onDelete={() => deletePost(p.id)} onStatusChange={(s) => updatePost(p.id, { status: s })} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "calendar" && (
            <div className="card overflow-hidden">
              {/* Calendar header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <button onClick={() => setCalMonth(subMonths(calMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                <h2 className="font-semibold text-gray-900">{format(calMonth, "MMMM yyyy")}</h2>
                <button onClick={() => setCalMonth(addMonths(calMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
              </div>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <div key={d} className="px-3 py-2 text-xs font-medium text-gray-400 text-center">{d}</div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {Array.from({ length: startDow }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 border-b border-r border-gray-50" />
                ))}
                {monthDays.map((day) => {
                  const dayPosts = calPosts.filter((p) => isSameDay(new Date(p.scheduled_at), day));
                  return (
                    <div key={day.toISOString()} className={`h-24 border-b border-r border-gray-50 p-1.5 ${isToday(day) ? "bg-brand-50" : ""}`}>
                      <p className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? "bg-brand-600 text-white" : "text-gray-500"}`}>
                        {format(day, "d")}
                      </p>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayPosts.slice(0, 3).map((p) => (
                          <button key={p.id} onClick={() => openEdit(p)} className={`w-full text-left px-1.5 py-0.5 rounded text-xs truncate flex items-center gap-1 ${PLATFORM_COLORS[p.platform]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PLATFORM_DOTS[p.platform]}`} />
                            {p.client_name}
                          </button>
                        ))}
                        {dayPosts.length > 3 && <p className="text-xs text-gray-400 px-1">+{dayPosts.length - 3} more</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
