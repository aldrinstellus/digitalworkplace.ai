'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, TestTube2, AlertCircle } from 'lucide-react';
import { TestRun } from '@/lib/dtq/types';
import { AnimatedCounter, ScaleOnHover } from '@/lib/motion';

// Format the executed date as relative time (computed from props)
function formatTimeAgo(executedAt: Date): string {
  // Use the executedAt date directly without Date.now()
  // This is a display-only calculation based on prop value
  const now = new Date();
  const daysAgo = Math.floor((now.getTime() - executedAt.getTime()) / (1000 * 60 * 60 * 24));
  return daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
}

interface ReportCardProps {
  report: TestRun;
  delay?: number;
  onViewIssues?: () => void;
}

export default memo(function ReportCard({ report, delay = 0, onViewIssues }: ReportCardProps) {
  // Format time on initial render - this is display only and based on props
  const timeAgo = formatTimeAgo(report.executedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <ScaleOnHover scale={1.02}>
        <div className="card rounded-xl p-5 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {report.featureName}
              </h3>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-4 h-4" />
                <span>Executed {timeAgo}</span>
              </div>
            </div>

            {/* Status badge — CSS animation for failed glow */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                report.status === 'passed' ? 'badge-success' : 'badge-error'
              } ${report.status === 'failed' ? 'failed-badge-glow' : ''}`}
            >
              {report.status === 'passed' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Passed</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Failed</span>
                </>
              )}
            </div>
          </div>

          {/* Stats with animated counters — CSS hover instead of Framer Motion */}
          <div className="grid grid-cols-4 gap-4">
            <div
              className="stat-card text-center p-3 rounded-lg"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <TestTube2 className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={report.totalTests} duration={0.5} />
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Tests</p>
            </div>

            <div
              className="stat-card text-center p-3 rounded-lg"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--status-success)' }} />
              <p className="text-lg font-semibold" style={{ color: 'var(--status-success)' }}>
                <AnimatedCounter value={report.passedTests} duration={0.5} />
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Passed</p>
            </div>

            <div
              className="stat-card text-center p-3 rounded-lg"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <XCircle
                className="w-5 h-5 mx-auto mb-1"
                style={{ color: report.failedTests > 0 ? 'var(--status-error)' : 'var(--text-muted)' }}
              />
              <p
                className="text-lg font-semibold"
                style={{ color: report.failedTests > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}
              >
                <AnimatedCounter value={report.failedTests} duration={0.5} />
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Failed</p>
            </div>

            <div
              className="stat-card text-center p-3 rounded-lg"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <Clock className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {report.duration}s
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Duration</p>
            </div>
          </div>

          {/* View Issues button with hover scale */}
          {report.status === 'failed' && report.issues && report.issues.length > 0 && (
            <motion.button
              onClick={onViewIssues}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                color: 'var(--status-error)',
              }}
              whileHover={{
                scale: 1.02,
                background: 'rgba(248, 113, 113, 0.15)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <AlertCircle className="w-4 h-4" />
              View Issues ({report.issues.length})
            </motion.button>
          )}
        </div>
      </ScaleOnHover>
    </motion.div>
  );
});
