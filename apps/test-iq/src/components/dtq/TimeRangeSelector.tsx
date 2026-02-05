'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

export type TimeRange = '7d' | '30d' | '90d' | '12m';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const options: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '12m', label: '12 Months' },
];

export default memo(function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer"
            style={{
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="time-range-pill"
                className="absolute inset-0 rounded-md"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-accent)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
});
