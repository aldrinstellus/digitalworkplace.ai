"use client";

import Link from "next/link";
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

const adminNavigation = [
  { name: "Elasticsearch", href: "/admin/elasticsearch", icon: Database },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Permissions", href: "/admin/permissions", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 bg-[var(--bg-charcoal)] border-r border-[var(--border-subtle)] flex flex-col items-center py-4">
      {/* Logo */}
      <Link
        href="/dashboard"
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
      </Link>

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
          item={{ name: "Search", href: "/search", icon: Search }}
          isActive={pathname === "/search"}
        />
        <NavItem
          item={{ name: "Settings", href: "/settings", icon: Settings }}
          isActive={pathname === "/settings" || pathname.startsWith("/settings/")}
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
    <Link
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
            backgroundColor: isActive ? "rgba(249, 115, 22, 0.15)" : "rgba(255, 255, 255, 0)",
          }}
          whileHover={{
            backgroundColor: isActive ? "rgba(249, 115, 22, 0.2)" : "rgba(255, 255, 255, 0.05)",
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
    </Link>
  );
}
