"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, UserSquare2, MoreHorizontal, CalendarDays, FileText, FolderOpen, Settings, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useState } from "react";

const MAIN_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/team", label: "Team", icon: UserSquare2 },
];

const MORE_NAV = [
  { href: "/scripts", label: "Scripts", icon: FileText },
  { href: "/schedule", label: "Scheduler", icon: CalendarDays },
  { href: "/files", label: "File Hub", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings, ownerOnly: true },
];

export default function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();
  const [showMore, setShowMore] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const moreActive = MORE_NAV.some(n => path.startsWith(n.href));

  return (
    <>
      {/* More drawer */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl px-4 pt-4 pb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">More</p>
              <button onClick={() => setShowMore(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {MORE_NAV.filter(n => !n.ownerOnly || currentUser?.is_owner).map(({ href, label, icon: Icon }) => {
                const active = path.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={() => setShowMore(false)}
                    className={cn("flex flex-col items-center gap-2 py-4 rounded-xl transition-colors",
                      active ? "bg-brand-50 text-brand-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    )}>
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
            {currentUser && (
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-bottom">
        <div className="flex items-center">
          {MAIN_NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href} className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors",
                active ? "text-brand-600" : "text-gray-400"
              )}>
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
          <button onClick={() => setShowMore(!showMore)} className={cn(
            "flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors",
            moreActive ? "text-brand-600" : "text-gray-400"
          )}>
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
