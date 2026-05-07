import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, parseISO } from "date-fns";
import type { PipelineStage, ProjectStatus, PackageTier } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function deadlineColor(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return "text-red-600 bg-red-50";
  if (days <= 2) return "text-red-500 bg-red-50";
  if (days <= 5) return "text-amber-600 bg-amber-50";
  return "text-green-700 bg-green-50";
}

export const PIPELINE_LABELS: Record<PipelineStage, string> = {
  lead: "Lead",
  proposal_sent: "Proposal Sent",
  negotiating: "Negotiating",
  active: "Active Client",
  paused: "Paused",
  inactive: "Inactive",
};

export const PIPELINE_COLORS: Record<PipelineStage, string> = {
  lead: "bg-blue-100 text-blue-700",
  proposal_sent: "bg-purple-100 text-purple-700",
  negotiating: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-gray-100 text-gray-600",
  inactive: "bg-red-100 text-red-600",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "Not Started",
  in_production: "In Production",
  in_editing: "In Editing",
  review: "In Review",
  approved: "Approved",
  delivered: "Delivered",
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  not_started: "bg-gray-100 text-gray-600",
  in_production: "bg-blue-100 text-blue-700",
  in_editing: "bg-purple-100 text-purple-700",
  review: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

export const PACKAGE_COLORS: Record<PackageTier, string> = {
  silver: "bg-slate-100 text-slate-700",
  gold: "bg-amber-100 text-amber-700",
  custom: "bg-brand-100 text-brand-700",
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
