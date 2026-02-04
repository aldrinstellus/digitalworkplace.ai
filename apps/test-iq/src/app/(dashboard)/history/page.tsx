'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Zap,
  Bug,
  Target,
} from 'lucide-react';
import MetricCard from '@/components/dtq/MetricCard';
import TrendChart from '@/components/dtq/TrendChart';
import LiveIndicator from '@/components/dtq/LiveIndicator';
import { useRealTimeSimulation } from '@/hooks/useRealTimeSimulation';

// Lazy load modals - they're not needed until user interaction
const MetricDrillDownModal = dynamic(() => import('@/components/dtq/modals/MetricDrillDownModal'), { ssr: false });
const ChartDrillDownModal = dynamic(() => import('@/components/dtq/modals/ChartDrillDownModal'), { ssr: false });

interface ChartDataPoint {
  date: string;
  value: number;
}

interface SelectedMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

interface SelectedChartPoint {
  dataPoint: ChartDataPoint;
  metricLabel: string;
  allData: ChartDataPoint[];
}

export default function HistoryPage() {
  const { dailyMetrics, lastUpdate, isLive, toggleLive } = useRealTimeSimulation(true);

  // Modal state management
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric | null>(null);
  const [selectedChartPoint, setSelectedChartPoint] = useState<SelectedChartPoint | null>(null);

  // Calculate 30-day averages
  const avgPassRate = Math.round(
    dailyMetrics.reduce((sum, m) => sum + m.passRate, 0) / dailyMetrics.length * 10
  ) / 10;

  const avgFirstPassRate = Math.round(
    dailyMetrics.reduce((sum, m) => sum + m.firstRunPassRate, 0) / dailyMetrics.length * 10
  ) / 10;

  const avgDefectDetection = Math.round(
    dailyMetrics.reduce((sum, m) => sum + m.defectDetection, 0) / dailyMetrics.length * 10
  ) / 10;

  const avgEffectiveness = Math.round(
    dailyMetrics.reduce((sum, m) => sum + m.effectiveness, 0) / dailyMetrics.length * 10
  ) / 10;

  // Chart data
  const passRateData = dailyMetrics.map(m => ({ date: m.date, value: m.passRate }));
  const firstPassData = dailyMetrics.map(m => ({ date: m.date, value: m.firstRunPassRate }));
  const defectData = dailyMetrics.map(m => ({ date: m.date, value: m.defectDetection }));
  const effectivenessData = dailyMetrics.map(m => ({ date: m.date, value: m.effectiveness }));

  // Metric click handlers
  const handleMetricClick = (metric: SelectedMetric) => {
    setSelectedMetric(metric);
  };

  // Chart point click handlers
  const handleChartPointClick = (dataPoint: ChartDataPoint, metricLabel: string, allData: ChartDataPoint[]) => {
    setSelectedChartPoint({ dataPoint, metricLabel, allData });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-white">Team Performance <span className="text-[#ff3366]">Metrics</span></h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Monitor team effectiveness and quality trends over the past 30 days
          </p>
        </motion.div>
        <LiveIndicator lastUpdate={lastUpdate} isLive={isLive} onToggle={toggleLive} />
      </div>

      {/* Summary Cards - All clickable with drill-down */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Average Pass Rate"
          value={`${avgPassRate}%`}
          icon={CheckCircle2}
          delay={0.1}
          accentColor="var(--status-success)"
          size="large"
          onClick={() => handleMetricClick({
            key: 'passRate',
            label: 'Average Pass Rate',
            value: avgPassRate,
            unit: '%',
            trend: 'up',
            trendValue: '+2.3%',
          })}
        />
        <MetricCard
          label="First Pass Rate"
          value={`${avgFirstPassRate}%`}
          icon={Zap}
          delay={0.15}
          accentColor="var(--accent-primary)"
          size="large"
          onClick={() => handleMetricClick({
            key: 'firstRunPassRate',
            label: 'First Pass Rate',
            value: avgFirstPassRate,
            unit: '%',
            trend: 'up',
            trendValue: '+1.8%',
          })}
        />
        <MetricCard
          label="Defect Detection"
          value={`${avgDefectDetection}%`}
          icon={Bug}
          delay={0.2}
          accentColor="var(--risk-medium)"
          size="large"
          onClick={() => handleMetricClick({
            key: 'defectDetection',
            label: 'Defect Detection',
            value: avgDefectDetection,
            unit: '%',
            trend: 'stable',
            trendValue: '+0.5%',
          })}
        />
        <MetricCard
          label="Test Effectiveness"
          value={`${avgEffectiveness}%`}
          icon={Target}
          delay={0.25}
          accentColor="var(--chart-secondary)"
          size="large"
          onClick={() => handleMetricClick({
            key: 'effectiveness',
            label: 'Test Effectiveness',
            value: avgEffectiveness,
            unit: '%',
            trend: 'up',
            trendValue: '+3.1%',
          })}
        />
      </div>

      {/* Trend Charts Grid - All with clickable data points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="Test Pass Rate Trend"
          data={passRateData}
          type="line"
          color="var(--status-success)"
          delay={0.3}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'Test Pass Rate', passRateData)}
        />
        <TrendChart
          title="First Run Pass Rate"
          data={firstPassData}
          type="line"
          color="var(--accent-primary)"
          delay={0.35}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'First Run Pass Rate', firstPassData)}
        />
        <TrendChart
          title="Defect Detection Percentage"
          data={defectData}
          type="area"
          color="var(--risk-medium)"
          delay={0.4}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'Defect Detection', defectData)}
        />
        <TrendChart
          title="Test Case Effectiveness"
          data={effectivenessData}
          type="area"
          color="var(--chart-secondary)"
          delay={0.45}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'Test Effectiveness', effectivenessData)}
        />
      </div>

      {/* Metric Drill-Down Modal */}
      <MetricDrillDownModal
        isOpen={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
        metricKey={selectedMetric?.key || ''}
        metricLabel={selectedMetric?.label || ''}
        currentValue={selectedMetric?.value || 0}
        unit={selectedMetric?.unit}
        trend={selectedMetric?.trend}
        trendValue={selectedMetric?.trendValue}
        dailyMetrics={dailyMetrics}
        previousPeriodValue={selectedMetric ? selectedMetric.value - 2.5 : undefined}
      />

      {/* Chart Point Drill-Down Modal */}
      <ChartDrillDownModal
        isOpen={!!selectedChartPoint}
        onClose={() => setSelectedChartPoint(null)}
        dataPoint={selectedChartPoint?.dataPoint || null}
        metricLabel={selectedChartPoint?.metricLabel || ''}
        allData={selectedChartPoint?.allData || []}
      />
    </div>
  );
}
