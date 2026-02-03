'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Bug,
  Shield,
  Activity,
} from 'lucide-react';
import BaseModal, { ModalSection } from './BaseModal';
import { Feature, TestRun } from '@/lib/dtq/types';
import { AnimatedCounter, StaggerContainer, StaggerItem } from '@/lib/motion';

// Format date for tooltips and displays
const formatDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Tooltip render function for the chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FeatureChartTooltip(props: any) {
  const { active, payload, label } = props;
  if (active && payload && payload.length && label) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
        }}
      >
        <p className="mb-1" style={{ color: 'var(--text-muted)' }}>{formatDateDisplay(label)}</p>
        {payload.map((p: { dataKey: string; value: number }, idx: number) => (
          <p key={idx} className="font-semibold" style={{ color: p.dataKey === 'coverage' ? 'var(--accent-primary)' : 'var(--chart-secondary)' }}>
            {p.dataKey === 'coverage' ? 'Coverage' : 'Pass Rate'}: {p.value.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
}

interface FeatureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: Feature | null;
  testRuns?: TestRun[];
}

export default function FeatureDetailModal({
  isOpen,
  onClose,
  feature,
  testRuns = [],
}: FeatureDetailModalProps) {
  // Early return - don't compute anything if modal is closed
  if (!isOpen || !feature) return null;

  // Get test runs for this feature
  const featureTestRuns = testRuns
    .filter(tr => tr.featureId === feature.id)
    .slice(0, 10);

  // Generate deterministic historical data for the chart based on feature values
  const historyData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    // Use deterministic variation based on index
    const variation = Math.sin(i * 0.7) * 5;
    return {
      date: date.toISOString().split('T')[0],
      coverage: Math.max(60, Math.min(100, feature.coverage + variation)),
      passRate: Math.max(70, Math.min(100, feature.passRate + variation * 0.8)),
    };
  });

  const getRiskLabel = (score: number) => {
    if (score >= 40) return 'High Risk';
    if (score >= 20) return 'Medium Risk';
    return 'Low Risk';
  };

  const getRiskColor = (score: number) => {
    if (score >= 40) return 'var(--risk-high)';
    if (score >= 20) return 'var(--risk-medium)';
    return 'var(--risk-low)';
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={feature.name}
      description={`Category: ${feature.category}`}
      size="xl"
    >
      <StaggerContainer staggerDelay={0.1}>
        {/* Overview Cards */}
        <StaggerItem>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Coverage */}
            <div
              className="p-4 rounded-xl relative overflow-hidden"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Coverage
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={feature.coverage} suffix="%" />
              </p>
              <div className="progress-bar h-1.5 mt-2">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${feature.coverage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Risk Score */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" style={{ color: getRiskColor(feature.riskScore) }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Risk Score
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: getRiskColor(feature.riskScore) }}>
                <AnimatedCounter value={feature.riskScore} />
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {getRiskLabel(feature.riskScore)}
              </p>
            </div>

            {/* Open Defects */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4" style={{ color: feature.openDefects > 0 ? 'var(--status-error)' : 'var(--text-muted)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Open Defects
                </span>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: feature.openDefects > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}
              >
                <AnimatedCounter value={feature.openDefects} />
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {feature.closedDefects} closed
              </p>
            </div>

            {/* Pass Rate */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" style={{ color: 'var(--chart-secondary)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Pass Rate
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={feature.passRate} suffix="%" />
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Impact: {feature.impactScore}
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* Status Badge */}
        <StaggerItem>
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                feature.status === 'fully_automated' ? 'badge-success' : 'badge-info'
              }`}
            >
              {feature.status === 'fully_automated' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Fully Automated</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Partially Automated</span>
                </>
              )}
            </div>
          </div>
        </StaggerItem>

        {/* Historical Chart */}
        <StaggerItem>
          <ModalSection title="14-Day History">
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-subtle)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateDisplay}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[60, 100]}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={FeatureChartTooltip} />
                    <Line
                      type="monotone"
                      dataKey="coverage"
                      stroke="var(--accent-primary)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: 'var(--accent-primary)' }}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="passRate"
                      stroke="var(--chart-secondary)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: 'var(--chart-secondary)' }}
                      animationDuration={1500}
                      animationBegin={300}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ background: 'var(--accent-primary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ background: 'var(--chart-secondary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pass Rate</span>
                </div>
              </div>
            </div>
          </ModalSection>
        </StaggerItem>

        {/* Recent Test Runs */}
        <StaggerItem>
          <ModalSection title="Recent Test Runs">
            {featureTestRuns.length > 0 ? (
              <div className="space-y-2">
                {featureTestRuns.map((run, idx) => {
                  // Calculate days ago based on executedAt
                  const now = new Date();
                  const daysAgo = Math.floor(
                    (now.getTime() - run.executedAt.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const timeAgo = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

                  return (
                    <motion.div
                      key={run.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      <div className="flex items-center gap-3">
                        {run.status === 'passed' ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--status-success)' }} />
                        ) : (
                          <XCircle className="w-5 h-5" style={{ color: 'var(--status-error)' }} />
                        )}
                        <div>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {run.totalTests} tests
                          </span>
                          <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>
                            ({run.passedTests} passed, {run.failedTests} failed)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span style={{ color: 'var(--text-muted)' }}>
                          <Clock className="w-4 h-4 inline mr-1" />
                          {run.duration}s
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {timeAgo}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div
                className="p-6 rounded-xl text-center"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No recent test runs</p>
              </div>
            )}
          </ModalSection>
        </StaggerItem>

        {/* Related Defects */}
        {feature.openDefects > 0 && (
          <StaggerItem>
            <ModalSection title="Open Defects">
              <div className="space-y-2">
                {Array.from({ length: Math.min(feature.openDefects, 3) }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Bug className="w-4 h-4" style={{ color: 'var(--status-error)' }} />
                      <span style={{ color: 'var(--text-primary)' }}>
                        DEF-{1000 + i}: {feature.name} - Test failure scenario {i + 1}
                      </span>
                    </div>
                    <div
                      className="px-2 py-1 rounded-full text-xs font-medium badge-error"
                    >
                      High
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
