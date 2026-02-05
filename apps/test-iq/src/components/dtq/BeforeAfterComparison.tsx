'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { PersonaType } from '@/lib/dtq/types';
import { AnimatedCounter } from '@/lib/motion';

interface ROIRow {
  metric: string;
  before: string;
  afterValue: number;
  afterSuffix: string;
  improvement: string;
  improvementPositive: boolean;
}

const roiData: Record<PersonaType, ROIRow[]> = {
  csuite: [
    { metric: 'Manual Test Scripts', before: '2,400+', afterValue: 0, afterSuffix: '', improvement: '-100%', improvementPositive: true },
    { metric: 'Script Maintenance', before: '40 hrs/week', afterValue: 12, afterSuffix: ' hrs/week', improvement: '-70%', improvementPositive: true },
    { metric: 'Test Pass Rate', before: '78%', afterValue: 94.2, afterSuffix: '%', improvement: '+20.8%', improvementPositive: true },
    { metric: 'Regression Cycle Time', before: '3 days', afterValue: 4, afterSuffix: ' hours', improvement: '-94%', improvementPositive: true },
    { metric: 'UI Change Rework', before: '16 hrs/sprint', afterValue: 0, afterSuffix: ' hrs', improvement: '-100%', improvementPositive: true },
    { metric: 'QA Coverage', before: '43%', afterValue: 92, afterSuffix: '%', improvement: '+114%', improvementPositive: true },
  ],
  manager: [
    { metric: 'Manual Test Scripts', before: '2,400+', afterValue: 0, afterSuffix: '', improvement: '-100%', improvementPositive: true },
    { metric: 'Script Maintenance', before: '40 hrs/week', afterValue: 12, afterSuffix: ' hrs/week', improvement: '-70%', improvementPositive: true },
    { metric: 'Test Pass Rate', before: '78%', afterValue: 94.2, afterSuffix: '%', improvement: '+20.8%', improvementPositive: true },
    { metric: 'Regression Cycle Time', before: '3 days', afterValue: 4, afterSuffix: ' hours', improvement: '-94%', improvementPositive: true },
    { metric: 'Team Productivity', before: '60%', afterValue: 91, afterSuffix: '%', improvement: '+52%', improvementPositive: true },
    { metric: 'QA Coverage', before: '43%', afterValue: 92, afterSuffix: '%', improvement: '+114%', improvementPositive: true },
  ],
  techlead: [
    { metric: 'Manual Test Scripts', before: '2,400+', afterValue: 0, afterSuffix: '', improvement: '-100%', improvementPositive: true },
    { metric: 'CI/CD Pipeline Time', before: '45 min', afterValue: 12, afterSuffix: ' min', improvement: '-73%', improvementPositive: true },
    { metric: 'Test Pass Rate', before: '78%', afterValue: 94.2, afterSuffix: '%', improvement: '+20.8%', improvementPositive: true },
    { metric: 'Regression Cycle Time', before: '3 days', afterValue: 4, afterSuffix: ' hours', improvement: '-94%', improvementPositive: true },
    { metric: 'Flaky Test Rate', before: '12%', afterValue: 1.3, afterSuffix: '%', improvement: '-89%', improvementPositive: true },
    { metric: 'Code Coverage', before: '58%', afterValue: 93, afterSuffix: '%', improvement: '+60%', improvementPositive: true },
  ],
};

export default memo(function BeforeAfterComparison({ persona }: { persona: PersonaType }) {
  const [expanded, setExpanded] = useState(true);
  const rows = roiData[persona];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
        style={{ color: 'var(--text-primary)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--status-success-bg)' }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
          </div>
          <div className="text-left">
            <h2 className="text-base font-semibold">Before / After dTQ</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ROI impact comparison
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      {/* Table */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <th className="text-left py-2.5 pr-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Metric
                      </th>
                      <th className="text-right py-2.5 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Before
                      </th>
                      <th className="text-right py-2.5 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        After
                      </th>
                      <th className="text-right py-2.5 pl-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Impact
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <motion.tr
                        key={row.metric}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.3 }}
                        className="border-b"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <td className="py-3 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {row.metric}
                        </td>
                        <td className="py-3 px-4 text-right" style={{ color: 'var(--text-muted)' }}>
                          {row.before}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <AnimatedCounter
                            value={row.afterValue}
                            suffix={row.afterSuffix}
                            duration={0.8}
                          />
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              background: row.improvementPositive
                                ? 'var(--status-success-bg)'
                                : 'var(--status-error-bg)',
                              color: row.improvementPositive
                                ? 'var(--status-success)'
                                : 'var(--status-error)',
                            }}
                          >
                            {row.improvementPositive ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            {row.improvement}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
