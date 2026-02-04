'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, ChevronDown, X } from 'lucide-react';
import { Feature } from '@/lib/dtq/types';

interface HighRiskBannerProps {
  features: Feature[];
  onFeatureClick?: (feature: Feature) => void;
}

export default function HighRiskBanner({ features, onFeatureClick }: HighRiskBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  if (features.length === 0 || isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative overflow-hidden rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.1), rgba(251, 191, 36, 0.05))',
        border: '1px solid rgba(248, 113, 113, 0.2)',
      }}
    >
      {/* Static red warning bar */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l"
        style={{ background: 'var(--risk-high)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* Critical icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(248, 113, 113, 0.2)' }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: 'var(--risk-high)' }} />
          </div>

          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              High Risk Features Requiring Attention
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {features.length} feature{features.length !== 1 ? 's' : ''} with elevated risk scores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Collapse/Expand toggle */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.05)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </motion.div>
          </motion.button>

          {/* Dismiss button */}
          <motion.button
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.05)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </motion.button>
        </div>
      </div>

      {/* Feature list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {features.map((feature, index) => (
                <motion.button
                  key={feature.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onFeatureClick?.(feature)}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-left group"
                  style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                  whileHover={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    x: 4,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ opacity: 0.5 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <ChevronRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        style={{ color: 'var(--accent-primary)' }}
                      />
                    </motion.div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {feature.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Coverage: </span>
                      <span style={{ color: 'var(--text-primary)' }}>{feature.coverage}%</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Risk: </span>
                      <span style={{ color: 'var(--risk-high)' }}>
                        {feature.riskScore}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Defects: </span>
                      <span style={{ color: 'var(--risk-high)' }}>{feature.openDefects}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
