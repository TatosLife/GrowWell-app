"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, FileText, CalendarDays, UserSquare2, FolderOpen, Settings, TrendingUp, LogOut, ShieldCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/scripts", label: "Scripts", icon: FileText },
  { href: "/schedule", label: "Scheduler", icon: CalendarDays },
  { href: "/files", label: "File Hub", icon: FolderOpen },
  { href: "/team", label: "Team", icon: UserSquare2 },
];

const ROLE_COLORS: Record<string, string> = {
  director: "bg-brand-600",
  videographer: "bg-blue-600",
  editor: "bg-purple-600",
  salesman: "bg-amber-600",
};

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { currentUser, markets, logout } = useStore();

  const market = currentUser ? markets.find((m) => m.id === currentUser.market_id) : null;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 bg-gray-900 flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">GrowWell</p>
          <p className="text-gray-400 text-xs">Marketing</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              active ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        {currentUser?.is_owner && (
          <Link href="/settings" className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            path.startsWith("/settings") ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
          )}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            Settings
          </Link>
        )}
      </nav>

      {/* Current user footer */}
      {currentUser && (
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${ROLE_COLORS[currentUser.role] ?? "bg-gray-600"} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {currentUser.avatar_initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-200 font-semibold truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {currentUser.is_owner ? (
                  <span className="text-xs text-brand-400 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Owner
                  </span>
                ) : market ? (
                  <span className="text-xs text-gray-500 flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {market.name}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 capitalize">{currentUser.role}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
