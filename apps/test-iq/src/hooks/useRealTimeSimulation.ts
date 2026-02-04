'use client';

import { useState, useEffect, useCallback, useRef, useMemo, startTransition } from 'react';
import { TestRun, Feature, DailyMetric, TestIssue, Persona, PersonaType } from '@/lib/dtq/types';
import {
  personas as fallbackPersonas,
} from '@/lib/dtq/data';
import { getPersonaData } from '@/lib/dtq/persona-data';

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

export function useRealTimeSimulation(enabled: boolean = true, persona: PersonaType = 'manager') {
  // Initialize from persona data
  const initialData = getPersonaData(persona);
  const [testRuns, setTestRuns] = useState<TestRun[]>(initialData.testRuns);
  const [features, setFeatures] = useState<Feature[]>(initialData.features);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>(initialData.dailyMetrics);
  const [personas] = useState<Persona[]>(fallbackPersonas);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [isLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when persona changes
  useEffect(() => {
    const data = getPersonaData(persona);
    queueMicrotask(() => {
      setFeatures(data.features);
      setTestRuns(data.testRuns);
      setDailyMetrics(data.dailyMetrics);
      setLastUpdate(new Date());
    });
  }, [persona]);

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

  // Calculate summary metrics dynamically - single pass over features array
  const summaryMetrics = useMemo(() => {
    let totalCoverage = 0;
    let fullyAutomated = 0;
    let riskHigh = 0;
    let riskMedium = 0;
    let riskLow = 0;
    let totalOpenDefects = 0;

    for (const f of features) {
      totalCoverage += f.coverage;
      if (f.status === 'fully_automated') fullyAutomated++;
      if (f.riskScore >= 40) riskHigh++;
      else if (f.riskScore >= 20) riskMedium++;
      else riskLow++;
      totalOpenDefects += f.openDefects;
    }

    const len = features.length;
    return {
      totalFeatures: len,
      avgCoverage: Math.round((totalCoverage / len) * 10) / 10,
      automationRate: Math.round((fullyAutomated / len) * 100),
      fullyAutomated,
      riskDistribution: {
        high: riskHigh,
        medium: riskMedium,
        low: riskLow,
      },
      openDefects: totalOpenDefects,
    };
  }, [features]);

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
