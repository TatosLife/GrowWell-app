"use client";
import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5 sm:mb-6 gap-3">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-snug">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </div>
  );
}
