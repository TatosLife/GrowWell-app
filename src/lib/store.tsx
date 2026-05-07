"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Client, Project, TeamMember, Market } from "./types";
import { supabase } from "./supabase";

// ─── Extra types ──────────────────────────────────────────────────────────────

export interface DriveFile {
  id: string;
  project_id: string;
  client_id: string;
  client_name: string;
  project_title: string;
  drive_link: string;
  label: string;
  type: "raw_footage" | "b_roll" | "photos" | "final_edit" | "audio" | "other";
  uploaded_by: string;
  notes: string;
  market_id: string;
  created_at: string;
}

export type PostStatus = "draft" | "scheduled" | "published";
export type PostPlatform = "instagram" | "facebook" | "tiktok" | "youtube";

export interface ScheduledPost {
  id: string;
  client_id: string;
  client_name: string;
  platform: PostPlatform;
  caption: string;
  drive_link: string;
  scheduled_at: string;
  status: PostStatus;
  notes: string;
  market_id: string;
  created_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthSession {
  userId: string;
  isOwner: boolean;
  marketId: string;
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface Store {
  loading: boolean;
  markets: Market[];
  clients: Client[];
  projects: Project[];
  team: TeamMember[];
  files: DriveFile[];
  posts: ScheduledPost[];

  session: AuthSession | null;
  currentUser: TeamMember | null;
  login: (userId: string, pin: string) => boolean;
  logout: () => void;

  visibleClients: Client[];
  visibleProjects: Project[];
  visibleTeam: TeamMember[];
  visibleFiles: DriveFile[];
  visiblePosts: ScheduledPost[];

  addMarket: (name: string) => void;
  deleteMarket: (id: string) => void;
  addClient: (c: Omit<Client, "id" | "created_at">) => void;
  updateClient: (id: string, c: Partial<Client>) => void;
  addProject: (p: Omit<Project, "id" | "created_at">) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  addTeamMember: (m: Omit<TeamMember, "id">) => void;
  updateTeamMember: (id: string, m: Partial<TeamMember>) => void;
  addFile: (f: Omit<DriveFile, "id" | "created_at">) => void;
  deleteFile: (id: string) => void;
  addPost: (p: Omit<ScheduledPost, "id" | "created_at">) => void;
  updatePost: (id: string, p: Partial<ScheduledPost>) => void;
  deletePost: (id: string) => void;
}

const StoreContext = createContext<Store | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const COLORS = [
  "bg-blue-600","bg-indigo-600","bg-purple-600","bg-rose-600",
  "bg-amber-600","bg-teal-600","bg-cyan-600","bg-brand-600",
  "bg-green-600","bg-orange-600","bg-pink-600","bg-red-600",
];

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(!!supabase);
  const [markets, setMarkets] = useState<Market[]>(() => loadLS("gw_markets", []));
  const [clients, setClients] = useState<Client[]>(() => loadLS("gw_clients", []));
  const [projects, setProjects] = useState<Project[]>(() => loadLS("gw_projects", []));
  const [team, setTeam] = useState<TeamMember[]>(() => loadLS("gw_team", []));
  const [files, setFiles] = useState<DriveFile[]>(() => loadLS("gw_files", []));
  const [posts, setPosts] = useState<ScheduledPost[]>(() => loadLS("gw_posts", []));
  const [session, setSession] = useState<AuthSession | null>(() => loadLS("gw_session", null));

  // ── Supabase initial fetch ─────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    async function fetchAll() {
      const [mkts, cls, prj, tm, fl, po] = await Promise.all([
        supabase!.from("markets").select("*").order("created_at"),
        supabase!.from("clients").select("*").order("created_at"),
        supabase!.from("projects").select("*").order("created_at"),
        supabase!.from("team_members").select("*").order("created_at"),
        supabase!.from("drive_files").select("*").order("created_at"),
        supabase!.from("scheduled_posts").select("*").order("created_at"),
      ]);
      if (mkts.data) { setMarkets(mkts.data); saveLS("gw_markets", mkts.data); }
      if (cls.data)  { setClients(cls.data);  saveLS("gw_clients", cls.data); }
      if (prj.data)  { setProjects(prj.data); saveLS("gw_projects", prj.data); }
      if (tm.data)   { setTeam(tm.data);      saveLS("gw_team", tm.data); }
      if (fl.data)   { setFiles(fl.data);     saveLS("gw_files", fl.data); }
      if (po.data)   { setPosts(po.data);     saveLS("gw_posts", po.data); }
      setLoading(false);
    }
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── localStorage sync (dev / offline fallback) ────────────────────────────
  useEffect(() => { if (!supabase) saveLS("gw_markets", markets); }, [markets]);
  useEffect(() => { if (!supabase) saveLS("gw_clients", clients); }, [clients]);
  useEffect(() => { if (!supabase) saveLS("gw_projects", projects); }, [projects]);
  useEffect(() => { if (!supabase) saveLS("gw_team", team); }, [team]);
  useEffect(() => { if (!supabase) saveLS("gw_files", files); }, [files]);
  useEffect(() => { if (!supabase) saveLS("gw_posts", posts); }, [posts]);
  useEffect(() => { saveLS("gw_session", session); }, [session]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const currentUser = session ? (team.find((m) => m.id === session.userId) ?? null) : null;

  const login = useCallback((userId: string, pin: string): boolean => {
    const member = team.find((m) => m.id === userId);
    if (!member || member.pin !== pin) return false;
    setSession({ userId, isOwner: member.is_owner, marketId: member.market_id });
    return true;
  }, [team]);

  const logout = useCallback(() => {
    setSession(null);
    saveLS("gw_session", null);
  }, []);

  // ── Market filtering ──────────────────────────────────────────────────────
  const isOwner = session?.isOwner ?? false;
  const userMarketId = session?.marketId ?? "";

  const visibleClients  = isOwner ? clients  : clients.filter((c) => c.market_id === userMarketId);
  const visibleProjects = isOwner ? projects : projects.filter((p) => p.market_id === userMarketId);
  const visibleTeam     = isOwner ? team     : team.filter((m) => m.market_id === userMarketId || m.is_owner);
  const visibleFiles    = isOwner ? files    : files.filter((f) => f.market_id === userMarketId);
  const visiblePosts    = isOwner ? posts    : posts.filter((p) => p.market_id === userMarketId);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addMarket = useCallback((name: string) => {
    const m: Market = { id: uid(), name, created_at: new Date().toISOString() };
    setMarkets((prev) => [...prev, m]);
    supabase?.from("markets").insert(m);
  }, []);

  const deleteMarket = useCallback((id: string) => {
    setMarkets((prev) => prev.filter((m) => m.id !== id));
    supabase?.from("markets").delete().eq("id", id);
  }, []);

  const addClient = useCallback((c: Omit<Client, "id" | "created_at">) => {
    const row: Client = { ...c, id: uid(), created_at: new Date().toISOString() };
    setClients((prev) => [...prev, row]);
    supabase?.from("clients").insert(row);
  }, []);

  const updateClient = useCallback((id: string, c: Partial<Client>) => {
    setClients((prev) => prev.map((x) => x.id === id ? { ...x, ...c } : x));
    supabase?.from("clients").update(c).eq("id", id);
  }, []);

  const addProject = useCallback((p: Omit<Project, "id" | "created_at">) => {
    const row: Project = { ...p, id: uid(), created_at: new Date().toISOString() };
    setProjects((prev) => [...prev, row]);
    supabase?.from("projects").insert(row);
  }, []);

  const updateProject = useCallback((id: string, p: Partial<Project>) => {
    setProjects((prev) => prev.map((x) => x.id === id ? { ...x, ...p } : x));
    supabase?.from("projects").update(p).eq("id", id);
  }, []);

  const addTeamMember = useCallback((m: Omit<TeamMember, "id">) => {
    const color = COLORS[team.length % COLORS.length];
    const row: TeamMember = { ...m, id: uid(), color: m.color || color };
    setTeam((prev) => [...prev, row]);
    supabase?.from("team_members").insert(row);
  }, [team.length]);

  const updateTeamMember = useCallback((id: string, m: Partial<TeamMember>) => {
    setTeam((prev) => prev.map((x) => x.id === id ? { ...x, ...m } : x));
    supabase?.from("team_members").update(m).eq("id", id);
  }, []);

  const addFile = useCallback((f: Omit<DriveFile, "id" | "created_at">) => {
    const row: DriveFile = { ...f, id: uid(), created_at: new Date().toISOString() };
    setFiles((prev) => [...prev, row]);
    supabase?.from("drive_files").insert(row);
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    supabase?.from("drive_files").delete().eq("id", id);
  }, []);

  const addPost = useCallback((p: Omit<ScheduledPost, "id" | "created_at">) => {
    const row: ScheduledPost = { ...p, id: uid(), created_at: new Date().toISOString() };
    setPosts((prev) => [...prev, row]);
    supabase?.from("scheduled_posts").insert(row);
  }, []);

  const updatePost = useCallback((id: string, p: Partial<ScheduledPost>) => {
    setPosts((prev) => prev.map((x) => x.id === id ? { ...x, ...p } : x));
    supabase?.from("scheduled_posts").update(p).eq("id", id);
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    supabase?.from("scheduled_posts").delete().eq("id", id);
  }, []);

  return (
    <StoreContext.Provider value={{
      loading,
      markets, clients, projects, team, files, posts,
      session, currentUser, login, logout,
      visibleClients, visibleProjects, visibleTeam, visibleFiles, visiblePosts,
      addMarket, deleteMarket,
      addClient, updateClient,
      addProject, updateProject,
      addTeamMember, updateTeamMember,
      addFile, deleteFile,
      addPost, updatePost, deletePost,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
