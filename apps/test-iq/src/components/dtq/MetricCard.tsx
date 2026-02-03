'use client';

import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter, ScaleOnHover } from '@/lib/motion';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  delay?: number;
  size?: 'default' | 'large';
  accentColor?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default memo(function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  delay = 0,
  size = 'default',
  accentColor,
  onClick,
  interactive = true,
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--status-success)' : trend === 'down' ? 'var(--status-error)' : 'var(--text-muted)';

  // Parse numeric value for animation
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
  const isNumeric = !isNaN(numericValue);
  const unit = typeof value === 'string' ? value.replace(/[0-9.-]/g, '').trim() : '';

  // Mark as animated after initial render
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), (delay + 1) * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const CardWrapper = interactive ? ScaleOnHover : motion.div;
  const wrapperProps = interactive
    ? {
        scale: 1.02,
        glowColor: accentColor ? `${accentColor}30` : 'rgba(255, 51, 102, 0.15)',
        onClick,
        className: 'cursor-pointer',
      }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardWrapper {...wrapperProps}>
        <div
          className={cn(
            'metric-card relative overflow-hidden rounded-xl p-5 transition-all duration-300',
            size === 'large' && 'p-6',
            isHovered && interactive && 'gradient-border'
          )}
        >
          {/* Accent gradient - animated on hover */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1"
            initial={{ opacity: accentColor ? 1 : 0 }}
            animate={{
              opacity: accentColor || isHovered ? 1 : 0,
              background: isHovered
                ? `linear-gradient(90deg, ${accentColor || 'var(--accent-primary)'}, var(--chart-secondary), ${accentColor || 'var(--accent-primary)'})`
                : `linear-gradient(90deg, ${accentColor || 'var(--accent-primary)'}, transparent)`,
            }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundSize: isHovered ? '200% 100%' : '100% 100%',
            }}
          />

          {/* Hover glow effect */}
          {isHovered && interactive && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: `radial-gradient(circle at 50% 0%, ${accentColor || 'var(--accent-primary)'}15, transparent 70%)`,
              }}
            />
          )}

          <div className="flex items-start justify-between relative">
            <div className="space-y-2">
              <p
                className={cn(
                  'text-sm font-medium',
                  size === 'large' && 'text-base'
                )}
                style={{ color: 'var(--text-secondary)' }}
              >
                {label}
              </p>
              <div className="relative">
                <motion.p
                  className={cn(
                    'text-2xl font-bold tracking-tight',
                    size === 'large' && 'text-3xl'
                  )}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {isNumeric && hasAnimated ? (
                    <AnimatedCounter
                      value={numericValue}
                      suffix={unit}
                      duration={0.5}
                    />
                  ) : isNumeric ? (
                    <AnimatedCounter
                      value={numericValue}
                      suffix={unit}
                      duration={1}
                    />
                  ) : (
                    value
                  )}
                </motion.p>
              </div>
              {subtitle && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {Icon && (
                <motion.div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: accentColor ? `${accentColor}20` : 'var(--bg-elevated)',
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: accentColor || 'var(--text-secondary)' }}
                  />
                </motion.div>
              )}

              {/* Drill-down indicator */}
              {interactive && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight
                    className="w-5 h-5"
                    style={{ color: 'var(--accent-primary)' }}
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Trend indicator with bounce animation - reduced frequency for performance */}
          {trend && trendValue && (
            <div className="flex items-center gap-1.5 mt-3">
              <motion.div
                animate={trend !== 'stable' ? {
                  y: trend === 'up' ? [0, -3, 0] : [0, 3, 0],
                } : {}}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: 'easeInOut',
                }}
              >
                <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
              </motion.div>
              <span className="text-xs font-medium" style={{ color: trendColor }}>
                {trendValue}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                vs last period
              </span>
            </div>
          )}
        </div>
      </CardWrapper>
    </motion.div>
  );
});
