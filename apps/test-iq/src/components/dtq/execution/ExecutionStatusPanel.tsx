'use client';

import { memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { FeatureExecutionState, ConsoleLogEntry, ExecutionPhase } from '@/lib/dtq/types';

interface ExecutionStatusPanelProps {
  phase: ExecutionPhase;
  featureStates: FeatureExecutionState[];
  consoleLogs: ConsoleLogEntry[];
  overallProgress: number;
  passCount: number;
  failCount: number;
  activeSlots: number;
  parallelInstances: number;
  elapsedSeconds: number;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const LOG_COLORS: Record<ConsoleLogEntry['level'], string> = {
  info: 'var(--text-muted)',
  success: 'var(--status-success)',
  error: 'var(--status-error)',
  warning: 'var(--status-warning)',
};

export default memo(function ExecutionStatusPanel({
  phase,
  featureStates,
  consoleLogs,
  overallProgress,
  passCount,
  failCount,
  activeSlots,
  parallelInstances,
  elapsedSeconds,
}: ExecutionStatusPanelProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs.length]);

  const completedCount = passCount + failCount;
  const totalCount = featureStates.length;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {phase === 'running' && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--chart-secondary)' }} />
            )}
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {phase === 'running'
                ? `Running... ${completedCount}/${totalCount} features`
                : `Complete: ${completedCount}/${totalCount} features`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ⏱️ {formatElapsed(elapsedSeconds)} elapsed
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--chart-secondary)' }}>
              {overallProgress}%
            </span>
          </div>
        </div>
        <div className="execution-progress-bar">
          <motion.div
            className="execution-progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.2, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Parallel Instance Dots */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider font-medium mr-1" style={{ color: 'var(--text-muted)' }}>
          Slots
        </span>
        {Array.from({ length: Math.min(parallelInstances, 20) }, (_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-colors"
            style={{
              background: i < activeSlots ? 'var(--chart-secondary)' : 'var(--bg-hover)',
              boxShadow: i < activeSlots ? '0 0 6px rgba(34, 211, 238, 0.4)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Pass/Fail Counters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--status-success)' }}>
            {passCount}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>passed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-error)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--status-error)' }}>
            {failCount}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>failed</span>
        </div>
      </div>

      {/* Per-Feature Mini Progress Bars */}
      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
        {featureStates.map((fs) => (
          <div key={fs.featureId} className="flex items-center gap-2">
            <span
              className="text-[11px] w-36 truncate shrink-0"
              style={{
                color:
                  fs.status === 'passed'
                    ? 'var(--status-success)'
                    : fs.status === 'failed'
                    ? 'var(--status-error)'
                    : 'var(--text-muted)',
              }}
            >
              {fs.featureName}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    fs.status === 'passed'
                      ? 'var(--status-success)'
                      : fs.status === 'failed'
                      ? 'var(--status-error)'
                      : 'var(--chart-secondary)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${fs.progress}%` }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </div>
            <span className="text-[10px] w-8 text-right" style={{ color: 'var(--text-muted)' }}>
              {fs.status === 'passed' ? '✓' : fs.status === 'failed' ? '✗' : `${Math.round(fs.progress)}%`}
            </span>
          </div>
        ))}
      </div>

      {/* Console Log */}
      <div
        className="execution-console-log rounded-lg p-3 max-h-[140px] overflow-y-auto"
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {consoleLogs.slice(-10).map((log) => (
          <div key={log.id} className="text-[11px] leading-relaxed">
            <span style={{ color: 'var(--text-disabled)' }}>
              {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
            </span>{' '}
            <span style={{ color: LOG_COLORS[log.level] }}>{log.message}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </motion.div>
  );
});
