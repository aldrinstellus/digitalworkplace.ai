'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Play, Rocket, Globe } from 'lucide-react';

const nextSteps = [
  {
    icon: Play,
    title: 'See It In Action',
    description: 'Request a live demonstration with YOUR application',
    button: 'Schedule Demo',
  },
  {
    icon: Rocket,
    title: 'Proof of Value',
    description:
      '4-6 week pilot program with measurable outcomes and low-risk evaluation',
    button: 'Start Pilot',
  },
  {
    icon: Globe,
    title: 'Available On',
    description: 'Trade Winds Marketplace (Coming Soon) and Direct Engagement',
    button: null,
  },
];

export default memo(function NextStepsCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Next Steps
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nextSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              className="rounded-xl p-5"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: 'var(--accent-primary)' }}
                  />
                </div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {step.title}
                </h3>
              </div>

              <p
                className="text-sm mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                {step.description}
              </p>

              {step.button && (
                <button
                  className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {step.button}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
});
