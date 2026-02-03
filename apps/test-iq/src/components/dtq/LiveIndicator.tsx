'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeAgo } from '@/hooks/useRealTimeSimulation';

interface LiveIndicatorProps {
  lastUpdate: Date;
  isLive: boolean;
  onToggle?: () => void;
}

type ConnectionState = 'connected' | 'stale' | 'disconnected';

export default function LiveIndicator({ lastUpdate, isLive, onToggle }: LiveIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Update current time periodically to recalculate connection state
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Determine connection state based on time since last update
  const connectionState = useMemo((): ConnectionState => {
    if (!isLive) return 'disconnected';
    const timeSinceUpdate = now - lastUpdate.getTime();
    if (timeSinceUpdate < 30000) return 'connected'; // 30 seconds
    if (timeSinceUpdate < 60000) return 'stale'; // 1 minute
    return 'disconnected';
  }, [isLive, now, lastUpdate]);

  const stateConfig = {
    connected: {
      color: 'var(--status-success)',
      bg: 'rgba(52, 211, 153, 0.15)',
      border: 'rgba(52, 211, 153, 0.3)',
      label: 'Live',
      description: 'Real-time data streaming',
    },
    stale: {
      color: 'var(--status-warning)',
      bg: 'rgba(251, 191, 36, 0.15)',
      border: 'rgba(251, 191, 36, 0.3)',
      label: 'Stale',
      description: 'Data may be outdated',
    },
    disconnected: {
      color: 'var(--status-error)',
      bg: 'rgba(248, 113, 113, 0.15)',
      border: 'rgba(248, 113, 113, 0.3)',
      label: 'Paused',
      description: 'Real-time updates paused',
    },
  };

  const config = stateConfig[connectionState];

  return (
    <div className="flex items-center gap-3 relative">
      <motion.button
        onClick={onToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        style={{
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated indicator dot */}
        <div className="relative">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: config.color }}
            animate={
              connectionState === 'connected'
                ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
                : connectionState === 'stale'
                ? { opacity: [1, 0.5, 1] }
                : {}
            }
            transition={{
              duration: connectionState === 'connected' ? 1.5 : 2,
              repeat: Infinity,
            }}
          />

          {/* Ping effect for connected state */}
          {connectionState === 'connected' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: config.color }}
              animate={{
                scale: [1, 2.5],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          )}
        </div>
        {config.label}
      </motion.button>

      {/* Time since update */}
      <motion.span
        className="text-xs"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={formatTimeAgo(lastUpdate)} // Re-animate when time changes
      >
        Updated {formatTimeAgo(lastUpdate)}
      </motion.span>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 px-3 py-2 rounded-lg text-xs z-50 whitespace-nowrap"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: config.color }}
              />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {config.label}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              {config.description}
            </p>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Click to {isLive ? 'pause' : 'resume'} updates
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
