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
import { Sidebar } from '@/components/layout/Sidebar';

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
        // Use demo data if API returns empty (no real notifications in database)
        if (!data.notifications || data.notifications.length === 0) {
          const demoNotifications = getDemoNotifications();
          // Apply filters to demo data
          let filtered = demoNotifications;
          if (filter === 'unread') {
            filtered = filtered.filter(n => !n.read);
          }
          if (typeFilter) {
            filtered = filtered.filter(n => n.type === typeFilter);
          }
          setNotifications(filtered);
          setUnreadCount(demoNotifications.filter(n => !n.read).length);
        } else {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use demo data on error
      const demoNotifications = getDemoNotifications();
      let filtered = demoNotifications;
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.read);
      }
      if (typeFilter) {
        filtered = filtered.filter(n => n.type === typeFilter);
      }
      setNotifications(filtered);
      setUnreadCount(demoNotifications.filter(n => !n.read).length);
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
    <div className="min-h-screen bg-[var(--bg-obsidian)] text-white flex">
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

// Demo notifications for development - Full spectrum across all integrated apps
function getDemoNotifications(): Notification[] {
  const now = Date.now();
  return [
    // === SLACK NOTIFICATIONS ===
    {
      id: '1',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'mention',
      entity_type: 'slack',
      title: 'Sarah Chen mentioned you in #engineering',
      message: 'Hey @you, can you review the Q4 budget proposal? Need your input before the meeting.',
      actor: {
        id: '2',
        full_name: 'Sarah Chen',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      link: '/diq/apps/slack?channel=engineering',
      read: false,
      created_at: new Date(now - 5 * 60000).toISOString(),
    },
    {
      id: '2',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'reaction',
      entity_type: 'slack',
      title: 'Mike Johnson reacted to your message',
      message: '🎉 on "Great news! The deployment was successful!"',
      actor: {
        id: '3',
        full_name: 'Mike Johnson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      },
      read: false,
      created_at: new Date(now - 15 * 60000).toISOString(),
    },
    {
      id: '3',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'comment',
      entity_type: 'slack',
      title: 'New thread reply in #product',
      message: 'Alex Kim replied: "I agree with this approach. Let\'s discuss in the standup."',
      actor: {
        id: '4',
        full_name: 'Alex Kim',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      },
      link: '/diq/apps/slack?channel=product',
      read: false,
      created_at: new Date(now - 45 * 60000).toISOString(),
    },

    // === JIRA NOTIFICATIONS ===
    {
      id: '4',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'assignment',
      entity_type: 'jira',
      title: 'New Jira ticket assigned to you',
      message: 'PROJ-456: Implement user authentication flow - High Priority',
      actor: {
        id: '5',
        full_name: 'Emily Rodriguez',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      },
      link: '/diq/apps/jira?ticket=PROJ-456',
      read: false,
      created_at: new Date(now - 1 * 3600000).toISOString(),
    },
    {
      id: '5',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'comment',
      entity_type: 'jira',
      title: 'Comment on PROJ-234',
      message: 'James Wilson commented: "I\'ve added the API documentation to the ticket."',
      actor: {
        id: '6',
        full_name: 'James Wilson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      },
      link: '/diq/apps/jira?ticket=PROJ-234',
      read: true,
      created_at: new Date(now - 2 * 3600000).toISOString(),
    },
    {
      id: '6',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'jira',
      title: 'Sprint completed',
      message: 'Sprint "Q4 Week 3" has ended. 23 of 25 story points completed.',
      link: '/diq/apps/jira',
      read: true,
      created_at: new Date(now - 3 * 3600000).toISOString(),
    },

    // === GITHUB NOTIFICATIONS ===
    {
      id: '7',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'assignment',
      entity_type: 'github',
      title: 'Review requested on PR #127',
      message: 'Alex Kim requested your review on "feat: Add semantic search to knowledge base"',
      actor: {
        id: '4',
        full_name: 'Alex Kim',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      },
      link: '/diq/apps/github?pr=127',
      read: false,
      created_at: new Date(now - 30 * 60000).toISOString(),
    },
    {
      id: '8',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'comment',
      entity_type: 'github',
      title: 'PR #115 approved',
      message: 'Mike Johnson approved your pull request "fix: Resolve authentication timeout"',
      actor: {
        id: '3',
        full_name: 'Mike Johnson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      },
      link: '/diq/apps/github?pr=115',
      read: true,
      created_at: new Date(now - 4 * 3600000).toISOString(),
    },
    {
      id: '9',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'github',
      title: 'CI/CD Pipeline completed',
      message: 'Build #892 succeeded on main branch. All 247 tests passed.',
      link: '/diq/apps/github',
      read: true,
      created_at: new Date(now - 5 * 3600000).toISOString(),
    },

    // === GOOGLE DRIVE NOTIFICATIONS ===
    {
      id: '10',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'comment',
      entity_type: 'drive',
      title: 'New comment on shared document',
      message: 'Lisa Park commented on "Q4 Strategy Document": "Can we add more details on budget allocation?"',
      actor: {
        id: '7',
        full_name: 'Lisa Park',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      },
      link: '/diq/apps/drive?doc=q4-strategy',
      read: false,
      created_at: new Date(now - 2 * 3600000).toISOString(),
    },
    {
      id: '11',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'drive',
      title: 'Document shared with you',
      message: 'David Brown shared "Engineering Roadmap 2026" with you (Edit access)',
      actor: {
        id: '8',
        full_name: 'David Brown',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      },
      link: '/diq/apps/drive?doc=roadmap-2026',
      read: true,
      created_at: new Date(now - 6 * 3600000).toISOString(),
    },

    // === ZOOM NOTIFICATIONS ===
    {
      id: '12',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'reminder',
      entity_type: 'zoom',
      title: 'Meeting starting in 15 minutes',
      message: 'Weekly Product Sync with Engineering Team - Join link ready',
      link: '/diq/apps/zoom?meeting=weekly-sync',
      read: false,
      created_at: new Date(now - 10 * 60000).toISOString(),
    },
    {
      id: '13',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'zoom',
      title: 'Meeting recording available',
      message: 'Recording for "Design Review Session" is now available to view',
      link: '/diq/apps/zoom?recording=design-review',
      read: true,
      created_at: new Date(now - 24 * 3600000).toISOString(),
    },

    // === CONFLUENCE NOTIFICATIONS ===
    {
      id: '14',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'mention',
      entity_type: 'confluence',
      title: 'Mentioned in "API Documentation"',
      message: 'Amanda Foster mentioned you: "@you please review the authentication section"',
      actor: {
        id: '9',
        full_name: 'Amanda Foster',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
      },
      link: '/diq/apps/confluence?page=api-docs',
      read: false,
      created_at: new Date(now - 3 * 3600000).toISOString(),
    },
    {
      id: '15',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'confluence',
      title: 'Page updated',
      message: 'Tom Chen updated "Onboarding Guide" - 5 changes made',
      actor: {
        id: '10',
        full_name: 'Tom Chen',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TomC',
      },
      link: '/diq/apps/confluence?page=onboarding',
      read: true,
      created_at: new Date(now - 8 * 3600000).toISOString(),
    },

    // === SALESFORCE NOTIFICATIONS ===
    {
      id: '16',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'salesforce',
      title: 'Deal stage updated',
      message: 'Acme Corp Enterprise ($150K) moved to "Negotiation" stage',
      link: '/diq/apps/salesforce?opp=acme-enterprise',
      read: false,
      created_at: new Date(now - 4 * 3600000).toISOString(),
    },
    {
      id: '17',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'reminder',
      entity_type: 'salesforce',
      title: 'Follow-up due today',
      message: 'Scheduled follow-up call with TechStart Inc - Contact: Jennifer Lee',
      link: '/diq/apps/salesforce?opp=techstart',
      read: false,
      created_at: new Date(now - 1 * 3600000).toISOString(),
    },

    // === FIGMA NOTIFICATIONS ===
    {
      id: '18',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'comment',
      entity_type: 'figma',
      title: 'Comment on design file',
      message: 'Priya Sharma left feedback: "Love the new dashboard layout! Can we adjust the spacing?"',
      actor: {
        id: '11',
        full_name: 'Priya Sharma',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      },
      link: '/diq/apps/figma?file=dashboard-v3',
      read: false,
      created_at: new Date(now - 5 * 3600000).toISOString(),
    },
    {
      id: '19',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'figma',
      title: 'Design file shared',
      message: 'Marcus Lee invited you to collaborate on "Mobile App Redesign"',
      actor: {
        id: '12',
        full_name: 'Marcus Lee',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      },
      link: '/diq/apps/figma?file=mobile-redesign',
      read: true,
      created_at: new Date(now - 12 * 3600000).toISOString(),
    },

    // === NOTION NOTIFICATIONS ===
    {
      id: '20',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'mention',
      entity_type: 'notion',
      title: 'Mentioned in "Sprint Planning"',
      message: 'Jennifer Kim assigned you action item: "Review user feedback for v2.1"',
      actor: {
        id: '13',
        full_name: 'Jennifer Kim',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JenK',
      },
      link: '/diq/apps/notion?page=sprint-planning',
      read: false,
      created_at: new Date(now - 6 * 3600000).toISOString(),
    },
    {
      id: '21',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'notion',
      title: 'Database updated',
      message: 'Product Roadmap database has 3 new entries this week',
      link: '/diq/apps/notion?db=roadmap',
      read: true,
      created_at: new Date(now - 24 * 3600000).toISOString(),
    },

    // === LINKEDIN NOTIFICATIONS ===
    {
      id: '22',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'reaction',
      entity_type: 'linkedin',
      title: 'Your post is trending',
      message: 'Your article "AI in Enterprise Software" has 2.4K views and 156 reactions',
      link: '/diq/apps/linkedin?post=ai-enterprise',
      read: true,
      created_at: new Date(now - 10 * 3600000).toISOString(),
    },
    {
      id: '23',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'linkedin',
      title: 'New connection request',
      message: 'Chris O\'Brien, VP of Engineering at TechCorp, wants to connect',
      link: '/diq/apps/linkedin',
      read: true,
      created_at: new Date(now - 18 * 3600000).toISOString(),
    },

    // === AUZMOR OFFICE NOTIFICATIONS ===
    {
      id: '24',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'comment',
      entity_type: 'auzmor-office',
      title: 'New post in Company News',
      message: 'CEO posted: "Exciting announcement coming next week! Stay tuned for big news."',
      link: '/diq/apps/auzmor-office?post=ceo-announcement',
      read: false,
      created_at: new Date(now - 7 * 3600000).toISOString(),
    },
    {
      id: '25',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'reaction',
      entity_type: 'auzmor-office',
      title: 'Your post received recognition',
      message: '12 colleagues reacted to your Q4 team accomplishments post 🎉',
      link: '/diq/apps/auzmor-office?post=q4-accomplishments',
      read: true,
      created_at: new Date(now - 20 * 3600000).toISOString(),
    },

    // === DIQ INTERNAL NOTIFICATIONS ===
    {
      id: '26',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'reminder',
      entity_type: 'diq',
      title: 'Task due tomorrow',
      message: 'Complete quarterly performance review - Due Jan 31',
      link: '/diq/my-day',
      read: false,
      created_at: new Date(now - 3 * 3600000).toISOString(),
    },
    {
      id: '27',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'assignment',
      entity_type: 'diq',
      title: 'Workflow completed',
      message: '"New Employee Onboarding" workflow finished successfully - 8 steps completed',
      link: '/diq/agents',
      read: true,
      created_at: new Date(now - 9 * 3600000).toISOString(),
    },
    {
      id: '28',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'diq',
      title: 'System maintenance scheduled',
      message: 'Planned downtime on Saturday 2am-4am EST for system upgrades.',
      read: true,
      created_at: new Date(now - 48 * 3600000).toISOString(),
    },
    {
      id: '29',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'system',
      entity_type: 'diq',
      title: 'Knowledge base updated',
      message: '15 new articles added to the Engineering documentation space',
      link: '/diq/content',
      read: true,
      created_at: new Date(now - 36 * 3600000).toISOString(),
    },
    {
      id: '30',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'mention',
      entity_type: 'diq',
      title: 'Tagged in company news',
      message: 'Your team was mentioned in "Q4 All-Hands Meeting Highlights"',
      link: '/diq/news/q4-allhands',
      read: true,
      created_at: new Date(now - 72 * 3600000).toISOString(),
    },
  ];
}
