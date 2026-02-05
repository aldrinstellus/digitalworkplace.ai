'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '100%', subtitle: 'REGRESSION', description: 'Handed to AI Agent' },
  { value: 'ZERO', subtitle: 'XPath/Script', description: 'Knowledge Required' },
  { value: '94%+', subtitle: 'Test Pass', description: 'Rate Achieved' },
  { value: '70%', subtitle: 'REDUCTION', description: 'in script maintenance' },
  { value: 'ZERO', subtitle: 'UI Change', description: 'Rework Required' },
  { value: 'QA TEAM', subtitle: 'REFOCUSED', description: 'on Sprint Testing' },
];

export default memo(function ResultsStatCards() {
  return (
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        Customer Results
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="rounded-xl p-5 text-center"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              {stat.value}
            </p>
            <p
              className="text-xs uppercase tracking-wider mt-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {stat.subtitle}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {stat.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
