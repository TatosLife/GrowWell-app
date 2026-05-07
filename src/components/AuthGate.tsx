"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!session && pathname !== "/login") {
      router.replace("/login");
    }
    if (session && pathname === "/login") {
      router.replace("/");
    }
  }, [session, pathname, router, loading]);

  // Loading spinner while Supabase data fetches
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session && pathname !== "/login") return null;

  return <>{children}</>;
}
