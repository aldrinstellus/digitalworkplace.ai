'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

interface ComparisonRow {
  metric: string;
  traditional: string;
  lowCode: string;
  dtq: string;
}

const comparisonData: ComparisonRow[] = [
  {
    metric: 'Script Maintenance',
    traditional: 'High',
    lowCode: 'Medium',
    dtq: 'None',
  },
  {
    metric: 'UI Change Adaptation',
    traditional: 'Manual rework',
    lowCode: 'Partial',
    dtq: 'Automatic',
  },
  {
    metric: 'Learning Curve',
    traditional: 'Months',
    lowCode: 'Weeks',
    dtq: 'Days',
  },
  {
    metric: 'Execution Speed',
    traditional: 'Sequential',
    lowCode: 'Limited parallel',
    dtq: 'Massively parallel',
  },
  {
    metric: 'AI-Powered Insights',
    traditional: 'None',
    lowCode: 'Basic',
    dtq: 'Deep intelligence',
  },
  {
    metric: 'Deployment Flexibility',
    traditional: 'Tool-dependent',
    lowCode: 'SaaS only',
    dtq: 'Any environment',
  },
  {
    metric: 'Vendor Lock-in',
    traditional: 'High',
    lowCode: 'High',
    dtq: 'Low (Framework)',
  },
];

const keyDifferentiators = [
  'Not a SaaS subscription \u2014 deploys in YOUR environment',
  'No vendor lock-in \u2014 uses open standards',
  'Fully customizable \u2014 adapts to your needs',
  'IP protection \u2014 your data stays yours',
];

export default memo(function CompetitiveComparison() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h2
          className="text-base font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Competitive Differentiation
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Why dTQ
        </p>
      </div>

      {/* Table */}
      <div className="px-5 pt-4 pb-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th
                  className="text-left py-2.5 pr-4 font-medium text-xs uppercase tracking-wider"
                  style={{
                    color: 'var(--text-muted)',
                    position: 'sticky',
                    left: 0,
                    background: 'var(--bg-tertiary)',
                    zIndex: 2,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  Capability
                </th>
                <th
                  className="text-left py-2.5 px-4 font-medium text-xs uppercase tracking-wider"
                  style={{
                    color: 'var(--text-muted)',
                    position: 'sticky',
                    top: 0,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  Traditional Automation
                </th>
                <th
                  className="text-left py-2.5 px-4 font-medium text-xs uppercase tracking-wider"
                  style={{
                    color: 'var(--text-muted)',
                    position: 'sticky',
                    top: 0,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  Low-Code Tools
                </th>
                <th
                  className="text-left py-2.5 px-4 font-semibold text-xs uppercase tracking-wider"
                  style={{
                    color: 'var(--accent-primary)',
                    position: 'sticky',
                    top: 0,
                    background: 'var(--accent-primary-muted)',
                    borderBottom: '1px solid var(--border-subtle)',
                    borderRadius: '8px 8px 0 0',
                  }}
                >
                  dTQ
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <motion.tr
                  key={row.metric}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.06, duration: 0.3 }}
                  className="border-b"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <td
                    className="py-3 pr-4 font-medium whitespace-nowrap"
                    style={{
                      color: 'var(--text-primary)',
                      position: 'sticky',
                      left: 0,
                      background: 'var(--bg-tertiary)',
                      zIndex: 1,
                    }}
                  >
                    {row.metric}
                  </td>
                  <td
                    className="py-3 px-4"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {row.traditional}
                  </td>
                  <td
                    className="py-3 px-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {row.lowCode}
                  </td>
                  <td
                    className="py-3 px-4 font-semibold"
                    style={{
                      color: 'var(--status-success)',
                      background: 'var(--accent-primary-muted)',
                    }}
                  >
                    {row.dtq}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Differentiators */}
      <div className="px-5 pb-5 pt-2">
        <ul className="space-y-2">
          {keyDifferentiators.map((point, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.08, duration: 0.3 }}
              className="flex items-start gap-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--accent-primary)' }}
              />
              {point}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
});
