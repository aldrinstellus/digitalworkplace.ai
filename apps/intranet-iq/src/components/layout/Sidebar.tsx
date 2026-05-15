"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  MessageSquare,
  Bot,
  Users,
  FolderOpen,
  Search,
  Settings,
  Database,
  BarChart3,
  Shield,
  Bell,
  Hash,
  Newspaper,
  Calendar,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IQLogo } from "@/components/brand/IQLogo";

// Hrefs include the /diq basePath because we render native <a> tags below.
// Native <a> doesn't auto-prepend basePath the way next/link does.
const navigation = [
  { name: "Home", href: "/diq/dashboard", icon: Home },
  { name: "Chat", href: "/diq/chat", icon: MessageSquare },
  { name: "My Day", href: "/diq/my-day", icon: ListTodo },
  { name: "News", href: "/diq/news", icon: Newspaper },
  { name: "Events", href: "/diq/events", icon: Calendar },
  { name: "Channels", href: "/diq/channels", icon: Hash },
  { name: "People", href: "/diq/people", icon: Users },
  { name: "Content", href: "/diq/content", icon: FolderOpen },
  { name: "Agents", href: "/diq/agents", icon: Bot },
];

const adminNavigation = [
  { name: "Elasticsearch", href: "/diq/admin/elasticsearch", icon: Database },
  { name: "Analytics", href: "/diq/admin/analytics", icon: BarChart3 },
  { name: "Permissions", href: "/diq/admin/permissions", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 bg-[var(--bg-charcoal)] border-r border-[var(--border-subtle)] flex flex-col items-center py-4">
      {/* Logo */}
      <a
        href="/diq/dashboard"
        className="mb-6 group"
        title="Intranet IQ"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <IQLogo size="md" />
        </motion.div>
      </a>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <NavItem key={item.name} item={item} isActive={isActive} />
          );
        })}

        {/* Admin Divider */}
        <div className="w-8 h-px bg-[var(--border-subtle)] my-3" />

        {/* Admin Navigation */}
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <NavItem key={item.name} item={item} isActive={isActive} isAdmin />
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-1">
        <NavItem
          item={{ name: "Search", href: "/diq/search", icon: Search }}
          isActive={pathname === "/diq/search"}
        />
        <NavItem
          item={{ name: "Notifications", href: "/diq/notifications", icon: Bell }}
          isActive={pathname === "/diq/notifications"}
        />
        <NavItem
          item={{ name: "Settings", href: "/diq/settings", icon: Settings }}
          isActive={pathname === "/diq/settings" || pathname.startsWith("/diq/settings/")}
        />
      </div>
    </aside>
  );
}

interface NavItemProps {
  item: { name: string; href: string; icon: React.ElementType };
  isActive: boolean;
  isAdmin?: boolean;
}

function NavItem({ item, isActive, isAdmin }: NavItemProps) {
  return (
    <a
      href={item.href}
      className="relative group"
      title={item.name}
    >
      <motion.div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative overflow-hidden",
          isActive
            ? "text-[var(--accent-ember)]"
            : isAdmin
            ? "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Background glow on hover */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-lg",
            isActive
              ? "bg-[var(--accent-ember)]/15"
              : "bg-transparent"
          )}
          initial={false}
          animate={{
            backgroundColor: isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0)",
          }}
          whileHover={{
            backgroundColor: isActive ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
          }}
          transition={{ duration: 0.2 }}
        />

        <item.icon className="w-5 h-5 relative z-10" />

        {/* Active indicator bar */}
        {isActive && (
          <motion.span
            className="absolute left-0 w-0.5 h-6 rounded-r active-indicator"
            layoutId="activeIndicator"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </motion.div>

      {/* Tooltip */}
      <motion.span
        className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[var(--bg-slate)] text-[var(--text-primary)] text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-[var(--border-subtle)]"
        initial={{ opacity: 0, x: -4 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
      >
        {item.name}
        {/* Tooltip arrow */}
        <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[var(--bg-slate)] rotate-45 border-l border-b border-[var(--border-subtle)]" />
      </motion.span>
    </a>
  );
}
