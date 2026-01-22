"use client";

import { motion } from 'framer-motion';
import type { SessionRecord } from '@/lib/analytics';

interface SignInHistoryProps {
  sessions: SessionRecord[];
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

function getDeviceIcon(deviceType: string): string {
  switch (deviceType) {
    case 'mobile': return '📱';
    case 'tablet': return '📲';
    default: return '💻';
  }
}

export function SignInHistory({ sessions, loading }: SignInHistoryProps) {
  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-white/5 rounded"></div>
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
        <h2 className="text-lg font-semibold text-white">Sign-In History</h2>
        <p className="text-white/40 text-sm">Recent user sessions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-white/50 text-sm font-medium">User</th>
              <th className="text-left p-4 text-white/50 text-sm font-medium">Time</th>
              <th className="text-left p-4 text-white/50 text-sm font-medium">Duration</th>
              <th className="text-left p-4 text-white/50 text-sm font-medium">Device</th>
              <th className="text-left p-4 text-white/50 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/40">
                  No sessions recorded yet
                </td>
              </tr>
            ) : (
              sessions.map((session, index) => (
                <motion.tr
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                        {session.user_name?.[0]?.toUpperCase() || session.user_email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {session.user_name || 'Unknown'}
                        </p>
                        <p className="text-white/40 text-xs">{session.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white/70 text-sm">
                    {formatTime(session.started_at)}
                  </td>
                  <td className="p-4 text-white/70 text-sm">
                    {formatDuration(session.duration_seconds)}
                  </td>
                  <td className="p-4 text-sm">
                    <span className="flex items-center gap-2 text-white/60">
                      <span>{getDeviceIcon(session.device_type)}</span>
                      <span>{session.browser}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    {session.is_active ? (
                      <span className="flex items-center gap-1.5 text-green-400 text-sm">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <span className="text-white/40 text-sm">Ended</span>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
