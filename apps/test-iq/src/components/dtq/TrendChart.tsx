'use client';

import { useState, useCallback, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length && label) {
    return (
      <div
        className="px-3.5 py-2.5 rounded-xl text-sm backdrop-blur-sm"
        style={{
          background: 'rgba(20, 20, 32, 0.95)',
          border: '1px solid var(--border-accent)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 51, 102, 0.1)',
        }}
      >
        <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>
          {formatDate(label)}
        </p>
        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

// Custom dot that only renders on the last data point
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LastPointDot({ cx, cy, index, dataLength, color }: any) {
  if (index !== dataLength - 1 || !cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.1}>
        <animate
          attributeName="r"
          values="10;16;10"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.15;0.05;0.15"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="var(--bg-card)"
        strokeWidth={2}
      />
    </g>
  );
}

// Active dot on hover
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActiveDot({ cx, cy, color }: any) {
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.2} />
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        stroke="var(--bg-card)"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
      />
    </g>
  );
}

export default memo(function TrendChart({
  title,
  data,
  color = 'var(--accent-primary)',
  delay = 0,
  onDataPointClick,
  interactive = true,
}: TrendChartProps) {
  const [isHovered, setIsHovered] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = useCallback((chartData: any) => {
    if (interactive && onDataPointClick && chartData?.activePayload?.[0]) {
      onDataPointClick(chartData.activePayload[0].payload as ChartDataPoint);
    }
  }, [interactive, onDataPointClick]);

  const gradientId = useMemo(() => `grad-${title.replace(/\s/g, '')}`, [title]);

  // Single-pass stats + trend calculation
  const { min, max, avg, current, previous, changePercent, isPositive } = useMemo(() => {
    let mn = Infinity, mx = -Infinity, sum = 0;
    for (const d of data) {
      if (d.value < mn) mn = d.value;
      if (d.value > mx) mx = d.value;
      sum += d.value;
    }
    const cur = data.length > 0 ? data[data.length - 1].value : 0;
    const prev = data.length > 1 ? data[0].value : cur;
    const change = prev !== 0 ? ((cur - prev) / prev) * 100 : 0;
    return {
      min: mn,
      max: mx,
      avg: sum / (data.length || 1),
      current: cur,
      previous: prev,
      changePercent: Math.abs(change),
      isPositive: cur >= prev,
    };
  }, [data]);

  // Tighten Y-axis domain around the data range for a more dramatic visual
  const yDomain = useMemo(() => {
    const padding = Math.max((max - min) * 0.3, 2);
    return [
      Math.max(0, Math.floor(min - padding)),
      Math.min(100, Math.ceil(max + padding)),
    ];
  }, [min, max]);

  const dataLength = data.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card rounded-xl overflow-hidden transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with current value */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {title}
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {current.toFixed(1)}%
              </span>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: isPositive ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
                  color: isPositive ? 'var(--status-success)' : 'var(--status-error)',
                }}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {changePercent.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Mini stats */}
          <div className="text-right space-y-0.5">
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>Avg </span>
              <span style={{ color: 'var(--text-secondary)' }}>{avg.toFixed(1)}%</span>
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>Range </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {min.toFixed(1)} – {max.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            onClick={handleClick}
            style={{ cursor: interactive && isHovered ? 'crosshair' : 'default' }}
            margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="40%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="var(--text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={4}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain}
              stroke="var(--text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                stroke: 'var(--border-accent)',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />
            <ReferenceLine
              y={avg}
              stroke="var(--text-disabled)"
              strokeDasharray="6 4"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              animationDuration={600}
              activeDot={(props) => <ActiveDot {...props} color={color} />}
              dot={(props) => (
                <LastPointDot {...props} dataLength={dataLength} color={color} />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-4">
          {/* Mini bar visualization for min/avg/max */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-[2px] h-3">
              <div className="w-[3px] rounded-full" style={{ height: '40%', background: 'var(--text-disabled)' }} />
              <div className="w-[3px] rounded-full" style={{ height: '70%', background: color, opacity: 0.6 }} />
              <div className="w-[3px] rounded-full" style={{ height: '100%', background: color }} />
            </div>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {min.toFixed(1)} – {max.toFixed(1)}%
            </span>
          </div>
        </div>
        <span className="text-[11px]" style={{ color: 'var(--text-disabled)' }}>
          {data.length} data points
        </span>
      </div>
    </motion.div>
  );
});
