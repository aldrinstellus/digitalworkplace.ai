"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Bot,
  Users,
  FolderOpen,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IQLogo } from "@/components/brand/IQLogo";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "People", href: "/people", icon: Users },
  { name: "Content", href: "/content", icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 bg-[#0f0f14] border-r border-white/10 flex flex-col items-center py-4">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="mb-6 hover:scale-105 transition-transform"
        title="Intranet IQ"
      >
        <IQLogo size="md" />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all group relative",
                isActive
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
              title={item.name}
            >
              <item.icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-14 px-2 py-1 bg-[#1f1f23] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.name}
              </span>
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 w-0.5 h-6 bg-blue-500 rounded-r" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/search"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </Link>
        <Link
          href="/settings"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}
