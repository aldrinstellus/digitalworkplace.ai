'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Users, Code } from 'lucide-react';
import { PersonaType } from '@/lib/dtq/types';

interface PersonaCardProps {
  persona: PersonaType;
}

const personaData = {
  csuite: {
    name: 'C-Suite Executive',
    description: 'Strategic business metrics and ROI insights',
    icon: Crown,
    gradient: 'from-violet-500/20 to-purple-600/20',
    iconBg: 'var(--chart-tertiary)',
  },
  manager: {
    name: 'QA Manager',
    description: 'Team performance and operational effectiveness',
    icon: Users,
    gradient: 'from-pink-500/20 to-rose-600/20',
    iconBg: 'var(--accent-primary)',
  },
  techlead: {
    name: 'Tech Lead',
    description: 'Technical deep dive and engineering metrics',
    icon: Code,
    gradient: 'from-cyan-500/20 to-teal-600/20',
    iconBg: 'var(--chart-secondary)',
  },
};

export default memo(function PersonaCard({ persona }: PersonaCardProps) {
  const data = personaData[persona];
  const Icon = data.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={persona}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        className="card relative overflow-hidden rounded-xl p-5"
      >
        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${data.gradient}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.5 }}
        />

        {/* Static gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(circle at 30% 30%, ${data.iconBg}30, transparent 50%)` }}
        />

        <div className="relative flex items-center gap-4">
          {/* Icon with rotate + scale animation on change */}
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: data.iconBg }}
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>

          <div className="flex-1">
            <motion.div
              className="flex items-center gap-2 mb-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Active Persona View
              </p>
            </motion.div>
            <motion.h2
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              {data.name}
            </motion.h2>
            <motion.p
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {data.description}
            </motion.p>
          </div>

          {/* Live badge with CSS-only pulse */}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--status-success)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--status-success)' }}>
              Live Dashboard
            </span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
