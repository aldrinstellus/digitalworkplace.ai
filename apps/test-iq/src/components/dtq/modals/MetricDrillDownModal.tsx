'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import BaseModal, { ModalSection } from './BaseModal';
import { DailyMetric, Feature } from '@/lib/dtq/types';
import { AnimatedCounter, StaggerContainer, StaggerItem } from '@/lib/motion';

// Custom tooltip component - defined outside to avoid recreation during render
const formatDateForTooltip = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface MetricDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricKey: string;
  metricLabel: string;
  currentValue: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  dailyMetrics: DailyMetric[];
  relatedFeatures?: Feature[];
  previousPeriodValue?: number;
}

export default function MetricDrillDownModal({
  isOpen,
  onClose,
  metricKey,
  metricLabel,
  currentValue,
  unit = '%',
  trend,
  trendValue,
  dailyMetrics,
  relatedFeatures = [],
  previousPeriodValue,
}: MetricDrillDownModalProps) {
  // Early return - don't compute anything if modal is closed
  if (!isOpen) return null;

  // Transform daily metrics based on metric key
  const chartData = dailyMetrics.map(dm => ({
    date: dm.date,
    value: getMetricValue(dm, metricKey),
  }));

  // Calculate statistics
  const values = chartData.map(d => d.value);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  // Category breakdown (mock data for demonstration)
  const categoryBreakdown = [
    { name: 'Authentication', value: 95 },
    { name: 'Core Features', value: 88 },
    { name: 'API', value: 92 },
    { name: 'UI Components', value: 85 },
    { name: 'Data Processing', value: 90 },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length && label) {
      return (
        <div
          className="px-3 py-2 rounded-lg text-sm animate-tooltip-enter"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
          }}
        >
          <p style={{ color: 'var(--text-muted)' }}>{formatDateForTooltip(label)}</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {payload[0].value.toFixed(1)}{unit}
          </p>
        </div>
      );
    }
    return null;
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--status-success)' : trend === 'down' ? 'var(--status-error)' : 'var(--text-muted)';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={metricLabel}
      description="30-day metric history and breakdown"
      size="xl"
    >
      <StaggerContainer>
        {/* Current Value Summary */}
        <StaggerItem>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Current Value */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Current
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter
                  value={typeof currentValue === 'number' ? currentValue : parseFloat(currentValue.toString())}
                  suffix={unit}
                />
              </p>
              {trend && trendValue && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
                  <span className="text-xs" style={{ color: trendColor }}>
                    {trendValue}
                  </span>
                </div>
              )}
            </div>

            {/* 30-Day Average */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                30-Day Avg
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {average.toFixed(1)}{unit}
              </p>
            </div>

            {/* Max */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Peak
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>
                {max.toFixed(1)}{unit}
              </p>
            </div>

            {/* Min */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Low
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--status-error)' }}>
                {min.toFixed(1)}{unit}
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* 30-Day Trend Chart */}
        <StaggerItem>
          <ModalSection title="30-Day Trend">
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-subtle)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateForTooltip}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[Math.floor(min - 5), Math.ceil(max + 5)]}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}${unit}`}
                    />
                    <Tooltip content={renderTooltip} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--accent-primary)"
                      strokeWidth={2}
                      fill="url(#metricGradient)"
                      animationDuration={600}
                      animationBegin={100}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ModalSection>
        </StaggerItem>

        {/* Comparison */}
        {previousPeriodValue !== undefined && (
          <StaggerItem>
            <ModalSection title="Period Comparison">
              <div className="flex items-center gap-4">
                <div
                  className="flex-1 p-4 rounded-xl text-center"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    Previous Period
                  </p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {previousPeriodValue.toFixed(1)}{unit}
                  </p>
                </div>

                <ArrowRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />

                <div
                  className="flex-1 p-4 rounded-xl text-center"
                  style={{
                    background: 'var(--accent-primary-soft)',
                    border: '1px solid var(--border-accent)'
                  }}
                >
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    Current Period
                  </p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    {typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue}{unit}
                  </p>
                </div>

                <div
                  className="flex-1 p-4 rounded-xl text-center"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    Change
                  </p>
                  <p
                    className="text-xl font-semibold"
                    style={{
                      color: typeof currentValue === 'number' && currentValue > previousPeriodValue
                        ? 'var(--status-success)'
                        : 'var(--status-error)'
                    }}
                  >
                    {typeof currentValue === 'number'
                      ? `${currentValue > previousPeriodValue ? '+' : ''}${(currentValue - previousPeriodValue).toFixed(1)}${unit}`
                      : '—'}
                  </p>
                </div>
              </div>
            </ModalSection>
          </StaggerItem>
        )}

        {/* Category Breakdown */}
        <StaggerItem>
          <ModalSection title="Breakdown by Category">
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-subtle)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={120}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div
                              className="px-3 py-2 rounded-lg text-sm"
                              style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-default)',
                              }}
                            >
                              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {payload[0].payload.name}: {payload[0].value}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--accent-primary)"
                      radius={[0, 4, 4, 0]}
                      animationDuration={400}
                      animationBegin={150}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ModalSection>
        </StaggerItem>

        {/* Related Features */}
        {relatedFeatures.length > 0 && (
          <StaggerItem>
            <ModalSection title="Related Features">
              <div className="space-y-2">
                {relatedFeatures.slice(0, 5).map((feature, idx) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>
                      {feature.name}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>
                        Coverage: <span style={{ color: 'var(--text-secondary)' }}>{feature.coverage}%</span>
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Pass Rate: <span style={{ color: 'var(--text-secondary)' }}>{feature.passRate}%</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ModalSection>
          </StaggerItem>
        )}
      </StaggerContainer>
    </BaseModal>
  );
}

// Helper function to get the correct metric value based on key
function getMetricValue(dm: DailyMetric, key: string): number {
  switch (key) {
    case 'passRate':
    case 'pass_rate':
      return dm.passRate;
    case 'firstRunPassRate':
    case 'first_run_pass_rate':
      return dm.firstRunPassRate;
    case 'defectDetection':
    case 'defect_detection':
      return dm.defectDetection;
    case 'effectiveness':
      return dm.effectiveness;
    case 'automationCoverage':
    case 'automation_coverage':
      return dm.automationCoverage;
    default:
      return dm.passRate;
  }
}
