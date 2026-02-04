'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  Layers,
  Cpu,
  AlertTriangle,
  Bug,
} from 'lucide-react';
import PersonaCard from '@/components/dtq/PersonaCard';
import MetricCard from '@/components/dtq/MetricCard';
import HighRiskBanner from '@/components/dtq/HighRiskBanner';
import TrendChart from '@/components/dtq/TrendChart';
import FeatureCoverage from '@/components/dtq/FeatureCoverage';
import LiveIndicator from '@/components/dtq/LiveIndicator';
import { usePersona } from '../layout';
import { useRealTimeSimulation } from '@/hooks/useRealTimeSimulation';
import { Feature, Category } from '@/lib/dtq/types';
import { useNavigation } from '@/contexts/NavigationContext';

// Lazy load modals - they're not needed until user interaction
const MetricDrillDownModal = dynamic(() => import('@/components/dtq/modals/MetricDrillDownModal'), { ssr: false });
const ChartDrillDownModal = dynamic(() => import('@/components/dtq/modals/ChartDrillDownModal'), { ssr: false });
const FeatureDetailModal = dynamic(() => import('@/components/dtq/modals/FeatureDetailModal'), { ssr: false });
const CategoryAnalyticsModal = dynamic(() => import('@/components/dtq/modals/CategoryAnalyticsModal'), { ssr: false });

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

export default function DashboardPage() {
  const { persona } = usePersona();
  const {
    summaryMetrics,
    highRiskFeatures,
    dailyMetrics,
    categories,
    personas,
    testRuns,
    lastUpdate,
    isLive,
    toggleLive,
  } = useRealTimeSimulation(true, persona);

  // Modal state management
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric | null>(null);
  const [selectedChartPoint, setSelectedChartPoint] = useState<SelectedChartPoint | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { pendingAction, clearAction } = useNavigation();

  const currentPersona = useMemo(
    () => personas.find(p => p.id === persona) || personas[1],
    [personas, persona]
  );

  // Handle navigation actions from chat link cards
  useEffect(() => {
    if (!pendingAction || pendingAction.link.page !== 'dashboard') return;

    const { link } = pendingAction;

    if (link.target === 'feature') {
      const feature = categories
        .flatMap(c => c.features)
        .find(f => f.id === link.entityId);
      if (feature) setSelectedFeature(feature);
    } else if (link.target === 'category') {
      const category = categories.find(c => c.name === link.entityId);
      if (category) setSelectedCategory(category);
    } else if (link.target === 'metric') {
      const personaMetric = currentPersona.metrics.find(
        m => m.label === link.entityId || m.key === link.entityId
      );
      if (personaMetric) {
        setSelectedMetric({
          key: personaMetric.key,
          label: personaMetric.label,
          value: typeof personaMetric.value === 'number' ? personaMetric.value : parseFloat(String(personaMetric.value)),
          unit: personaMetric.unit || '',
          trend: personaMetric.trend,
          trendValue: personaMetric.trendValue,
        });
      }
    }

    clearAction(pendingAction.id);
  }, [pendingAction, clearAction, categories, currentPersona]);

  // Chart data
  const passRateData = useMemo(() =>
    dailyMetrics.slice(-7).map(m => ({ date: m.date, value: m.passRate })),
    [dailyMetrics]
  );

  const coverageData = useMemo(() =>
    dailyMetrics.slice(-7).map(m => ({ date: m.date, value: m.automationCoverage })),
    [dailyMetrics]
  );

  // Click handlers
  const handleMetricClick = useCallback((metric: SelectedMetric) => {
    setSelectedMetric(metric);
  }, []);

  const handleChartPointClick = useCallback((dataPoint: ChartDataPoint, metricLabel: string, allData: ChartDataPoint[]) => {
    setSelectedChartPoint({ dataPoint, metricLabel, allData });
  }, []);

  const handleFeatureClick = useCallback((feature: Feature) => {
    setSelectedFeature(feature);
  }, []);

  const handleCategoryClick = useCallback((category: Category) => {
    setSelectedCategory(category);
  }, []);

  // Handle feature click from within CategoryAnalyticsModal
  const handleCategoryFeatureClick = useCallback((feature: Feature) => {
    setSelectedCategory(null); // Close category modal
    setSelectedFeature(feature); // Open feature modal
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-white">Test IQ <span className="text-[#ff3366]">Dashboard</span></h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            AI-Powered Testing Intelligence for Enterprise Quality
          </p>
        </motion.div>
        <LiveIndicator lastUpdate={lastUpdate} isLive={isLive} onToggle={toggleLive} />
      </div>

      {/* Persona Card */}
      <PersonaCard persona={persona} />

      {/* Primary Metrics - All clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Features"
          value={summaryMetrics.totalFeatures}
          subtitle={`${summaryMetrics.avgCoverage}% avg coverage`}
          icon={Layers}
          delay={0.1}
          accentColor="var(--chart-tertiary)"
          onClick={() => handleMetricClick({
            key: 'totalFeatures',
            label: 'Total Features',
            value: summaryMetrics.totalFeatures,
            unit: '',
            trend: 'stable',
            trendValue: '+2 this month',
          })}
        />
        <MetricCard
          label="Automation Rate"
          value={`${summaryMetrics.automationRate}%`}
          subtitle={`${summaryMetrics.fullyAutomated} fully automated`}
          icon={Cpu}
          delay={0.15}
          accentColor="var(--accent-primary)"
          onClick={() => handleMetricClick({
            key: 'automationCoverage',
            label: 'Automation Rate',
            value: summaryMetrics.automationRate,
            unit: '%',
            trend: 'up',
            trendValue: '+3.2%',
          })}
        />
        <MetricCard
          label="Risk Distribution"
          value={`${summaryMetrics.riskDistribution.high} High`}
          subtitle={`${summaryMetrics.riskDistribution.medium} Med / ${summaryMetrics.riskDistribution.low} Low`}
          icon={AlertTriangle}
          delay={0.2}
          accentColor="var(--risk-medium)"
          onClick={() => handleMetricClick({
            key: 'riskDistribution',
            label: 'Risk Distribution',
            value: summaryMetrics.riskDistribution.high,
            unit: ' high risk',
            trend: 'down',
            trendValue: '-2 resolved',
          })}
        />
        <MetricCard
          label="Open Defects"
          value={summaryMetrics.openDefects}
          subtitle="Across all features"
          icon={Bug}
          delay={0.25}
          accentColor="var(--status-error)"
          onClick={() => handleMetricClick({
            key: 'openDefects',
            label: 'Open Defects',
            value: summaryMetrics.openDefects,
            unit: '',
            trend: 'down',
            trendValue: '-5 resolved',
          })}
        />
      </div>

      {/* High Risk Banner */}
      {highRiskFeatures.length > 0 && (
        <HighRiskBanner
          features={highRiskFeatures}
          onFeatureClick={handleFeatureClick}
        />
      )}

      {/* Persona Metrics Grid - All clickable */}
      <motion.div
        key={persona}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {currentPersona.title} Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPersona.metrics.map((metric, index) => (
            <MetricCard
              key={metric.key}
              label={metric.label}
              value={`${metric.value}${metric.unit === '%' || metric.unit === '$' ? metric.unit : ''}`}
              subtitle={metric.description}
              trend={metric.trend}
              trendValue={metric.trendValue}
              delay={0.3 + index * 0.05}
              onClick={() => handleMetricClick({
                key: metric.key,
                label: metric.label,
                value: typeof metric.value === 'number' ? metric.value : parseFloat(String(metric.value)),
                unit: metric.unit || '',
                trend: metric.trend,
                trendValue: metric.trendValue,
              })}
            />
          ))}
        </div>
      </motion.div>

      {/* Trend Charts - Clickable data points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendChart
          title="Test Pass Rate Trend (7 Days)"
          data={passRateData}
          type="line"
          color="var(--accent-primary)"
          delay={0.4}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'Test Pass Rate', passRateData)}
        />
        <TrendChart
          title="Automation Coverage (7 Days)"
          data={coverageData}
          type="area"
          color="var(--chart-secondary)"
          delay={0.45}
          onDataPointClick={(dp) => handleChartPointClick(dp, 'Automation Coverage', coverageData)}
        />
      </div>

      {/* Feature Coverage */}
      <FeatureCoverage
        categories={categories}
        onFeatureClick={handleFeatureClick}
        onCategoryClick={handleCategoryClick}
      />

      {/* Modals */}

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
        previousPeriodValue={selectedMetric ? selectedMetric.value * 0.95 : undefined}
      />

      {/* Chart Point Drill-Down Modal */}
      <ChartDrillDownModal
        isOpen={!!selectedChartPoint}
        onClose={() => setSelectedChartPoint(null)}
        dataPoint={selectedChartPoint?.dataPoint || null}
        metricLabel={selectedChartPoint?.metricLabel || ''}
        allData={selectedChartPoint?.allData || []}
      />

      {/* Feature Detail Modal */}
      <FeatureDetailModal
        isOpen={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        feature={selectedFeature}
        testRuns={testRuns}
      />

      {/* Category Analytics Modal */}
      <CategoryAnalyticsModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        onFeatureClick={handleCategoryFeatureClick}
      />
    </div>
  );
}
