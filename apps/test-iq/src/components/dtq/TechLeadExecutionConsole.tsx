'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { ExecutionConfig, TestRun } from '@/lib/dtq/types';
import { useExecutionSimulation } from '@/hooks/useExecutionSimulation';
import FeatureSelectionPanel, { TECH_LEAD_FEATURES } from './execution/FeatureSelectionPanel';
import ConfigurationBar from './execution/ConfigurationBar';
import ActionButtons from './execution/ActionButtons';
import ExecutionStatusPanel from './execution/ExecutionStatusPanel';

interface TechLeadExecutionConsoleProps {
  onTestRunsGenerated?: (runs: TestRun[]) => void;
}

export default function TechLeadExecutionConsole({ onTestRunsGenerated }: TechLeadExecutionConsoleProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(TECH_LEAD_FEATURES.slice(0, 6).map((f) => f.id))
  );
  const [config, setConfig] = useState<ExecutionConfig>({
    environment: 'staging',
    browser: 'chromium',
    parallelInstances: 5,
  });

  const {
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
  } = useExecutionSimulation();

  // Notify parent when execution completes with generated runs
  useEffect(() => {
    if (generatedRuns.length > 0 && onTestRunsGenerated) {
      onTestRunsGenerated(generatedRuns);
    }
  }, [generatedRuns, onTestRunsGenerated]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(TECH_LEAD_FEATURES.map((f) => f.id)));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleExecute = useCallback(() => {
    const selected = TECH_LEAD_FEATURES.filter((f) => selectedIds.has(f.id));
    execute(selected, config);
  }, [selectedIds, config, execute]);

  const isRunning = phase === 'running';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(34, 211, 238, 0.15)' }}
        >
          <Terminal className="w-4 h-4" style={{ color: 'var(--chart-secondary)' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Execution Console
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Select features and configure test execution
          </p>
        </div>
        <ActionButtons
          phase={phase}
          selectedCount={selectedIds.size}
          onExecute={handleExecute}
          onReset={reset}
        />
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Feature Selection + Configuration (shown when not running) */}
        <AnimatePresence mode="wait">
          {phase !== 'running' && phase !== 'complete' && (
            <motion.div
              key="config"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <FeatureSelectionPanel
                selectedIds={selectedIds}
                onToggle={handleToggle}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
                disabled={isRunning}
              />
              <div
                className="pt-4 border-t"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <ConfigurationBar
                  config={config}
                  onChange={setConfig}
                  disabled={isRunning}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Execution Status (shown when running or complete) */}
        <AnimatePresence>
          {(phase === 'running' || phase === 'complete') && (
            <ExecutionStatusPanel
              phase={phase}
              featureStates={featureStates}
              consoleLogs={consoleLogs}
              overallProgress={overallProgress}
              passCount={passCount}
              failCount={failCount}
              activeSlots={activeSlots}
              parallelInstances={config.parallelInstances}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
