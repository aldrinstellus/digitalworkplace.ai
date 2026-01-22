"use client";

import { motion } from 'framer-motion';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'green' | 'blue' | 'purple' | 'yellow' | 'cyan';
  onClick?: () => void;
}

const colorClasses = {
  green: {
    bg: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  blue: {
    bg: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  yellow: {
    bg: 'from-yellow-500/20 to-yellow-600/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
  },
  cyan: {
    bg: 'from-cyan-500/20 to-cyan-600/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
  },
};

export function AnalyticsCard({
  title,
  value,
  icon,
  trend,
  color = 'green',
  onClick,
}: AnalyticsCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
      className={`
        bg-gradient-to-br ${colors.bg} ${colors.border} border rounded-xl p-5
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/50 text-sm font-medium">{title}</span>
        {icon && <span className={`${colors.text}`}>{icon}</span>}
      </div>

      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">{value}</span>

        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.direction === 'up' ? 'text-green-400' :
            trend.direction === 'down' ? 'text-red-400' :
            'text-white/50'
          }`}>
            {trend.direction === 'up' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {trend.direction === 'down' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
