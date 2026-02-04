'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Shield,
  Bug,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import BaseModal, { ModalSection } from './BaseModal';
import { Category, Feature } from '@/lib/dtq/types';
import { AnimatedCounter, StaggerContainer, StaggerItem } from '@/lib/motion';

interface CategoryAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onFeatureClick?: (feature: Feature) => void;
}

export default function CategoryAnalyticsModal({
  isOpen,
  onClose,
  category,
  onFeatureClick,
}: CategoryAnalyticsModalProps) {
  // Early return - don't compute anything if modal is closed
  if (!isOpen || !category) return null;

  // Prepare feature comparison data
  const featureComparison = category.features.map(f => ({
    name: f.name.length > 15 ? f.name.slice(0, 15) + '...' : f.name,
    fullName: f.name,
    coverage: f.coverage,
    passRate: f.passRate,
    feature: f,
  }));

  // Risk distribution data
  const riskDistribution = [
    {
      name: 'High Risk',
      value: category.features.filter(f => f.riskScore >= 40).length,
      color: 'var(--risk-high)',
    },
    {
      name: 'Medium Risk',
      value: category.features.filter(f => f.riskScore >= 20 && f.riskScore < 40).length,
      color: 'var(--risk-medium)',
    },
    {
      name: 'Low Risk',
      value: category.features.filter(f => f.riskScore < 20).length,
      color: 'var(--risk-low)',
    },
  ].filter(d => d.value > 0);

  // Calculate stats
  const totalFeatures = category.features.length;
  const fullyAutomated = category.features.filter(f => f.status === 'fully_automated').length;
  const totalOpenDefects = category.features.reduce((sum, f) => sum + f.openDefects, 0);
  const averagePassRate = category.features.reduce((sum, f) => sum + f.passRate, 0) / totalFeatures;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={category.name}
      description={`${totalFeatures} features in this category`}
      size="xl"
    >
      <StaggerContainer>
        {/* Summary Cards */}
        <StaggerItem>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Avg Coverage */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Avg Coverage
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={category.avgCoverage} suffix="%" />
              </p>
            </div>

            {/* Avg Pass Rate */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--chart-secondary)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Avg Pass Rate
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={averagePassRate} suffix="%" />
              </p>
            </div>

            {/* High Risk Count */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" style={{ color: 'var(--risk-high)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  High Risk
                </span>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: category.highRiskCount > 0 ? 'var(--risk-high)' : 'var(--text-primary)' }}
              >
                <AnimatedCounter value={category.highRiskCount} />
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                of {totalFeatures} features
              </p>
            </div>

            {/* Open Defects */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4" style={{ color: totalOpenDefects > 0 ? 'var(--status-error)' : 'var(--text-muted)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Open Defects
                </span>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: totalOpenDefects > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}
              >
                <AnimatedCounter value={totalOpenDefects} />
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* Automation Status */}
        <StaggerItem>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full badge-success">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">{fullyAutomated} Fully Automated</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full badge-info">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">{totalFeatures - fullyAutomated} Partial</span>
            </div>
          </div>
        </StaggerItem>

        {/* Feature Comparison Chart */}
        <StaggerItem>
          <ModalSection title="Feature Comparison">
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureComparison} layout="vertical">
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
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div
                              className="px-3 py-2 rounded-lg text-sm animate-tooltip-enter"
                              style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-default)',
                              }}
                            >
                              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                {data.fullName}
                              </p>
                              <p style={{ color: 'var(--accent-primary)' }}>
                                Coverage: {data.coverage}%
                              </p>
                              <p style={{ color: 'var(--chart-secondary)' }}>
                                Pass Rate: {data.passRate}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="coverage"
                      fill="var(--accent-primary)"
                      radius={[0, 4, 4, 0]}
                      animationDuration={400}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ModalSection>
        </StaggerItem>

        {/* Risk Distribution */}
        <StaggerItem>
          <ModalSection title="Risk Distribution">
            <div className="grid grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div
                className="rounded-xl p-4"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        animationDuration={400}
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
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
                                  {payload[0].name}: {payload[0].value} features
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col justify-center space-y-3">
                {riskDistribution.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: item.color }}
                      />
                      <span style={{ color: 'var(--text-primary)' }}>
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </ModalSection>
        </StaggerItem>

        {/* Feature List with Quick Actions */}
        <StaggerItem>
          <ModalSection title="Features">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {category.features.map((feature, idx) => (
                <motion.button
                  key={feature.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => onFeatureClick?.(feature)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-left"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {feature.status === 'fully_automated' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--status-success)' }} />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--chart-secondary)' }} />
                    )}
                    <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                      {feature.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm shrink-0">
                    <span style={{ color: 'var(--text-muted)' }}>
                      {feature.coverage}%
                    </span>
                    {feature.riskScore >= 40 && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(248, 113, 113, 0.15)',
                          color: 'var(--risk-high)',
                        }}
                      >
                        High Risk
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </motion.button>
              ))}
            </div>
          </ModalSection>
        </StaggerItem>
      </StaggerContainer>
    </BaseModal>
  );
}
