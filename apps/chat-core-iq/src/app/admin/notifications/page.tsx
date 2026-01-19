"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  Check,
  Trash2,
  ExternalLink,
  Filter,
  Server,
  Activity,
  Clock,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { apiUrl } from "@/lib/utils";

interface Notification {
  id: string;
  type: "system" | "activity" | "reminder";
  category: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  isRead: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    system: number;
    activity: number;
    reminder: number;
  };
  bySeverity: {
    info: number;
    warning: number;
    error: number;
    success: number;
  };
}

type FilterType = "all" | "unread" | "system" | "activity" | "reminder";

const severityConfig = {
  info: {
    icon: Info,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    iconColor: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    iconColor: "text-amber-700",
  },
  error: {
    icon: AlertCircle,
    color: "bg-red-100 text-red-700 border-red-200",
    iconColor: "text-red-600",
  },
  success: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-700 border-green-200",
    iconColor: "text-green-700",
  },
};

const typeConfig = {
  system: { icon: Server, label: "System", color: "text-purple-600" },
  activity: { icon: Activity, label: "Activity", color: "text-blue-600" },
  reminder: { icon: Clock, label: "Reminder", color: "text-orange-600" },
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === "unread") {
        params.set("unreadOnly", "true");
      } else if (filter !== "all") {
        params.set("type", filter);
      }

      const response = await fetch(`/api/admin/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "PUT",
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
        if (stats) {
          setStats({ ...stats, unread: stats.unread - 1 });
        }
        toast.success("Marked as read");
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(apiUrl("/api/admin/notifications/mark-all-read"), {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        if (stats) {
          setStats({ ...stats, unread: 0 });
        }
        toast.success(`Marked ${data.markedCount} notifications as read`);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const notification = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (stats && notification) {
          setStats({
            ...stats,
            total: stats.total - 1,
            unread: notification.isRead ? stats.unread : stats.unread - 1,
          });
        }
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const filterTabs: { key: FilterType; label: string; icon?: React.ReactNode }[] = [
    { key: "all", label: t("notifications.all") },
    { key: "unread", label: `${t("notifications.unread")}${stats?.unread ? ` (${stats.unread})` : ""}` },
    { key: "system", label: t("notifications.system"), icon: <Server className="h-3.5 w-3.5" /> },
    { key: "activity", label: t("notifications.activity"), icon: <Activity className="h-3.5 w-3.5" /> },
    { key: "reminder", label: t("notifications.scheduled"), icon: <Clock className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[#000034] tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8 text-[#000080]" />
            {t("notifications.title")}
            {stats && stats.unread > 0 && (
              <span className="bg-red-600 text-white text-sm px-2.5 py-0.5 rounded-full font-medium">
                {stats.unread}
              </span>
            )}
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">
            {t("notifications.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats && stats.unread > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAllAsRead}
              className="h-10 px-4 flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <CheckCheck className="h-4 w-4" />
              {t("notifications.markAllRead")}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setLoading(true);
              fetchNotifications();
            }}
            disabled={loading}
            className="h-10 px-4 flex items-center gap-2 bg-[#000080] text-white rounded-lg hover:bg-[#0000a0] transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#000034]">{stats.total}</p>
                <p className="text-xs text-[#666666]">{t("common.total")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#000034]">{stats.unread}</p>
                <p className="text-xs text-[#666666]">{t("notifications.unread")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Server className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#000034]">{stats.byType.system}</p>
                <p className="text-xs text-[#666666]">{t("notifications.system")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#000034]">{stats.byType.activity}</p>
                <p className="text-xs text-[#666666]">{t("notifications.activity")}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl border border-[#E7EBF0] p-2 mb-6 shadow-sm"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500 ml-2" />
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                filter === tab.key
                  ? "bg-[#000080] text-white"
                  : "text-[#666666] hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-[#000080] animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#000034] mb-1">{t("notifications.noNotifications")}</h3>
            <p className="text-[#666666] text-sm">
              {filter === "all"
                ? t("notifications.allCaughtUp")
                : `No ${filter} notifications found`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E7EBF0]">
            <AnimatePresence>
              {notifications.map((notification, index) => {
                const severityStyle = severityConfig[notification.severity];
                const typeStyle = typeConfig[notification.type];
                const SeverityIcon = severityStyle.icon;
                const TypeIcon = typeStyle.icon;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 hover:bg-gray-50/50 transition-colors ${
                      !notification.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Severity Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          severityStyle.color.split(" ")[0]
                        }`}
                      >
                        <SeverityIcon className={`h-5 w-5 ${severityStyle.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <h4 className="text-sm font-semibold text-[#000034] truncate">
                            {notification.title}
                          </h4>
                          <span
                            className={`flex items-center gap-1 text-xs ${typeStyle.color}`}
                          >
                            <TypeIcon className="h-3 w-3" />
                            {typeStyle.label}
                          </span>
                        </div>
                        <p className="text-sm text-[#666666] mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          {notification.link && (
                            <Link
                              href={notification.link}
                              className="flex items-center gap-1 text-[#000080] hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t("notifications.viewDetails")}
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!notification.isRead && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
