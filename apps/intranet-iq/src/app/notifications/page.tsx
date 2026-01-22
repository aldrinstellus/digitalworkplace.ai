'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  AtSign,
  Heart,
  MessageSquare,
  UserPlus,
  AlertCircle,
  Clock,
  Settings,
  X,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

interface Notification {
  id: string;
  user_id: string;
  type: 'mention' | 'reaction' | 'comment' | 'assignment' | 'system' | 'reminder';
  entity_type?: string;
  entity_id?: string;
  actor_id?: string;
  actor?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
}

const typeIcons: Record<string, typeof Bell> = {
  mention: AtSign,
  reaction: Heart,
  comment: MessageSquare,
  assignment: UserPlus,
  system: AlertCircle,
  reminder: Clock,
};

const typeColors: Record<string, string> = {
  mention: 'text-blue-400',
  reaction: 'text-pink-400',
  comment: 'text-green-400',
  assignment: 'text-purple-400',
  system: 'text-orange-400',
  reminder: 'text-yellow-400',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Demo user ID
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  useEffect(() => {
    fetchNotifications();
  }, [filter, typeFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId,
        limit: '50',
      });
      if (filter === 'unread') {
        params.set('unreadOnly', 'true');
      }
      if (typeFilter) {
        params.set('type', typeFilter);
      }

      const response = await fetch(`/diq/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use demo data on error
      setNotifications(getDemoNotifications());
      setUnreadCount(5);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/diq/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/diq/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, markAll: true }),
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/diq/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-white flex">
      <Sidebar />

      <main className="flex-1 ml-16 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Notifications</h1>
                <p className="text-sm text-white/60">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filter === 'all' ? 'bg-orange-500/20 text-orange-400' : 'text-white/60 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filter === 'unread' ? 'bg-orange-500/20 text-orange-400' : 'text-white/60 hover:text-white'
                }`}
              >
                Unread
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/40" />
              {['mention', 'reaction', 'comment', 'assignment', 'system'].map(type => {
                const Icon = typeIcons[type];
                return (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                    className={`p-2 rounded-lg transition-colors ${
                      typeFilter === type
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-white/5 text-white/40 hover:text-white/60'
                    }`}
                    title={type}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/60">No notifications</h3>
                <p className="text-sm text-white/40 mt-1">
                  {filter === 'unread' ? 'You\'re all caught up!' : 'Nothing to show yet'}
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((notification, index) => {
                  const Icon = typeIcons[notification.type] || Bell;
                  const iconColor = typeColors[notification.type] || 'text-white/60';

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative p-4 rounded-xl transition-colors cursor-pointer ${
                        notification.read
                          ? 'bg-white/[0.02] hover:bg-white/5'
                          : 'bg-white/5 hover:bg-white/10 border-l-2 border-orange-500'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Actor Avatar or Type Icon */}
                        {notification.actor?.avatar_url ? (
                          <img
                            src={notification.actor.avatar_url}
                            alt={notification.actor.full_name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${iconColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${notification.read ? 'text-white/70' : 'text-white'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-orange-500" />
                            )}
                          </div>
                          {notification.message && (
                            <p className="text-sm text-white/50 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-white/40">
                              {formatTime(notification.created_at)}
                            </span>
                            {notification.actor?.full_name && (
                              <span className="text-xs text-white/40">
                                by {notification.actor.full_name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-white/60" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-white/60 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Demo notifications for development
function getDemoNotifications(): Notification[] {
  return [
    {
      id: '1',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'mention',
      title: 'Sarah Chen mentioned you in a comment',
      message: 'Hey @you, can you review the Q4 budget proposal?',
      actor: {
        id: '2',
        full_name: 'Sarah Chen',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      link: '/diq/news/1',
      read: false,
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: '2',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'reaction',
      title: 'Michael Ross reacted to your post',
      message: '👍 on "Team outing ideas for Q1"',
      actor: {
        id: '3',
        full_name: 'Michael Ross',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      },
      read: false,
      created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '3',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'assignment',
      title: 'New task assigned to you',
      message: 'Review and approve the marketing campaign assets',
      actor: {
        id: '4',
        full_name: 'Emma Watson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      },
      link: '/diq/my-day',
      read: false,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: '4',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'comment',
      title: 'New comment on your article',
      message: 'Great writeup! This will be really helpful for the team.',
      actor: {
        id: '5',
        full_name: 'James Wilson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      },
      link: '/diq/content/onboarding-guide',
      read: true,
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: '5',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      title: 'System maintenance scheduled',
      message: 'Planned downtime on Saturday 2am-4am EST for system upgrades.',
      read: true,
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: '6',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'reminder',
      title: 'Task due tomorrow',
      message: 'Complete quarterly performance review',
      link: '/diq/my-day',
      read: false,
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
  ];
}
