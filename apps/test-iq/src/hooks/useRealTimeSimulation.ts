'use client';

import { useState, useEffect, useCallback, useRef, useMemo, startTransition } from 'react';
import { TestRun, Feature, DailyMetric, TestIssue, Persona } from '@/lib/dtq/types';
import {
  features as fallbackFeatures,
  dailyMetrics as fallbackMetrics,
  testRuns as fallbackTestRuns,
  personas as fallbackPersonas,
} from '@/lib/dtq/data';

// Realistic error messages for failed tests
const errorMessages = [
  'Expected element to be visible but timed out after 30000ms',
  'Assertion failed: expected value to match',
  'Network request failed: GET /api returned 500',
  'Element not clickable at point (320, 480)',
  'Timeout waiting for navigation',
  'Session expired during test execution',
  'Database connection timeout',
  'OAuth callback URL mismatch',
  'API rate limit exceeded',
  'Certificate validation failed',
];

const stackTraces = [
  'Error: Timeout waiting for element\n    at waitForSelector (/tests/spec.ts:45:12)\n    at Object.<anonymous> (/tests/spec.ts:52:5)',
  'AssertionError: expected 5 to equal 4\n    at Context.<anonymous> (/tests/assertion.spec.ts:78:14)',
  'NetworkError: Request failed\n    at fetch (/tests/api.spec.ts:33:8)',
  'ElementClickInterceptedError: Element not clickable\n    at click (/tests/interaction.spec.ts:92:10)',
];

// Generate a random test run for simulation
function generateTestRun(features: Feature[]): TestRun {
  const feature = features[Math.floor(Math.random() * features.length)];
  const passed = Math.random() > 0.15; // 85% pass rate
  const totalTests = Math.floor(Math.random() * 25) + 10;
  const failedTests = passed ? 0 : Math.floor(Math.random() * 5) + 1;
  const passedTests = totalTests - failedTests;

  const issues: TestIssue[] = passed
    ? []
    : Array.from({ length: failedTests }, (_, i) => ({
        id: `issue-${Date.now()}-${i}`,
        testCaseName: `Test Case ${i + 1} - ${feature.name}`,
        severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        errorMessage: errorMessages[Math.floor(Math.random() * errorMessages.length)],
        stackTrace: stackTraces[Math.floor(Math.random() * stackTraces.length)],
      }));

  return {
    id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    featureId: feature.id,
    featureName: feature.name,
    executedAt: new Date(),
    status: passed ? 'passed' : 'failed',
    totalTests,
    passedTests,
    failedTests,
    duration: Math.floor(Math.random() * 10) + 4,
    issues,
  };
}

// Add variance to a metric value
function addVariance(value: number, maxVariance: number = 3): number {
  const variance = (Math.random() - 0.5) * 2 * maxVariance;
  return Math.max(0, Math.min(100, value + variance));
}

// Fetch data from API with fallback to static data
async function fetchFromAPI<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch {
    console.warn(`Failed to fetch ${endpoint}, using fallback data`);
    return fallback;
  }
}

export function useRealTimeSimulation(enabled: boolean = true) {
  const [testRuns, setTestRuns] = useState<TestRun[]>(fallbackTestRuns);
  const [features, setFeatures] = useState<Feature[]>(fallbackFeatures);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>(fallbackMetrics);
  const [personas, setPersonas] = useState<Persona[]>(fallbackPersonas);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataLoadedRef = useRef(false);

  // Load initial data from API
  useEffect(() => {
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [featuresData, testRunsData, metricsData, personasData] = await Promise.all([
          fetchFromAPI<Feature[]>('/api/dtq/features', fallbackFeatures),
          fetchFromAPI<TestRun[]>('/api/dtq/test-runs', fallbackTestRuns),
          fetchFromAPI<DailyMetric[]>('/api/dtq/metrics', fallbackMetrics),
          fetchFromAPI<Persona[]>('/api/dtq/personas', fallbackPersonas),
        ]);

        // Transform dates for test runs
        const transformedRuns = testRunsData.map((run) => ({
          ...run,
          executedAt: new Date(run.executedAt),
        }));

        setFeatures(featuresData);
        setTestRuns(transformedRuns);
        setDailyMetrics(metricsData);
        setPersonas(personasData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Simulate new test runs appearing
  const simulateNewTestRun = useCallback(() => {
    const newRun = generateTestRun(features);
    setTestRuns((prev) => [newRun, ...prev.slice(0, 49)]); // Keep max 50 runs
    setLastUpdate(new Date());

    // Update feature metrics based on the new run
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === newRun.featureId) {
          const newPassRate = Math.round(
            f.passRate * 0.9 + (newRun.status === 'passed' ? 100 : 0) * 0.1
          );
          return {
            ...f,
            passRate: newPassRate,
            openDefects: f.openDefects + (newRun.status === 'failed' ? 1 : 0),
          };
        }
        return f;
      })
    );
  }, [features]);

  // Simulate metric fluctuations
  const simulateMetricFluctuation = useCallback(() => {
    setDailyMetrics((prev) => {
      const latest = prev[prev.length - 1];
      if (!latest) return prev;

      // Update the latest day's metrics with small variance
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...latest,
        passRate: addVariance(latest.passRate, 1),
        firstRunPassRate: addVariance(latest.firstRunPassRate, 1.5),
        defectDetection: addVariance(latest.defectDetection, 1),
        effectiveness: addVariance(latest.effectiveness, 0.8),
      };
      return updated;
    });
  }, []);

  // Start/stop simulation
  useEffect(() => {
    if (!enabled || !isLive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Simulate new test run every 8-15 seconds
    const scheduleNextRun = () => {
      const delay = Math.random() * 7000 + 8000; // 8-15 seconds
      intervalRef.current = setTimeout(() => {
        simulateNewTestRun();
        scheduleNextRun();
      }, delay);
    };

    // Simulate metric fluctuation every 10 seconds (throttled from 5s for performance)
    const metricInterval = setInterval(() => {
      startTransition(() => {
        simulateMetricFluctuation();
      });
    }, 10000);

    scheduleNextRun();

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      clearInterval(metricInterval);
    };
  }, [enabled, isLive, simulateNewTestRun, simulateMetricFluctuation]);

  // Manual refresh
  const refresh = useCallback(() => {
    simulateNewTestRun();
    simulateMetricFluctuation();
  }, [simulateNewTestRun, simulateMetricFluctuation]);

  // Toggle live mode
  const toggleLive = useCallback(() => {
    setIsLive((prev) => !prev);
  }, []);

  // Calculate summary metrics dynamically
  const summaryMetrics = useMemo(
    () => ({
      totalFeatures: features.length,
      avgCoverage:
        Math.round((features.reduce((sum, f) => sum + f.coverage, 0) / features.length) * 10) / 10,
      automationRate: Math.round(
        (features.filter((f) => f.status === 'fully_automated').length / features.length) * 100
      ),
      fullyAutomated: features.filter((f) => f.status === 'fully_automated').length,
      riskDistribution: {
        high: features.filter((f) => f.riskScore >= 40).length,
        medium: features.filter((f) => f.riskScore >= 20 && f.riskScore < 40).length,
        low: features.filter((f) => f.riskScore < 20).length,
      },
      openDefects: features.reduce((sum, f) => sum + f.openDefects, 0),
    }),
    [features]
  );

  // High risk features
  const highRiskFeatures = useMemo(
    () =>
      features
        .filter((f) => f.riskScore >= 40)
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 3),
    [features]
  );

  // Calculate categories dynamically - memoized to avoid O(n²) recalculation on every render
  const categories = useMemo(() => {
    const categoryNames = [...new Set(features.map((f) => f.category))];
    return categoryNames.map((name, index) => {
      const categoryFeatures = features.filter((f) => f.category === name);
      return {
        id: `category-${index + 1}`,
        name,
        features: categoryFeatures,
        avgCoverage: Math.round(
          categoryFeatures.reduce((sum, f) => sum + f.coverage, 0) / categoryFeatures.length
        ),
        highRiskCount: categoryFeatures.filter((f) => f.riskScore >= 40).length,
        totalDefects: categoryFeatures.reduce((sum, f) => sum + f.openDefects, 0),
      };
    });
  }, [features]);

  return {
    // Data
    testRuns,
    features,
    dailyMetrics,
    categories,
    summaryMetrics,
    highRiskFeatures,
    personas,

    // State
    lastUpdate,
    isLive,
    isLoading,

    // Actions
    refresh,
    toggleLive,
    setIsLive,
  };
}

// Format relative time
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
