'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { PersonaType } from '@/lib/dtq/types';

interface ROIRow {
  metric: string;
  before: string;
  after: string;
}

const roiData: Record<PersonaType, ROIRow[]> = {
  csuite: [
    { metric: 'Regression Ownership', before: 'QA Team (manual)', after: 'AI Agent (autonomous)' },
    { metric: 'Script Maintenance', before: '70% of QA time', after: '<10% of QA time' },
    { metric: 'Test Automation Engineers', before: 'Fixing scripts', after: 'Actual feature testing' },
    { metric: 'UI Change Impact', before: 'Days of rework', after: 'Zero rework' },
    { metric: 'Bug Leakage', before: 'Frequent', after: 'Rare' },
    { metric: 'QA Focus', before: 'Regression + Sprint', after: 'Sprint testing only' },
  ],
  manager: [
    { metric: 'Regression Ownership', before: 'QA Team (manual)', after: 'AI Agent (autonomous)' },
    { metric: 'Script Maintenance', before: '70% of QA time', after: '<10% of QA time' },
    { metric: 'Test Automation Engineers', before: 'Fixing scripts', after: 'Actual feature testing' },
    { metric: 'UI Change Impact', before: 'Days of rework', after: 'Zero rework' },
    { metric: 'Bug Leakage', before: 'Frequent', after: 'Rare' },
    { metric: 'QA Focus', before: 'Regression + Sprint', after: 'Sprint testing only' },
  ],
  techlead: [
    { metric: 'Regression Ownership', before: 'QA Team (manual)', after: 'AI Agent (autonomous)' },
    { metric: 'Script Maintenance', before: '70% of QA time', after: '<10% of QA time' },
    { metric: 'Test Automation Engineers', before: 'Fixing scripts', after: 'Actual feature testing' },
    { metric: 'UI Change Impact', before: 'Days of rework', after: 'Zero rework' },
    { metric: 'Bug Leakage', before: 'Frequent', after: 'Rare' },
    { metric: 'QA Focus', before: 'Regression + Sprint', after: 'Sprint testing only' },
  ],
};

// Customer testimonial from PRD Slide 10
const TESTIMONIAL = '"Regression is completely handed over to this agent. QA engineers now focus on sprint testing, coordinating with tech leads, and retesting bug fixes."';

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
                      <th className="text-left py-2.5 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Before dTQ
                      </th>
                      <th className="text-left py-2.5 pl-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        After dTQ
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
                        <td className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>
                          {row.before}
                        </td>
                        <td className="py-3 pl-4 font-semibold" style={{ color: 'var(--status-success)' }}>
                          {row.after}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Customer Testimonial — PRD Slide 10 */}
              <div
                className="mt-4 px-4 py-3 rounded-lg text-xs leading-relaxed italic"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  borderLeft: '3px solid var(--accent-primary)',
                }}
              >
                {TESTIMONIAL}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
