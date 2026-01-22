"use client";

import { motion } from 'framer-motion';
import type { CrossAppFlow } from '@/lib/analytics';

interface CrossAppNavigationProps {
  flows: CrossAppFlow[];
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
  main: 'Main',
  dIQ: 'Intranet',
  dSQ: 'Support',
  dCQ: 'Chat',
  dTQ: 'Testing',
};

export function CrossAppNavigation({ flows, loading }: CrossAppNavigationProps) {
  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="h-48 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...flows.map(f => f.navigation_count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a2e] rounded-xl border border-white/10 p-6"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Cross-App Navigation</h2>
        <p className="text-white/40 text-sm">User flow between applications</p>
      </div>

      {flows.length === 0 ? (
        <p className="text-center text-white/40 py-8">No cross-app navigation recorded</p>
      ) : (
        <div className="space-y-3">
          {flows.slice(0, 8).map((flow, index) => {
            const fromColor = projectColors[flow.from_project_code] || '#6b7280';
            const toColor = projectColors[flow.to_project_code] || '#6b7280';
            const fromName = projectNames[flow.from_project_code] || flow.from_project_code;
            const toName = projectNames[flow.to_project_code] || flow.to_project_code;
            const width = (flow.navigation_count / maxCount) * 100;

            return (
              <motion.div
                key={`${flow.from_project_code}-${flow.to_project_code}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="flex items-center gap-3">
                  {/* From app */}
                  <div className="flex items-center gap-1.5 w-20">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: fromColor }}
                    />
                    <span className="text-white/70 text-sm truncate">{fromName}</span>
                  </div>

                  {/* Flow arrow */}
                  <div className="flex-1 relative h-6">
                    <div className="absolute inset-0 flex items-center">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="h-1 rounded-full origin-left"
                        style={{
                          width: `${width}%`,
                          background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
                        }}
                      />
                    </div>

                    {/* Arrow head */}
                    <motion.svg
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.3 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill={toColor}
                      style={{ left: `${width}%`, transform: 'translateX(-100%) translateY(-50%)' }}
                    >
                      <path d="M2 6L8 1V4H12V8H8V11L2 6Z" />
                    </motion.svg>
                  </div>

                  {/* To app */}
                  <div className="flex items-center gap-1.5 w-20 justify-end">
                    <span className="text-white/70 text-sm truncate">{toName}</span>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: toColor }}
                    />
                  </div>

                  {/* Count */}
                  <div className="w-16 text-right">
                    <span className="text-white/50 text-sm group-hover:text-white transition-colors">
                      {flow.navigation_count}x
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Flow diagram visualization */}
      {flows.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/40 text-xs text-center">
            Showing top {Math.min(flows.length, 8)} navigation paths
          </p>
        </div>
      )}
    </motion.div>
  );
}
