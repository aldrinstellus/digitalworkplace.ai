'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

const phases = [
  {
    number: 1,
    title: 'AI Readiness Assessment',
    timeline: 'Week 1-2',
    items: [
      'Document standardization',
      'Integration assessment',
      'Readiness report',
    ],
  },
  {
    number: 2,
    title: 'Context Layer Setup',
    timeline: 'Week 3-4',
    items: [
      'Knowledge base configuration',
      'Prompt engineering',
      'Initial test runs',
    ],
  },
  {
    number: 3,
    title: 'Deploy & Onboard',
    timeline: 'Week 5-6',
    items: [
      'Deploy to environment',
      'Train users',
      'Go-live',
    ],
  },
  {
    number: 4,
    title: 'Scale & Optimize',
    timeline: 'Ongoing',
    items: [
      'Add features',
      'Tune prompts',
      'Expand coverage',
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default memo(function ImplementationPhases() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="card rounded-xl p-5"
    >
      {/* Section Header */}
      <div className="text-center mb-6">
        <motion.p
          variants={cardVariants}
          className="text-xs font-medium uppercase tracking-wider mb-1"
          style={{ color: 'var(--accent-primary)' }}
        >
          Getting Started with dTQ
        </motion.p>
        <motion.h2
          variants={cardVariants}
          className="text-lg font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Implementation Phases
        </motion.h2>
      </div>

      {/* Phase Cards Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 relative"
      >
        {phases.map((phase, idx) => (
          <motion.div
            key={phase.number}
            variants={cardVariants}
            className="relative flex flex-col"
          >
            {/* Connecting line (desktop only, between cards) */}
            {idx < phases.length - 1 && (
              <div
                className="hidden md:block absolute top-8 -right-3 w-6 h-px"
                style={{ backgroundColor: 'var(--border-subtle)' }}
              />
            )}

            {/* Card */}
            <div
              className="rounded-xl p-5 flex-1 flex flex-col"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              {/* Phase Number Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#fff',
                  }}
                >
                  {phase.number}
                </div>
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {phase.timeline}
                </span>
              </div>

              {/* Title */}
              <h3
                className="text-base font-semibold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {phase.title}
              </h3>

              {/* Divider */}
              <div
                className="w-full h-px mb-3"
                style={{ backgroundColor: 'var(--border-subtle)' }}
              />

              {/* Bullet Items */}
              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Quote */}
      <motion.div
        variants={cardVariants}
        className="text-center mt-6 max-w-2xl mx-auto"
      >
        <p
          className="text-sm italic"
          style={{ color: 'var(--text-muted)' }}
        >
          &ldquo;If you&apos;re not ready to actually use an agent, you better not even buy it.&rdquo;
        </p>
      </motion.div>
    </motion.section>
  );
});
