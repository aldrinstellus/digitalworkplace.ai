'use client';

import { memo, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { DailyMetric } from '@/lib/dtq/types';
import type { DetectedChart } from '@/lib/dtq/chat-chart-detector';

interface MiniSparklineProps {
  chart: DetectedChart;
  dailyMetrics: DailyMetric[];
}

export default memo(function MiniSparkline({ chart, dailyMetrics }: MiniSparklineProps) {
  const data = useMemo(() => {
    return dailyMetrics.slice(-7).map((m) => ({
      value: m[chart.metricKey],
    }));
  }, [dailyMetrics, chart.metricKey]);

  const currentValue = data.length > 0 ? data[data.length - 1].value : 0;
  const gradientId = `sparkline-${chart.metricKey}`;

  return (
    <div
      className="rounded-lg px-3 py-2 mt-1.5"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        width: 180,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
          {chart.label}
        </span>
        <span className="text-[11px] font-semibold" style={{ color: chart.color }}>
          {currentValue.toFixed(1)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={36}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chart.color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={chart.color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={chart.color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
