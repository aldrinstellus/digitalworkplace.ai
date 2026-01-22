"use client";

import { motion } from 'framer-motion';
import type { AppUsageData } from '@/lib/analytics';

interface AppUsageChartProps {
  appUsage: AppUsageData[];
  loading?: boolean;
}

const projectColors: Record<string, string> = {
  main: '#4ade80',
  dIQ: '#3b82f6',
  dSQ: '#10b981',
  dCQ: '#a855f7',
  dTQ: '#f59e0b',
};

const projectNames: Record<string, string> = {
  main: 'Main Dashboard',
  dIQ: 'Intranet IQ',
  dSQ: 'Support IQ',
  dCQ: 'Chat Core IQ',
  dTQ: 'Test Pilot IQ',
};

export function AppUsageChart({ appUsage, loading }: AppUsageChartProps) {
  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 bg-white/10 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalViews = appUsage.reduce((sum, app) => sum + app.total_views, 0) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">App Usage Breakdown</h2>
        <p className="text-white/40 text-sm">Page views by application</p>
      </div>

      <div className="space-y-4">
        {appUsage.length === 0 ? (
          <p className="text-center text-white/40 py-8">No data available</p>
        ) : (
          appUsage.map((app, index) => {
            const color = projectColors[app.project_code] || '#6b7280';
            const name = projectNames[app.project_code] || app.project_code;
            const percentage = (app.total_views / totalViews) * 100;

            return (
              <motion.div
                key={app.project_code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-white/80 font-medium text-sm">{name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-white/50">
                      {app.unique_users} users
                    </span>
                    <span className="text-white font-medium">
                      {app.percentage}%
                    </span>
                  </div>
                </div>

                <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute inset-y-0 left-0 rounded-lg"
                    style={{ backgroundColor: color, opacity: 0.8 }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-sm font-medium text-white">
                      {app.total_views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-4">
          {appUsage.map(app => (
            <div key={app.project_code} className="flex items-center gap-2 text-xs text-white/50">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: projectColors[app.project_code] || '#6b7280' }}
              />
              {projectNames[app.project_code] || app.project_code}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
