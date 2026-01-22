"use client";

import { motion } from 'framer-motion';

interface ActiveUsersWidgetProps {
  active24h: number;
  active7d: number;
  active30d: number;
  totalUsers: number;
  loading?: boolean;
}

export function ActiveUsersWidget({
  active24h,
  active7d,
  active30d,
  totalUsers,
  loading,
}: ActiveUsersWidgetProps) {
  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const periods = [
    { label: '24h', value: active24h, color: '#4ade80' },
    { label: '7d', value: active7d, color: '#3b82f6' },
    { label: '30d', value: active30d, color: '#a855f7' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Active Users</h2>
          <p className="text-white/40 text-sm">Users with recent activity</p>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">{totalUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {periods.map((period, index) => {
          const percentage = totalUsers > 0
            ? Math.round((period.value / totalUsers) * 100)
            : 0;

          return (
            <motion.div
              key={period.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-lg p-4"
              style={{ backgroundColor: `${period.color}10` }}
            >
              {/* Background progress circle */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={period.color}
                  strokeWidth="2"
                  strokeDasharray={`${percentage * 2.83} 283`}
                  transform="rotate(-90 50 50)"
                />
              </svg>

              <div className="relative z-10 text-center">
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: period.color }}
                >
                  {period.label}
                </p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  className="text-2xl font-bold text-white"
                >
                  {period.value}
                </motion.p>
                <p className="text-xs text-white/40 mt-1">
                  {percentage}% of total
                </p>
              </div>

              {/* Live indicator for 24h */}
              {period.label === '24h' && active24h > 0 && (
                <div className="absolute top-2 right-2">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: period.color }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: period.color }}
                    />
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
