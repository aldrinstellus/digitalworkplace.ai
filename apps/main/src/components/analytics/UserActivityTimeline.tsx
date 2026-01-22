"use client";

import { motion } from 'framer-motion';
import type { ActivityTimelineItem } from '@/lib/analytics';

interface UserActivityTimelineProps {
  activities: ActivityTimelineItem[];
  loading?: boolean;
}

const projectColors: Record<string, string> = {
  main: '#4ade80',
  dIQ: '#3b82f6',
  dSQ: '#10b981',
  dCQ: '#a855f7',
  dTQ: '#f59e0b',
};

const activityIcons: Record<string, string> = {
  session_start: '🚀',
  session_end: '👋',
  page_view: '👁️',
  cross_app_nav: '🔗',
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function UserActivityTimeline({ activities, loading }: UserActivityTimelineProps) {
  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                  <div className="h-2 bg-white/5 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden"
    >
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Activity Timeline</h2>
        <p className="text-white/40 text-sm">Recent user activity across all apps</p>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-center text-white/40 py-8">No recent activity</p>
        ) : (
          <div className="divide-y divide-white/5">
            {activities.map((activity, index) => {
              const color = activity.project_code
                ? projectColors[activity.project_code] || '#6b7280'
                : '#4ade80';

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors"
                >
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    {activityIcons[activity.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">
                        {activity.user_name || activity.user_email.split('@')[0]}
                      </span>
                      <span className="text-white/40 text-sm">
                        {activity.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/30 text-xs">
                        {formatTime(activity.timestamp)}
                      </span>
                      {activity.project_code && (
                        <>
                          <span className="text-white/20">•</span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {activity.project_code}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
