'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  Activity,
  Info,
} from 'lucide-react';
import BaseModal, { ModalSection } from './BaseModal';
import { AnimatedCounter, StaggerContainer, StaggerItem } from '@/lib/motion';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface ChartDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataPoint: ChartDataPoint | null;
  metricLabel: string;
  unit?: string;
  allData?: ChartDataPoint[];
}

export default function ChartDrillDownModal({
  isOpen,
  onClose,
  dataPoint,
  metricLabel,
  unit = '%',
  allData = [],
}: ChartDrillDownModalProps) {
  // Early return - don't compute anything if modal is closed
  if (!isOpen || !dataPoint) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Find the index of the current data point
  const currentIndex = allData.findIndex(d => d.date === dataPoint.date);
  const previousDay = currentIndex > 0 ? allData[currentIndex - 1] : null;
  const nextDay = currentIndex < allData.length - 1 ? allData[currentIndex + 1] : null;

  // Calculate change from previous day
  const changeFromPrevious = previousDay ? dataPoint.value - previousDay.value : 0;
  const changePercent = previousDay ? ((changeFromPrevious / previousDay.value) * 100) : 0;

  // Calculate average
  const average = allData.length > 0
    ? allData.reduce((sum, d) => sum + d.value, 0) / allData.length
    : dataPoint.value;

  // Determine if above or below average
  const vsAverage = dataPoint.value - average;

  // Get trend
  const trend = changeFromPrevious > 0 ? 'up' : changeFromPrevious < 0 ? 'down' : 'stable';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--status-success)' : trend === 'down' ? 'var(--status-error)' : 'var(--text-muted)';

  // Contributing factors (mock data for demonstration)
  const factors = [
    {
      name: 'Test Suite Execution',
      impact: dataPoint.value >= average ? 'positive' : 'negative',
      description: 'Automated test runs completed successfully',
    },
    {
      name: 'Code Changes',
      impact: changeFromPrevious > 0 ? 'positive' : changeFromPrevious < 0 ? 'negative' : 'neutral',
      description: `${Math.abs(Math.round(changeFromPrevious * 10))} commits merged`,
    },
    {
      name: 'Bug Fixes',
      impact: 'positive',
      description: 'Critical defects resolved',
    },
    {
      name: 'New Features',
      impact: 'neutral',
      description: 'Feature additions under test coverage',
    },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={formatDate(dataPoint.date)}
      description={`${metricLabel} data point details`}
      size="lg"
    >
      <StaggerContainer>
        {/* Main Value Display */}
        <StaggerItem>
          <div
            className="p-6 rounded-xl text-center mb-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary-soft), var(--bg-tertiary))',
              border: '1px solid var(--border-accent)',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 30% 30%, var(--accent-primary-soft) 0%, transparent 50%)',
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {formatShortDate(dataPoint.date)}
                </span>
              </div>
              <p className="text-5xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
                <AnimatedCounter value={dataPoint.value} suffix={unit} duration={0.8} />
              </p>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                {metricLabel}
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* Change Analysis */}
        <StaggerItem>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Change from Previous */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendIcon className="w-4 h-4" style={{ color: trendColor }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  vs Previous Day
                </span>
              </div>
              <p className="text-xl font-bold" style={{ color: trendColor }}>
                {changeFromPrevious >= 0 ? '+' : ''}{changeFromPrevious.toFixed(1)}{unit}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}% change
              </p>
            </div>

            {/* vs Average */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4" style={{ color: 'var(--chart-secondary)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  vs Average
                </span>
              </div>
              <p
                className="text-xl font-bold"
                style={{ color: vsAverage >= 0 ? 'var(--status-success)' : 'var(--status-error)' }}
              >
                {vsAverage >= 0 ? '+' : ''}{vsAverage.toFixed(1)}{unit}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Avg: {average.toFixed(1)}{unit}
              </p>
            </div>

            {/* 30-Day Position */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" style={{ color: 'var(--chart-tertiary)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Percentile
                </span>
              </div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {calculatePercentile(dataPoint.value, allData.map(d => d.value))}th
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                In 30-day range
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* Adjacent Days */}
        {(previousDay || nextDay) && (
          <StaggerItem>
            <ModalSection title="Context">
              <div className="flex items-center gap-2">
                {previousDay && (
                  <div
                    className="flex-1 p-3 rounded-lg"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      Previous: {formatShortDate(previousDay.date)}
                    </p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {previousDay.value.toFixed(1)}{unit}
                    </p>
                  </div>
                )}

                <div
                  className="flex-1 p-3 rounded-lg"
                  style={{
                    background: 'var(--accent-primary-soft)',
                    border: '1px solid var(--border-accent)',
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    Selected: {formatShortDate(dataPoint.date)}
                  </p>
                  <p className="text-lg font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    {dataPoint.value.toFixed(1)}{unit}
                  </p>
                </div>

                {nextDay && (
                  <div
                    className="flex-1 p-3 rounded-lg"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      Next: {formatShortDate(nextDay.date)}
                    </p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {nextDay.value.toFixed(1)}{unit}
                    </p>
                  </div>
                )}
              </div>
            </ModalSection>
          </StaggerItem>
        )}

        {/* Contributing Factors */}
        <StaggerItem>
          <ModalSection title="Contributing Factors">
            <div className="space-y-2">
              {factors.map((factor, idx) => (
                <motion.div
                  key={factor.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          factor.impact === 'positive'
                            ? 'var(--status-success)'
                            : factor.impact === 'negative'
                            ? 'var(--status-error)'
                            : 'var(--text-muted)',
                      }}
                    />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {factor.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {factor.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background:
                        factor.impact === 'positive'
                          ? 'var(--status-success-bg)'
                          : factor.impact === 'negative'
                          ? 'var(--status-error-bg)'
                          : 'var(--bg-elevated)',
                      color:
                        factor.impact === 'positive'
                          ? 'var(--status-success)'
                          : factor.impact === 'negative'
                          ? 'var(--status-error)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {factor.impact === 'positive' ? 'Positive' : factor.impact === 'negative' ? 'Negative' : 'Neutral'}
                  </div>
                </motion.div>
              ))}
            </div>
          </ModalSection>
        </StaggerItem>

        {/* Info Note */}
        <StaggerItem>
          <div
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{ background: 'var(--status-info-bg)' }}
          >
            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--status-info)' }} />
            <p className="text-sm" style={{ color: 'var(--status-info)' }}>
              Click on other data points in the chart to compare different dates.
            </p>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </BaseModal>
  );
}

// Helper function to calculate percentile
function calculatePercentile(value: number, allValues: number[]): number {
  if (allValues.length === 0) return 50;
  const sorted = [...allValues].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  if (index === -1) return 100;
  return Math.round((index / sorted.length) * 100);
}
