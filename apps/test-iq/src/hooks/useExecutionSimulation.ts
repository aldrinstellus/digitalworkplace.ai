'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ExecutionConfig,
  FeatureExecutionState,
  ConsoleLogEntry,
  ExecutionPhase,
  TestRun,
  TestIssue,
} from '@/lib/dtq/types';

const errorMessages = [
  'Expected element to be visible but timed out after 30000ms',
  'Assertion failed: expected value to match',
  'Network request failed: GET /api returned 500',
  'Element not clickable at point (320, 480)',
  'Timeout waiting for navigation',
];

const stackTraces = [
  'Error: Timeout waiting for element\n    at waitForSelector (/tests/spec.ts:45:12)',
  'AssertionError: expected 5 to equal 4\n    at Context.<anonymous> (/tests/assertion.spec.ts:78:14)',
  'NetworkError: Request failed\n    at fetch (/tests/api.spec.ts:33:8)',
];

interface SelectedFeature {
  id: string;
  name: string;
  category: string;
}

interface UseExecutionSimulationReturn {
  phase: ExecutionPhase;
  featureStates: FeatureExecutionState[];
  consoleLogs: ConsoleLogEntry[];
  overallProgress: number;
  passCount: number;
  failCount: number;
  activeSlots: number;
  execute: (features: SelectedFeature[], config: ExecutionConfig) => void;
  reset: () => void;
  generatedRuns: TestRun[];
}

let logIdCounter = 0;

function createLog(level: ConsoleLogEntry['level'], message: string): ConsoleLogEntry {
  logIdCounter++;
  return {
    id: `log-${logIdCounter}`,
    timestamp: new Date(),
    level,
    message,
  };
}

export function useExecutionSimulation(): UseExecutionSimulationReturn {
  const [phase, setPhase] = useState<ExecutionPhase>('idle');
  const [featureStates, setFeatureStates] = useState<FeatureExecutionState[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogEntry[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [activeSlots, setActiveSlots] = useState(0);
  const [generatedRuns, setGeneratedRuns] = useState<TestRun[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const statesRef = useRef<FeatureExecutionState[]>([]);
  const configRef = useRef<ExecutionConfig | null>(null);

  const addLog = useCallback((level: ConsoleLogEntry['level'], message: string) => {
    setConsoleLogs((prev) => [...prev.slice(-49), createLog(level, message)]);
  }, []);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const execute = useCallback(
    (features: SelectedFeature[], config: ExecutionConfig) => {
      cleanup();
      configRef.current = config;

      // Initialize feature states
      const initialStates: FeatureExecutionState[] = features.map((f) => ({
        featureId: f.id,
        featureName: f.name,
        status: 'queued',
        progress: 0,
        totalTests: Math.floor(Math.random() * 20) + 10,
        passedTests: 0,
        failedTests: 0,
      }));

      statesRef.current = initialStates;
      setFeatureStates(initialStates);
      setConsoleLogs([]);
      setOverallProgress(0);
      setPassCount(0);
      setFailCount(0);
      setActiveSlots(0);
      setGeneratedRuns([]);
      setPhase('running');

      addLog('info', `Starting execution: ${features.length} features, ${config.environment} environment`);
      addLog('info', `Browser: ${config.browser} | Parallel instances: ${config.parallelInstances}`);

      // Tick every 200ms
      intervalRef.current = setInterval(() => {
        const states = [...statesRef.current];
        const maxParallel = configRef.current?.parallelInstances ?? 5;

        // Count currently running
        const runningCount = states.filter((s) => s.status === 'running').length;

        // Start queued features up to parallel limit
        const queued = states.filter((s) => s.status === 'queued');
        const slotsAvailable = maxParallel - runningCount;
        for (let i = 0; i < Math.min(slotsAvailable, queued.length); i++) {
          const idx = states.findIndex((s) => s.featureId === queued[i].featureId);
          states[idx] = { ...states[idx], status: 'running' };
          addLog('info', `▶ Starting: ${queued[i].featureName}`);
        }

        // Advance running features
        for (let i = 0; i < states.length; i++) {
          if (states[i].status === 'running') {
            const increment = 5 + Math.random() * 8; // 5-13% per tick
            const newProgress = Math.min(100, states[i].progress + increment);
            states[i] = { ...states[i], progress: newProgress };

            if (newProgress >= 100) {
              // 85% pass rate
              const passed = Math.random() > 0.15;
              const failedTests = passed ? 0 : Math.floor(Math.random() * 4) + 1;
              const passedTests = states[i].totalTests - failedTests;

              states[i] = {
                ...states[i],
                progress: 100,
                status: passed ? 'passed' : 'failed',
                passedTests,
                failedTests,
              };

              if (passed) {
                addLog('success', `✓ ${states[i].featureName}: ${passedTests}/${states[i].totalTests} passed`);
              } else {
                addLog('error', `✗ ${states[i].featureName}: ${failedTests} failed — ${errorMessages[Math.floor(Math.random() * errorMessages.length)]}`);
              }
            }
          }
        }

        statesRef.current = states;
        setFeatureStates([...states]);

        // Calculate stats
        const completed = states.filter((s) => s.status === 'passed' || s.status === 'failed');
        const newPassCount = states.filter((s) => s.status === 'passed').length;
        const newFailCount = states.filter((s) => s.status === 'failed').length;
        const newActive = states.filter((s) => s.status === 'running').length;
        const progress = states.length > 0
          ? Math.round(states.reduce((sum, s) => sum + s.progress, 0) / states.length)
          : 0;

        setActiveSlots(newActive);
        setPassCount(newPassCount);
        setFailCount(newFailCount);
        setOverallProgress(progress);

        // Check if all done
        if (completed.length === states.length) {
          cleanup();
          setPhase('complete');
          addLog('info', `Execution complete: ${newPassCount} passed, ${newFailCount} failed out of ${states.length} features`);

          // Generate TestRun objects
          const runs: TestRun[] = states.map((s) => {
            const issues: TestIssue[] =
              s.status === 'failed'
                ? Array.from({ length: s.failedTests }, (_, j) => ({
                    id: `exec-issue-${s.featureId}-${j}`,
                    testCaseName: `Test Case ${j + 1} - ${s.featureName}`,
                    severity: (Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
                    errorMessage: errorMessages[Math.floor(Math.random() * errorMessages.length)],
                    stackTrace: stackTraces[Math.floor(Math.random() * stackTraces.length)],
                  }))
                : [];

            return {
              id: `exec-run-${Date.now()}-${s.featureId}`,
              featureId: s.featureId,
              featureName: s.featureName,
              executedAt: new Date(),
              status: s.status as 'passed' | 'failed',
              totalTests: s.totalTests,
              passedTests: s.passedTests,
              failedTests: s.failedTests,
              duration: Math.floor(Math.random() * 10) + 4,
              issues: issues.length > 0 ? issues : undefined,
            };
          });

          setGeneratedRuns(runs);
        }
      }, 200);
    },
    [cleanup, addLog]
  );

  const reset = useCallback(() => {
    cleanup();
    setPhase('idle');
    setFeatureStates([]);
    setConsoleLogs([]);
    setOverallProgress(0);
    setPassCount(0);
    setFailCount(0);
    setActiveSlots(0);
    setGeneratedRuns([]);
  }, [cleanup]);

  return {
    phase,
    featureStates,
    consoleLogs,
    overallProgress,
    passCount,
    failCount,
    activeSlots,
    execute,
    reset,
    generatedRuns,
  };
}
