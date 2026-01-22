"use client";

import { motion } from 'framer-motion';
import type { UserMetrics } from '@/lib/analytics';

interface TimeOnSiteChartProps {
  userMetrics: UserMetrics[];
  loading?: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export function TimeOnSiteChart({ userMetrics, loading }: TimeOnSiteChartProps) {
  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 bg-white/5 rounded w-24"></div>
                <div className="h-6 bg-white/10 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxTime = Math.max(...userMetrics.map(u => u.total_time_seconds), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Time on Site</h2>
        <p className="text-white/40 text-sm">Top users by session duration</p>
      </div>

      <div className="space-y-4">
        {userMetrics.length === 0 ? (
          <p className="text-center text-white/40 py-8">No data available</p>
        ) : (
          userMetrics.slice(0, 10).map((user, index) => {
            const percentage = (user.total_time_seconds / maxTime) * 100;

            return (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-white/40 text-xs w-4">{index + 1}</span>
                    <span className="text-white/80 text-sm truncate">
                      {user.user_name || user.user_email.split('@')[0]}
                    </span>
                  </div>
                  <span className="text-white/60 text-sm font-medium ml-2">
                    {formatDuration(user.total_time_seconds)}
                  </span>
                </div>

                <div className="relative h-6 bg-white/5 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <span className="text-xs text-white/60 group-hover:text-white transition-colors">
                      {user.total_sessions} sessions
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
