export type PipelineStage =
  | "lead"
  | "proposal_sent"
  | "negotiating"
  | "active"
  | "paused"
  | "inactive";

export type PackageTier = "silver" | "gold" | "custom";

export type TeamRole = "videographer" | "editor" | "salesman" | "director";

export type ProjectStatus =
  | "not_started"
  | "in_production"
  | "in_editing"
  | "review"
  | "approved"
  | "delivered";

export type Platform = "instagram" | "facebook" | "tiktok" | "youtube";

export interface Market {
  id: string;
  name: string;        // e.g. "Boise, ID"
  created_at: string;
}

export interface Client {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  package: PackageTier;
  pipeline_stage: PipelineStage;
  monthly_rate: number;
  notes: string;
  platforms: Platform[];
  start_date: string | null;
  market_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar_initials: string;
  color: string;
  market_id: string;   // empty string = all markets (owners)
  pin: string;         // 4-digit PIN for login
  is_owner: boolean;   // owners see all markets
}

export interface Project {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  description: string;
  status: ProjectStatus;
  due_date: string;
  shoot_date: string | null;
  assigned_videographer: string | null;
  assigned_editor: string | null;
  platforms: Platform[];
  script_ready: boolean;
  footage_uploaded: boolean;
  notes: string;
  market_id: string;
  created_at: string;
}

export interface ContentScript {
  id: string;
  client_id: string;
  client_name: string;
  project_id: string | null;
  title: string;
  platform: Platform;
  hook: string;
  body: string;
  cta: string;
  shoot_notes: string;
  approved: boolean;
  created_at: string;
}
