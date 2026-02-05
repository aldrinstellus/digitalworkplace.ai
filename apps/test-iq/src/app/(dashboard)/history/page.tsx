'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
import TimeRangeSelector, { type TimeRange } from '@/components/dtq/TimeRangeSelector';
import { usePersona } from '../layout';
import { useRealTimeSimulation } from '@/hooks/useRealTimeSimulation';
import { useNavigation } from '@/contexts/NavigationContext';

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

const RANGE_DAYS: Record<TimeRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '12m': 365,
};

const RANGE_LABELS: Record<TimeRange, string> = {
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  '12m': '12 Months',
};

function subsample<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;
  const step = data.length / maxPoints;
  const result: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(data[Math.floor(i * step)]);
  }
  // Always include the last point
  if (result[result.length - 1] !== data[data.length - 1]) {
    result[result.length - 1] = data[data.length - 1];
  }
  return result;
}

export default function HistoryPage() {
  const { persona } = usePersona();
  const { dailyMetrics, lastUpdate, isLive, toggleLive } = useRealTimeSimulation(true, persona);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Modal state management
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric | null>(null);
  const [selectedChartPoint, setSelectedChartPoint] = useState<SelectedChartPoint | null>(null);
  const { pendingAction, clearAction } = useNavigation();

  // Filter and subsample metrics based on selected time range
  const filteredMetrics = useMemo(() => {
    const days = RANGE_DAYS[timeRange];
    const sliced = dailyMetrics.slice(-days);
    // Subsample for chart performance on larger ranges
    return days > 60 ? subsample(sliced, 60) : sliced;
  }, [dailyMetrics, timeRange]);

  // Calculate averages for the filtered range in a single pass
  const { avgPassRate, avgFirstPassRate, avgDefectDetection, avgEffectiveness } = useMemo(() => {
    const metrics = dailyMetrics.slice(-RANGE_DAYS[timeRange]);
    let passRate = 0, firstPass = 0, defect = 0, effectiveness = 0;
    for (const m of metrics) {
      passRate += m.passRate;
      firstPass += m.firstRunPassRate;
      defect += m.defectDetection;
      effectiveness += m.effectiveness;
    }
    const len = metrics.length;
    return {
      avgPassRate: Math.round(passRate / len * 10) / 10,
      avgFirstPassRate: Math.round(firstPass / len * 10) / 10,
      avgDefectDetection: Math.round(defect / len * 10) / 10,
      avgEffectiveness: Math.round(effectiveness / len * 10) / 10,
    };
  }, [dailyMetrics, timeRange]);

  // Handle navigation actions from chat link cards
  useEffect(() => {
    if (!pendingAction || pendingAction.link.page !== 'history') return;

    const { link } = pendingAction;

    queueMicrotask(() => {
      if (link.target === 'metric' || link.target === 'history') {
        const metricMap: Record<string, { key: string; label: string; value: number }> = {
          passRate: { key: 'passRate', label: 'Average Pass Rate', value: avgPassRate },
          firstRunPassRate: { key: 'firstRunPassRate', label: 'First Pass Rate', value: avgFirstPassRate },
          defectDetection: { key: 'defectDetection', label: 'Defect Detection', value: avgDefectDetection },
          effectiveness: { key: 'effectiveness', label: 'Test Effectiveness', value: avgEffectiveness },
          performance: { key: 'passRate', label: 'Average Pass Rate', value: avgPassRate },
        };

        const mapping = metricMap[link.entityId];
        if (mapping) {
          setSelectedMetric({
            key: mapping.key,
            label: mapping.label,
            value: mapping.value,
            unit: '%',
            trend: 'up',
            trendValue: '+2.3%',
          });
        }
      }

      clearAction(pendingAction.id);
    });
  }, [pendingAction, clearAction, avgPassRate, avgFirstPassRate, avgDefectDetection, avgEffectiveness]);

  // All chart datasets in single pass — uses filteredMetrics for selected range
  const { passRateData, firstPassData, defectData, effectivenessData } = useMemo(() => {
    const pr: ChartDataPoint[] = [];
    const fp: ChartDataPoint[] = [];
    const dd: ChartDataPoint[] = [];
    const ef: ChartDataPoint[] = [];
    for (const m of filteredMetrics) {
      pr.push({ date: m.date, value: m.passRate });
      fp.push({ date: m.date, value: m.firstRunPassRate });
      dd.push({ date: m.date, value: m.defectDetection });
      ef.push({ date: m.date, value: m.effectiveness });
    }
    return { passRateData: pr, firstPassData: fp, defectData: dd, effectivenessData: ef };
  }, [filteredMetrics]);

  // Metric click handlers
  const handleMetricClick = useCallback((metric: SelectedMetric) => {
    setSelectedMetric(metric);
  }, []);

  // Chart point click handlers
  const handleChartPointClick = useCallback((dataPoint: ChartDataPoint, metricLabel: string, allData: ChartDataPoint[]) => {
    setSelectedChartPoint({ dataPoint, metricLabel, allData });
  }, []);

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
            Monitor team effectiveness and quality trends
          </p>
        </motion.div>
        <div className="flex items-center gap-3">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          <LiveIndicator lastUpdate={lastUpdate} isLive={isLive} onToggle={toggleLive} />
        </div>
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
          title={`Test Pass Rate Trend (${RANGE_LABELS[timeRange]})`}
          data={passRateData}
          type="line"
          color="var(--status-success)"
          delay={0.3}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'Test Pass Rate', passRateData)}
        />
        <TrendChart
          title={`First Run Pass Rate (${RANGE_LABELS[timeRange]})`}
          data={firstPassData}
          type="line"
          color="var(--accent-primary)"
          delay={0.35}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'First Run Pass Rate', firstPassData)}
        />
        <TrendChart
          title={`Defect Detection (${RANGE_LABELS[timeRange]})`}
          data={defectData}
          type="area"
          color="var(--risk-medium)"
          delay={0.4}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'Defect Detection', defectData)}
        />
        <TrendChart
          title={`Test Case Effectiveness (${RANGE_LABELS[timeRange]})`}
          data={effectivenessData}
          type="area"
          color="var(--chart-secondary)"
          delay={0.45}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'Test Effectiveness', effectivenessData)}
        />
      </div>

      {/* Modals — conditionally rendered */}
      {selectedMetric && (
        <MetricDrillDownModal
          isOpen
          onClose={() => setSelectedMetric(null)}
          metricKey={selectedMetric.key}
          metricLabel={selectedMetric.label}
          currentValue={selectedMetric.value}
          unit={selectedMetric.unit}
          trend={selectedMetric.trend}
          trendValue={selectedMetric.trendValue}
          dailyMetrics={dailyMetrics}
          previousPeriodValue={selectedMetric.value - 2.5}
        />
      )}

      {selectedChartPoint && (
        <ChartDrillDownModal
          isOpen
          onClose={() => setSelectedChartPoint(null)}
          dataPoint={selectedChartPoint.dataPoint}
          metricLabel={selectedChartPoint.metricLabel}
          allData={selectedChartPoint.allData}
        />
      )}
    </div>
  );
}
