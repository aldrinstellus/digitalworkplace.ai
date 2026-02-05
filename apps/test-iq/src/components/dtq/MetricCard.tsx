'use client';

import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/lib/motion';

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

  const wrapperProps = interactive
    ? {
        whileTap: { scale: 0.98 },
        onClick,
        className: 'cursor-pointer metric-card-interactive',
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
      <motion.div {...wrapperProps}>
        <div
          className={cn(
            'metric-card relative overflow-hidden rounded-xl p-5 transition-all duration-300',
            size === 'large' && 'p-6',
            isHovered && interactive && 'gradient-border'
          )}
        >
          {/* Accent gradient with CSS transition */}
          <div
            className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
            style={{
              opacity: accentColor || isHovered ? 1 : 0,
              background: accentColor
                ? `linear-gradient(90deg, ${accentColor}, transparent)`
                : 'linear-gradient(90deg, var(--accent-primary), transparent)',
            }}
          />

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
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: accentColor ? `${accentColor}20` : 'var(--bg-elevated)',
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: accentColor || 'var(--text-secondary)' }}
                  />
                </div>
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

          {/* Trend indicator - static */}
          {trend && trendValue && (
            <div className="flex items-center gap-1.5 mt-3">
              <div>
                <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
              </div>
              <span className="text-xs font-medium" style={{ color: trendColor }}>
                {trendValue}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                vs last period
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});
