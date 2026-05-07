"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />
      {/* Main content — offset on desktop, bottom-padded on mobile */}
      <main className="flex-1 lg:ml-56 p-4 sm:p-6 lg:p-8 min-h-screen pb-20 lg:pb-8">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
