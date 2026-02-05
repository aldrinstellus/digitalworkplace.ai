'use client';

import { useState, useCallback, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  title: string;
  data: ChartDataPoint[];
  type?: 'line' | 'area';
  color?: string;
  delay?: number;
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  interactive?: boolean;
}

// Helper to format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Custom tooltip render function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label, interactive }: any) {
  if (active && payload && payload.length && label) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        <p style={{ color: 'var(--text-muted)' }}>{formatDate(label)}</p>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {payload[0].value.toFixed(1)}%
        </p>
        {interactive && (
          <p className="text-xs mt-1" style={{ color: 'var(--accent-primary)' }}>
            Click for details
          </p>
        )}
      </div>
    );
  }
  return null;
}

// Simple active dot
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartActiveDot({ cx, cy, color, interactive }: any) {
  if (!cx || !cy) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.2} />
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        stroke="var(--bg-secondary)"
        strokeWidth={2}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      />
    </g>
  );
}

export default memo(function TrendChart({
  title,
  data,
  type = 'line',
  color = 'var(--accent-primary)',
  delay = 0,
  onDataPointClick,
  interactive = true,
}: TrendChartProps) {
  const [isChartHovered, setIsChartHovered] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = useCallback((chartData: any) => {
    if (interactive && onDataPointClick && chartData?.activePayload && chartData.activePayload.length > 0) {
      onDataPointClick(chartData.activePayload[0].payload as ChartDataPoint);
    }
  }, [interactive, onDataPointClick]);

  // Unique gradient ID based on title
  const gradientId = `gradient-${title.replace(/\s/g, '')}`;

  // Single-pass stats calculation (avoids 3 array iterations from spread operator)
  const stats = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (const d of data) {
      if (d.value < min) min = d.value;
      if (d.value > max) max = d.value;
      sum += d.value;
    }
    return { min, max, avg: sum / data.length };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card rounded-xl p-5 transition-all duration-300"
      onMouseEnter={() => setIsChartHovered(true)}
      onMouseLeave={() => setIsChartHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </h3>
        {interactive && (
          <motion.span
            className="text-xs px-2 py-1 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: isChartHovered ? 1 : 0 }}
            style={{
              background: 'var(--accent-primary-soft)',
              color: 'var(--accent-primary)',
            }}
          >
            Click points to drill down
          </motion.span>
        )}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart
              data={data}
              onClick={handleClick}
              style={{ cursor: interactive ? 'crosshair' : 'default' }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="50%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={(props) => <ChartTooltip {...props} interactive={interactive} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                animationDuration={500}
                activeDot={(props) => <ChartActiveDot {...props} color={color} interactive={interactive} />}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={data}
              onClick={handleClick}
              style={{ cursor: interactive ? 'crosshair' : 'default' }}
            >
              <defs>
                <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={color} stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={(props) => <ChartTooltip {...props} interactive={interactive} />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={`url(#${gradientId}-line)`}
                strokeWidth={2}
                dot={false}
                activeDot={(props) => <ChartActiveDot {...props} color={color} interactive={interactive} />}
                animationDuration={500}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart footer with quick stats */}
      <motion.div
        className="flex items-center justify-between mt-3 pt-3 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
      >
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Min: </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {stats.min.toFixed(1)}%
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Max: </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {stats.max.toFixed(1)}%
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Avg: </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {stats.avg.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {data.length} data points
        </div>
      </motion.div>
    </motion.div>
  );
});
